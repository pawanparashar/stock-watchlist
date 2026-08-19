// Cloudflare Worker proxy for the stock watchlist.
// Fetches daily OHLCV bars from Alpaca's Market Data API and computes all
// indicators server-side so the frontend stays a single dependency-free HTML file.

const ALLOWED_ORIGIN = "https://pawanparashar.github.io";
const ALPACA_BARS_URL = "https://data.alpaca.markets/v2/stocks/bars";
const LOOKBACK_DAYS = 800; // calendar days; yields ~550 trading days, comfortably covering the 365d window + indicator warm-up
const WINDOWS = [7, 15, 30, 90, 180, 365];

// Sticker Price (Rule #1 / Phil Town style valuation) — a completely separate,
// low-frequency path from the daily technical indicators above. Fundamentals
// change quarterly, not daily, so this is only computed when the frontend
// explicitly asks for mode=sticker, not on every Refresh click.
const SEC_USER_AGENT = "PawanRadar pawan227@gmail.com";
const SEC_TICKERS_URL = "https://www.sec.gov/files/company_tickers.json";
const SEC_CONCEPT_URL = "https://data.sec.gov/api/xbrl/companyconcept/CIK{cik}/us-gaap/{tag}.json";
const STICKER_LOOKBACK_DAYS = 3800; // ~10.4 years, for historical annual prices to pair with EPS years
const MARR = 0.15; // Rule One's default minimum acceptable rate of return
const PROJECTION_YEARS = 10;
const MAX_GROWTH_RATE = 0.20; // conservative cap even if raw historical CAGR is higher
const MAX_FUTURE_PE = 40;
const MIN_FUTURE_PE = 8;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json" }, corsHeaders()),
  });
}

// ---- Math helpers ----

function round(n, dp) {
  if (n === null || n === undefined || isNaN(n)) return null;
  var f = Math.pow(10, dp === undefined ? 2 : dp);
  return Math.round(n * f) / f;
}

// EMA series aligned to input length; entries before the seed index are null.
// Seeds with the SMA of the first `period` values, Wilder/standard EMA style.
function emaSeries(values, period) {
  var out = new Array(values.length).fill(null);
  if (values.length < period) return out;
  var k = 2 / (period + 1);
  var sum = 0;
  for (var i = 0; i < period; i++) sum += values[i];
  out[period - 1] = sum / period;
  for (var i = period; i < values.length; i++) {
    out[i] = values[i] * k + out[i - 1] * (1 - k);
  }
  return out;
}

