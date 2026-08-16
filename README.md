# stock-watchlist

Personal swing-trade watchlist. One card per ticker, showing rolling high/low
windows and a handful of technical indicators, computed from daily bars pulled
through a Cloudflare Worker proxy (so the frontend never holds API keys).

- Live site: https://pawanparashar.github.io/stock-watchlist/
- Frontend: [index.html](index.html) — plain HTML/CSS/JS, no build step
- Backend: [worker/worker.js](worker/worker.js) — Cloudflare Worker, fetches
  daily bars from Alpaca and computes all indicators server-side
- Data only loads when you click **Refresh** — there's no auto-polling.

## How to read a card

**Price & ATR** — top-left: last close, and ATR(14) in small text next to it
(a rough measure of daily price movement — handy for eyeballing a stop
distance, e.g. `entry - 1.5x ATR`).

**Top-right badge — "Below Nd low" / "Above Nd high" / "No new low/high"**
The headline signal: has today's price broken outside the last N days'
range? If more than one window is broken, the badge shows the deepest one
(the card's left border color matches it too).

Lows (amber → red) are the original "spot the dip" signal — darker/redder
means a bigger, older low just got broken:

| Badge | Meaning |
|---|---|
| Below 7d low | light amber |
| Below 15d low | amber |
| Below 30d low | amber/orange |
| Below 90d low | dark orange/brown |
| Below 180d low | light red |
| Below 365d low | dark red |

Highs (light → dark blue) are the mirror-image "extended / consider taking
profit" signal, added once this page started tracking sell-side signals too
— darker blue means a bigger, older high just got broken:

| Badge | Meaning |
|---|---|
| Above 7d high | light blue |
| Above 15d high | blue |
| Above 30d high | medium blue |
| Above 90d high | darker blue |
| Above 180d high | navy |
| Above 365d high | dark navy |

A ticker can only break one side on a given day, never both. Blue is used
specifically so it never gets confused with the low-break ramp — same idea,
opposite direction. In the windows grid at the bottom of each card, whichever
side (L or H) got broken is bolded and colored to match.

**Badges row** — secondary signals, only shown when relevant:

- **RSI NN** — 14-period RSI. Flagged "oversold" ≤30, "overbought" ≥70.
- **Stoch NN** — slow Stochastic(14,3,3), the %K value. Flagged "oversold" ≤20,
  "overbought" ≥80. Reacts much faster than RSI(14) to a sharp 2-4 day move —
  RSI can sit near-neutral at the exact top or bottom of a quick swing while
  Stochastic already reads extreme, which is the gap it's meant to cover.
- **Uptrend / Downtrend** — EMA(20) vs EMA(50).
- **N.Nx volume** — today's volume vs the 20-day average, shown only when ≥1.5x.
- **MACD bullish / bearish** — MACD(12,26,9) line vs its signal line.
- **Strong trend (ADX NN)** / **Weak trend (ADX NN)** — DMI/ADX(14); "Strong"
  above 25, "Weak" below 20, no badge in between. Weak ADX matters to the
  composite signal below, not just display — see the scoring table.
- **Supertrend ▲ / ▼ $NN.NN** — Supertrend(10,3) direction; the dollar value
  doubles as a trailing-stop reference.
- **Above upper band / Below lower band** — price outside Bollinger Bands(20,2).

**Windows grid** — for each of 7d/15d/30d/90d/180d/365d, the low and high
over that window (the window is the N days *before* today, so "broken" means
today's price fell outside that prior range). A window shows "insufficient
history" if the ticker doesn't have enough daily bars yet (e.g. a recent
IPO) — that's expected, not a bug.

**Signal badge — Strong Buy / Buy / Hold / Sell / Strong Sell**
A single composite read, right under the price/ATR line. It's computed
client-side (in `index.html`, not the Worker) from the same badges on the
card — nothing extra is fetched for it. It's a summary of what the other
badges already say, not an independent signal, and it's specifically
weighted toward this page's original "spot the dip" philosophy — treat it as
a prompt to go read the actual badges, not something to act on blindly.

Scoring (`computeSignal` in index.html) is a set of independent votes, plus
one clustered vote — deliberately not "one indicator, one vote" across the
board:

| Signal | Vote |
|---|---|
| Low-break depth | +1 (7d/15d), +2 (30d/90d), +3 (180d/365d) |
| High-break depth (only if no low break) | −1 (7d/15d), −2 (30d/90d), −3 (180d/365d) |
| RSI ≤30 / ≥70 | +1 / −1 |
| Stochastic %K ≤20 / ≥80 | +1 / −1 |
| Bollinger breach | +1 below lower band / −1 above upper band |
| **Trend cluster** (Trend + MACD + Supertrend, combined) | ±1 × ADX multiplier — see below |
| RelVol, ATR | not scored — context only (conviction, volatility) |

**Why Trend/MACD/Supertrend are clustered instead of voting separately**:
they're three different formulas measuring essentially the same thing — is
price trending up or down — so they agree with each other far more often
than not. Giving each a full independent vote let them triple-count one
signal and outvote the genuinely distinct reversal indicators (RSI,
Stochastic, Bollinger, low/high-break) 3-to-1. They're combined into one
directional vote (sum their individual +1/−1's, take the sign) before
entering the score.

That combined vote is then scaled by ADX, which also no longer just adds
conviction one direction — it can subtract it:

- ADX > 25 (strong trend): cluster vote **×2**
- ADX 20–25 (moderate): cluster vote **×1**
- ADX < 20 (weak/choppy): cluster vote **×0** — a weak ADX means there isn't
  a real trend to confirm, so Trend/MACD/Supertrend are discounted entirely
  rather than letting them drag the score around on noise.

Total score → label: ≥5 Strong Buy, ≥2 Buy, ≥−1 Hold, ≥−4 Sell, else Strong
Sell. To change the weights or thresholds, edit `SIGNAL_TIERS`,
`LOW_BREAK_VOTE`, and the ADX multiplier logic in `index.html`.

This scoring was tuned against a real backtest (GOOGL/GOOG bottoming Jul 23
2026 and topping Aug 4 2026) where the pre-Stochastic, flat-voting version
scored both as Hold — the trend-cluster's 3 correlated votes canceled out the
correct reversal read from the low/high-break and Bollinger signals. With
clustering + ADX-as-discount + Stochastic, the same two dates score Buy and
Sell respectively.

**Sort dropdown** — biggest dip first (default, ranks by deepest broken
window) / strongest buy first (ranks by the signal badge) / ticker A-Z /
price high to low.

## Adding or removing tickers

Edit the `TICKERS` array near the top of the `<script>` block in
[index.html](index.html):

```js
var TICKERS = ["AAPL","NVDA","GOOGL","AMZN","GOOG","AVGO","META","TSLA","MU","AMD","INTC","CAT","NFLX","SPCX","CRM","NOW","PANW","DOCU"];
```

Add or remove symbols (they must be valid Alpaca/US-equity tickers), then
commit and push to `main` — GitHub Pages redeploys automatically within a
minute or two. No changes needed on the Worker side; it fetches whatever
symbols the frontend asks for.

## Backend / infrastructure

- **Cloudflare Worker** `stock-watchlist-proxy`, deployed at
  https://stock-watchlist-proxy.pawan227.workers.dev/ — fetches daily OHLCV
  bars from Alpaca's `/v2/stocks/bars` endpoint (split-adjusted, 1Day
  timeframe, ~800 days of lookback) and computes every indicator above from
  those same bars, so there's only one upstream API call per refresh.
- **Secrets** (set via `wrangler secret put`, not stored in this repo):
  `ALPACA_API_KEY_ID`, `ALPACA_API_SECRET_KEY` — from a free Alpaca paper
  trading account (market-data access only, no funding needed; the data API
  is identical between paper and live accounts).
- **Deploy the Worker**: from `worker/`, run `npx wrangler deploy`.
- **Backtesting**: the Worker accepts an optional `end=YYYY-MM-DD` query
  param, e.g. `?symbols=GOOGL&end=2026-07-23` — it returns every indicator
  computed as of that date's close, using only bars up to and including it.
  Not wired into the page UI; use it directly (curl, or a script) to check
  what the page would have shown on a past date against what actually
  happened.
- **Branding**: [assets/logo-header.jpg](assets/logo-header.jpg) is the full
  banner shown in place of a text title/header, cropped from a source brand
  image. [assets/favicon.png](assets/favicon.png) is a 180x180 crop of the
  icon mark alone, used as the browser-tab favicon.
