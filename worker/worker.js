// Cloudflare Worker proxy for the stock watchlist.
// Fetches daily OHLCV bars from Alpaca's Market Data API and computes all
// indicators server-side so the frontend stays a single dependency-free HTML file.

const ALLOWED_ORIGIN = "https://pawanparashar.github.io";
const ALPACA_BARS_URL = "https://data.alpaca.markets/v2/stocks/bars";
const LOOKBACK_DAYS = 800; // calendar days; yields ~550 trading days, comfortably covering the 365d window + indicator warm-up
const WINDOWS = [7, 15, 30, 90, 180, 365];

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

    try {
      var barsBySymbol = await fetchAllBars(symbols, env.ALPACA_API_KEY_ID, env.ALPACA_API_SECRET_KEY, endDateStr);
      var data = symbols.map(function (sym) { return computeRow(sym, barsBySymbol[sym]); });
      return jsonResponse({ data: data, updated: new Date().toISOString(), asOf: endDateStr || null });
    } catch (err) {
      return jsonResponse({ error: err.message || "Unknown error" }, 502);
    }
  },
};