function computeRSI(closes, period) {
  period = period || 14;
  if (closes.length < period + 1) return null;
  var gains = 0, losses = 0;
  for (var i = 1; i <= period; i++) {
    var diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  var avgGain = gains / period, avgLoss = losses / period;
  for (var i = period + 1; i < closes.length; i++) {
    var diff = closes[i] - closes[i - 1];
    var gain = diff > 0 ? diff : 0;
    var loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  if (avgLoss === 0) return 100;
  var rs = avgGain / avgLoss;
  return round(100 - 100 / (1 + rs), 0);
}

function computeTrend(closes) {
  if (closes.length < 50) return null;
  var ema20 = emaSeries(closes, 20);
  var ema50 = emaSeries(closes, 50);
  var last = closes.length - 1;
  if (ema20[last] === null || ema50[last] === null) return null;
  return ema20[last] > ema50[last] ? "up" : "down";
}

function computeRelVol(volumes) {
  if (volumes.length < 21) return null;
  var last = volumes.length - 1;
  var sum = 0;
  for (var i = last - 20; i < last; i++) sum += volumes[i];
  var avg = sum / 20;
  if (avg <= 0) return null;
  return round(volumes[last] / avg, 2);
}

// Slow stochastic (14,3,3): raw %K smoothed over 3 periods, %D is a 3-period
// SMA of that smoothed %K. Reacts to the last few days far more than RSI(14),
// which is what catches sharp 2-4 day reversals RSI is too slow to flag.
function computeStochastic(highs, lows, closes, period, kSmooth, dSmooth) {
  period = period || 14; kSmooth = kSmooth || 3; dSmooth = dSmooth || 3;
  var n = closes.length;
  if (n < period + kSmooth + dSmooth) return null;

  var rawK = [];
  for (var i = period - 1; i < n; i++) {
    var hh = -Infinity, ll = Infinity;
    for (var j = i - period + 1; j <= i; j++) {
      if (highs[j] > hh) hh = highs[j];
      if (lows[j] < ll) ll = lows[j];
    }
    var range = hh - ll;
    rawK.push(range === 0 ? 50 : ((closes[i] - ll) / range) * 100);
  }
  if (rawK.length < kSmooth + dSmooth) return null;

  function sma(values, p) {
    var out = new Array(values.length).fill(null);
    for (var i = p - 1; i < values.length; i++) {
      var sum = 0;
      for (var j = i - p + 1; j <= i; j++) sum += values[j];
      out[i] = sum / p;
    }
    return out;
  }

  var slowK = sma(rawK, kSmooth);
  var slowKvalues = slowK.filter(function (v) { return v !== null; });
  var slowD = sma(slowKvalues, dSmooth);

  var k = slowKvalues[slowKvalues.length - 1];
  var d = slowD[slowD.length - 1];
  if (k === undefined || d === null || d === undefined) return null;
  return { k: round(k, 0), d: round(d, 0), oversold: k <= 20, overbought: k >= 80 };
}

function computeMACD(closes) {
  if (closes.length < 35) return null;
  var emaFast = emaSeries(closes, 12);
  var emaSlow = emaSeries(closes, 26);
  var macdLine = [];
  var macdIndexOffset = -1;
  for (var i = 0; i < closes.length; i++) {
    if (emaFast[i] === null || emaSlow[i] === null) continue;
    if (macdIndexOffset === -1) macdIndexOffset = i;
    macdLine.push(emaFast[i] - emaSlow[i]);
  }
  if (macdLine.length < 9) return null;
  var signalLine = emaSeries(macdLine, 9);
  var lastMacd = macdLine[macdLine.length - 1];
  var lastSignal = signalLine[signalLine.length - 1];
  if (lastSignal === null) return null;
  return { bullish: lastMacd > lastSignal };
}

// Wilder ATR (also reused as the DMI/ADX true-range smoothing).
function wilderATRSeries(highs, lows, closes, period) {
  var n = closes.length;
  var tr = new Array(n).fill(null);
  for (var i = 1; i < n; i++) {
    tr[i] = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
  }
  var atr = new Array(n).fill(null);
  if (n <= period) return atr;
  var sum = 0;
  for (var i = 1; i <= period; i++) sum += tr[i];
  atr[period] = sum / period;
  for (var i = period + 1; i < n; i++) {
    atr[i] = (atr[i - 1] * (period - 1) + tr[i]) / period;
  }
  return atr;
}

function computeATR14(highs, lows, closes) {
  var atr = wilderATRSeries(highs, lows, closes, 14);
  var last = atr[atr.length - 1];
  return last === null ? null : round(last, 2);
}

function computeADX(highs, lows, closes, period) {
  period = period || 14;
  var n = closes.length;
  if (n < period * 2 + 1) return null;

  var plusDM = new Array(n).fill(0);
  var minusDM = new Array(n).fill(0);
  var tr = new Array(n).fill(0);
  for (var i = 1; i < n; i++) {
    var upMove = highs[i] - highs[i - 1];
    var downMove = lows[i - 1] - lows[i];
    plusDM[i] = (upMove > downMove && upMove > 0) ? upMove : 0;
    minusDM[i] = (downMove > upMove && downMove > 0) ? downMove : 0;
    tr[i] = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
  }

  // Wilder-smooth TR, +DM, -DM starting at index `period`.
  var smTR = 0, smPlusDM = 0, smMinusDM = 0;
  for (var i = 1; i <= period; i++) {
    smTR += tr[i]; smPlusDM += plusDM[i]; smMinusDM += minusDM[i];
  }

  var dxValues = [];
  for (var i = period + 1; i < n; i++) {
    smTR = smTR - smTR / period + tr[i];
    smPlusDM = smPlusDM - smPlusDM / period + plusDM[i];
    smMinusDM = smMinusDM - smMinusDM / period + minusDM[i];
    var plusDI = smTR === 0 ? 0 : (100 * smPlusDM) / smTR;
    var minusDI = smTR === 0 ? 0 : (100 * smMinusDM) / smTR;
    var dx = (plusDI + minusDI) === 0 ? 0 : (100 * Math.abs(plusDI - minusDI)) / (plusDI + minusDI);
    dxValues.push(dx);
  }
  if (dxValues.length < period) return null;

  var adx = 0;
  for (var i = 0; i < period; i++) adx += dxValues[i];
  adx = adx / period;
  for (var i = period; i < dxValues.length; i++) {
    adx = (adx * (period - 1) + dxValues[i]) / period;
  }
  return { value: round(adx, 0), strong: adx > 25 };
}

function computeSupertrend(highs, lows, closes, period, multiplier) {
  period = period || 10;
  multiplier = multiplier || 3;
  var n = closes.length;
  if (n < period + 2) return null;

  var atr = wilderATRSeries(highs, lows, closes, period);
  var finalUpper = new Array(n).fill(null);
  var finalLower = new Array(n).fill(null);
  var dir = new Array(n).fill(null); // 1 = up, -1 = down
  var st = new Array(n).fill(null);

  var start = period + 1; // first index with a usable ATR value at [period]
  for (var i = start; i < n; i++) {
    if (atr[i] === null) continue;
    var mid = (highs[i] + lows[i]) / 2;
    var basicUpper = mid + multiplier * atr[i];
    var basicLower = mid - multiplier * atr[i];

    if (finalUpper[i - 1] === null) {
      finalUpper[i] = basicUpper;
      finalLower[i] = basicLower;
      dir[i] = closes[i] >= basicLower ? 1 : -1;
      st[i] = dir[i] === 1 ? finalLower[i] : finalUpper[i];
      continue;
    }

    finalUpper[i] = (basicUpper < finalUpper[i - 1] || closes[i - 1] > finalUpper[i - 1]) ? basicUpper : finalUpper[i - 1];
    finalLower[i] = (basicLower > finalLower[i - 1] || closes[i - 1] < finalLower[i - 1]) ? basicLower : finalLower[i - 1];

    if (dir[i - 1] === 1) {
      dir[i] = closes[i] < finalLower[i] ? -1 : 1;
    } else {
      dir[i] = closes[i] > finalUpper[i] ? 1 : -1;
    }
    st[i] = dir[i] === 1 ? finalLower[i] : finalUpper[i];
  }

  var last = n - 1;
  if (st[last] === null) return null;
  return { direction: dir[last] === 1 ? "up" : "down", value: round(st[last], 2) };
}

function computeBollinger(closes, period, mult) {
  period = period || 20;
  mult = mult || 2;
  if (closes.length < period) return null;
  var last = closes.length - 1;
  var slice = closes.slice(last - period + 1, last + 1);
  var mean = slice.reduce(function (a, b) { return a + b; }, 0) / period;
  var variance = slice.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / period;
  var sd = Math.sqrt(variance);
  var upper = mean + mult * sd;
  var lower = mean - mult * sd;
  var price = closes[last];
  var breach = price > upper ? "upper" : (price < lower ? "lower" : null);
  return { upper: round(upper, 2), lower: round(lower, 2), breach: breach };
}

function computeWindows(highs, lows, price) {
  var out = {};
  var n = highs.length;
  for (var w = 0; w < WINDOWS.length; w++) {
    var wSize = WINDOWS[w];
    // Use the `wSize` bars *before* the latest one, so "broken" means the
    // current price fell outside the prior window's range.
    if (n < wSize + 1) continue;
    var lastIdx = n - 1;
    var start = lastIdx - wSize;
    var end = lastIdx - 1;
    var lo = Infinity, hi = -Infinity;
    for (var i = start; i <= end; i++) {
      if (lows[i] < lo) lo = lows[i];
      if (highs[i] > hi) hi = highs[i];
    }
    out[wSize + "d"] = { low: round(lo, 2), high: round(hi, 2) };
  }
  return out;
}

function computeRow(symbol, bars) {
  if (!bars || bars.length === 0) {
    return { symbol: symbol, error: "No data available" };
  }
  var closes = bars.map(function (b) { return b.c; });
  var highs = bars.map(function (b) { return b.h; });
  var lows = bars.map(function (b) { return b.l; });
  var volumes = bars.map(function (b) { return b.v; });
  var price = closes[closes.length - 1];

  var row = {
    symbol: symbol,
    price: round(price, 2),
    windows: computeWindows(highs, lows, price),
    rsi: computeRSI(closes, 14),
    trend: computeTrend(closes),
    relVol: computeRelVol(volumes),
    atr: computeATR14(highs, lows, closes),
  };

  var macd = computeMACD(closes);
  row.macd = macd;

  var adx = computeADX(highs, lows, closes, 14);
  row.adx = adx;

  var supertrend = computeSupertrend(highs, lows, closes, 10, 3);
  row.supertrend = supertrend;

  var bbands = computeBollinger(closes, 20, 2);
  row.bbands = bbands;

  var stochastic = computeStochastic(highs, lows, closes, 14, 3, 3);
  row.stochastic = stochastic;

  return row;
}

async function fetchAllBars(symbols, apiKeyId, apiSecret, endDateStr) {
  var end = endDateStr ? new Date(endDateStr + "T23:59:59Z") : new Date();
  var start = new Date(end.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  var startStr = start.toISOString().slice(0, 10);

  var barsBySymbol = {};
  symbols.forEach(function (s) { barsBySymbol[s] = []; });

  var pageToken = null;
  var feed = "sip";
  var attemptedIexFallback = false;

  for (var page = 0; page < 20; page++) {
    var url = new URL(ALPACA_BARS_URL);
    url.searchParams.set("symbols", symbols.join(","));
    url.searchParams.set("timeframe", "1Day");
    url.searchParams.set("start", startStr);
    if (endDateStr) url.searchParams.set("end", endDateStr);
    url.searchParams.set("limit", "10000");
    url.searchParams.set("adjustment", "split");
    url.searchParams.set("sort", "asc");
    url.searchParams.set("feed", feed);
    if (pageToken) url.searchParams.set("page_token", pageToken);

    var res = await fetch(url.toString(), {
      headers: {
        "APCA-API-KEY-ID": apiKeyId,
        "APCA-API-SECRET-KEY": apiSecret,
      },
    });

    if (!res.ok) {
      var bodyText = await res.text();
      // Some account tiers can't use the sip feed for historical bars; retry once with iex.
      if (res.status === 403 && feed === "sip" && !attemptedIexFallback) {
        attemptedIexFallback = true;
        feed = "iex";
        pageToken = null;
        page = -1; // restart loop from the top
        continue;
      }
      throw new Error("Alpaca request failed: " + res.status + " " + bodyText);
    }

    var json = await res.json();
    var barsObj = json.bars || {};
    Object.keys(barsObj).forEach(function (sym) {
      if (!barsBySymbol[sym]) barsBySymbol[sym] = [];
      barsBySymbol[sym] = barsBySymbol[sym].concat(barsObj[sym]);
    });

    pageToken = json.next_page_token;
    if (!pageToken) break;
  }

  return barsBySymbol;
}

// ---- Sticker Price (SEC EDGAR fundamentals) ----

var cikMapCache = null;

async function fetchCikMap() {
  if (cikMapCache) return cikMapCache;
  var res = await fetch(SEC_TICKERS_URL, { headers: { "User-Agent": SEC_USER_AGENT } });
  if (!res.ok) throw new Error("SEC ticker lookup failed: " + res.status);
  var json = await res.json();
  var map = {};
  Object.keys(json).forEach(function (k) {
    var row = json[k];
    map[row.ticker.toUpperCase()] = row.cik_str;
  });
  cikMapCache = map;
  return map;
}

function periodDays(v) {
  var s = new Date(v.start), e = new Date(v.end);
  return Math.round((e - s) / (24 * 60 * 60 * 1000));
}

// Fetches annual (10-K) EPS history for one CIK, deduped to one value per
// true annual period (330-380 day span), keeping the most-recently-filed
// restatement of each period.
async function fetchAnnualEPS(cik) {
  var cikStr = String(cik).padStart(10, "0");
  var tags = ["EarningsPerShareDiluted", "EarningsPerShareBasic"];
  for (var t = 0; t < tags.length; t++) {
    var url = SEC_CONCEPT_URL.replace("{cik}", cikStr).replace("{tag}", tags[t]);
    var res = await fetch(url, { headers: { "User-Agent": SEC_USER_AGENT } });
    if (!res.ok) continue;
    var json = await res.json();
    var vals = (json.units && json.units["USD/shares"]) || [];
    var annual = vals.filter(function (v) {
      return v.form === "10-K" && v.fp === "FY" && v.start && periodDays(v) >= 330 && periodDays(v) <= 380;
    });
    var byEnd = {};
    annual.forEach(function (v) {
      if (!byEnd[v.end] || v.filed > byEnd[v.end].filed) byEnd[v.end] = v;
    });
    var series = Object.keys(byEnd).map(function (end) { return byEnd[end]; }).sort(function (a, b) {
      return a.end < b.end ? -1 : 1;
    });
    if (series.length > 0) return series;
  }
  return [];
}

// Walk backward from the most recent year; stop (truncate) at the first
// year-over-year ratio outside [0.4, 2.5] or non-positive EPS, since that
// signals a stock split or other discontinuity SEC's raw figures don't
// self-adjust for. Keeps only the clean, internally-consistent recent segment.
function cleanEpsSeries(series) {
  if (series.length === 0) return [];
  var kept = [series[series.length - 1]];
  for (var i = series.length - 2; i >= 0; i--) {
    var newer = kept[0].val, older = series[i].val;
    if (older <= 0 || newer <= 0) break;
    var ratio = newer / older;
    if (ratio < 0.4 || ratio > 2.5) break;
    kept.unshift(series[i]);
  }
  return kept;
}

function computeGrowthRate(cleanSeries) {
  if (cleanSeries.length < 3) return null;
  var first = cleanSeries[0], last = cleanSeries[cleanSeries.length - 1];
  var years = (new Date(last.end) - new Date(first.end)) / (365.25 * 24 * 60 * 60 * 1000);
  if (years < 1.5) return null;
  var rawRate = Math.pow(last.val / first.val, 1 / years) - 1;
  return { raw: rawRate, capped: Math.min(rawRate, MAX_GROWTH_RATE), years: years };
}

// Nearest trading-day close on/before a given date, from a chronological bars array.
function closeNear(bars, dateStr) {
  var target = new Date(dateStr).getTime();
  var best = null;
  for (var i = 0; i < bars.length; i++) {
    var t = new Date(bars[i].t).getTime();
    if (t <= target) best = bars[i];
    else break;
  }
  return best ? best.c : null;
}

async function fetchStickerPrices(symbols, apiKeyId, apiSecret) {
  var cikMap = await fetchCikMap();

  var end = new Date();
  var start = new Date(end.getTime() - STICKER_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  var barsBySymbol = await fetchAllBarsRange(symbols, apiKeyId, apiSecret, start.toISOString().slice(0, 10), null);

  var results = [];
  for (var i = 0; i < symbols.length; i++) {
    var sym = symbols[i];
    var cik = cikMap[sym];
    if (!cik) {
      results.push({ symbol: sym, error: "No SEC filer found for this ticker" });
      continue;
    }

    var epsSeries;
    try {
      epsSeries = await fetchAnnualEPS(cik);
    } catch (err) {
      results.push({ symbol: sym, error: "SEC EPS lookup failed: " + err.message });
      continue;
    }

    var clean = cleanEpsSeries(epsSeries);
    var growth = computeGrowthRate(clean);
    if (!growth || growth.capped <= 0) {
      results.push({ symbol: sym, error: "No reliable positive earnings growth found (recent split, negative earnings, or too little history)" });
      continue;
    }

    var bars = barsBySymbol[sym] || [];
    var peSamples = [];
    clean.forEach(function (pt) {
      var price = closeNear(bars, pt.end);
      if (price && pt.val > 0) {
        var pe = price / pt.val;
        if (pe > 0 && pe < 200) peSamples.push(pe);
      }
    });
    var historicalAvgPE = peSamples.length > 0 ? peSamples.reduce(function (a, b) { return a + b; }, 0) / peSamples.length : null;

    var growthCapPE = growth.capped * 100 * 2;
    var futurePE = historicalAvgPE !== null ? Math.min(historicalAvgPE, growthCapPE) : growthCapPE;
    futurePE = Math.max(MIN_FUTURE_PE, Math.min(MAX_FUTURE_PE, futurePE));

    var currentEPS = clean[clean.length - 1].val;
    var futureEPS = currentEPS * Math.pow(1 + growth.capped, PROJECTION_YEARS);
    var futurePrice = futureEPS * futurePE;
    var stickerPrice = futurePrice / Math.pow(1 + MARR, PROJECTION_YEARS);
    var mosPrice = stickerPrice * 0.5;

    var currentPrice = bars.length > 0 ? bars[bars.length - 1].c : null;

    results.push({
      symbol: sym,
      currentPrice: round(currentPrice, 2),
      currentEPS: round(currentEPS, 2),
      growthRate: round(growth.capped * 100, 1),
      growthRateRaw: round(growth.raw * 100, 1),
      yearsOfData: round(growth.years, 1),
      historicalAvgPE: historicalAvgPE !== null ? round(historicalAvgPE, 1) : null,
      futurePE: round(futurePE, 1),
      stickerPrice: round(stickerPrice, 2),
      mosPrice: round(mosPrice, 2),
      latestFiscalYearEnd: clean[clean.length - 1].end,
    });
  }
  return results;
}

// Same paging logic as fetchAllBars but with an explicit start/end range,
// used for the longer sticker-price lookback rather than the daily indicator one.
async function fetchAllBarsRange(symbols, apiKeyId, apiSecret, startStr, endDateStr) {
  var barsBySymbol = {};
  symbols.forEach(function (s) { barsBySymbol[s] = []; });

  var pageToken = null;
  var feed = "sip";
  var attemptedIexFallback = false;

  for (var page = 0; page < 20; page++) {
    var url = new URL(ALPACA_BARS_URL);
    url.searchParams.set("symbols", symbols.join(","));
    url.searchParams.set("timeframe", "1Day");
    url.searchParams.set("start", startStr);
    if (endDateStr) url.searchParams.set("end", endDateStr);
    url.searchParams.set("limit", "10000");
    url.searchParams.set("adjustment", "split");
    url.searchParams.set("sort", "asc");
    url.searchParams.set("feed", feed);
    if (pageToken) url.searchParams.set("page_token", pageToken);

    var res = await fetch(url.toString(), {
      headers: { "APCA-API-KEY-ID": apiKeyId, "APCA-API-SECRET-KEY": apiSecret },
    });

    if (!res.ok) {
      var bodyText = await res.text();
      if (res.status === 403 && feed === "sip" && !attemptedIexFallback) {
        attemptedIexFallback = true;
        feed = "iex";
        pageToken = null;
        page = -1;
        continue;
      }
      throw new Error("Alpaca request failed: " + res.status + " " + bodyText);
    }

    var json = await res.json();
    var barsObj = json.bars || {};
    Object.keys(barsObj).forEach(function (sym) {
      if (!barsBySymbol[sym]) barsBySymbol[sym] = [];
      barsBySymbol[sym] = barsBySymbol[sym].concat(barsObj[sym]);
    });

    pageToken = json.next_page_token;
    if (!pageToken) break;
  }

  return barsBySymbol;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    var url = new URL(request.url);
    var symbolsParam = url.searchParams.get("symbols");
    if (!symbolsParam) {
      return jsonResponse({ error: "Missing symbols query parameter" }, 400);
    }
    var symbols = symbolsParam.split(",").map(function (s) { return s.trim().toUpperCase(); }).filter(Boolean);
    if (symbols.length === 0) {
      return jsonResponse({ error: "No valid symbols provided" }, 400);
    }

    var endDateStr = url.searchParams.get("end");
    if (endDateStr && !/^\d{4}-\d{2}-\d{2}$/.test(endDateStr)) {
      return jsonResponse({ error: "end must be YYYY-MM-DD" }, 400);
    }

    if (!env.ALPACA_API_KEY_ID || !env.ALPACA_API_SECRET_KEY) {
      return jsonResponse({ error: "Worker is missing Alpaca API credentials" }, 500);
    }

    var mode = url.searchParams.get("mode");
    if (mode === "sticker") {
      try {
        var stickerData = await fetchStickerPrices(symbols, env.ALPACA_API_KEY_ID, env.ALPACA_API_SECRET_KEY);
        return jsonResponse({ data: stickerData, updated: new Date().toISOString() });
      } catch (err) {
        return jsonResponse({ error: err.message || "Unknown error" }, 502);
      }
    }

    try {
      var barsBySymbol = await fetchAllBars(symbols, env.ALPACA_API_KEY_ID, env.ALPACA_API_SECRET_KEY, endDateStr);
      var data = symbols.map(function (sym) { return computeRow(sym, barsBySymbol[sym]); });
      return jsonResponse({ data: data, updated: new Date().toISOString(), asOf: endDateStr || null });
    } catch (err) {
      return jsonResponse({ error: err.message || "Unknown error" }, 502);
    }
  },
};
