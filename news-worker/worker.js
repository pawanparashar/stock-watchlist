// Cloudflare Worker proxy for the News Digest page.
//
// The frontend (news.html) is a static page on GitHub Pages and can't fetch
// RSS feeds directly — none of the sources below send CORS headers, and
// parsing XML in the browser for a dozen feeds on every page load is wasteful.
// So this Worker fetches every feed server-side, parses out the handful of
// fields the page needs, sorts/dedupes/trims to the top N per category, and
// returns one small JSON blob. Edge-cached for a few minutes so a burst of
// page loads doesn't hammer the upstream feeds.

const ALLOWED_ORIGIN = "https://pawanparashar.github.io";
const ITEMS_PER_CATEGORY = 3;
const CACHE_TTL_SECONDS = 300; // 5 min — fresh enough for a "latest headlines" feed, gentle on upstream
const FETCH_TIMEOUT_MS = 8000;

// Each category merges 1-2 feeds, dedupes by link, sorts newest first, and
// keeps the top ITEMS_PER_CATEGORY. `source` is the human-readable label used
// when a feed doesn't carry its own per-item <source> tag (Google News does;
// most publisher feeds don't, since every item in the feed is from them).
const CATEGORIES = [
  {
    key: "usNews",
    label: "US News",
    feeds: [{ url: "https://feeds.npr.org/1001/rss.xml", source: "NPR" }],
  },
  {
    key: "usStocks",
    label: "US Stock News",
    feeds: [
      { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258", source: "CNBC" },
      { url: "https://feeds.content.dowjones.io/public/rss/mw_topstories", source: "MarketWatch" },
    ],
  },
  {
    key: "indiaNews",
    label: "India News",
    feeds: [
      { url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms", source: "Times of India" },
      { url: "https://www.thehindu.com/news/national/feeder/default.rss", source: "The Hindu" },
    ],
  },
  {
    key: "indiaStocks",
    label: "India Stock News",
    feeds: [
      { url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", source: "Economic Times" },
      { url: "https://www.livemint.com/rss/markets", source: "Livemint" },
    ],
  },
  {
    key: "world",
    label: "International News",
    feeds: [{ url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" }],
  },
  {
    key: "cricket",
    label: "Cricket News",
    feeds: [{ url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml", source: "ESPNcricinfo" }],
  },
  {
    key: "sports",
    label: "Sports News",
    feeds: [
      { url: "https://feeds.bbci.co.uk/sport/rss.xml", source: "BBC Sport" },
      { url: "https://www.espn.com/espn/rss/news", source: "ESPN" },
    ],
  },
  {
    key: "hyderabad",
    label: "Hyderabad News",
    feeds: [
      { url: "https://timesofindia.indiatimes.com/rssfeeds/-2128816011.cms", source: "Times of India" },
      { url: "https://www.thehindu.com/news/cities/Hyderabad/feeder/default.rss", source: "The Hindu" },
    ],
  },
  {
    key: "immigration",
    label: "US Immigration / H-1B News",
    feeds: [
      // Google News RSS blocks Cloudflare's shared egress IPs ("automated
      // queries" 503), so this uses Bing News search RSS instead — same
      // multi-publisher aggregation, works fine from Workers.
      { url: "https://www.bing.com/news/search?q=H-1B+visa&format=rss", source: "Bing News" },
    ],
  },
];

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

function decodeEntities(str) {
  if (!str) return str;
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-fA-F]+);/g, function (_, hex) { return String.fromCharCode(parseInt(hex, 16)); })
    .replace(/&#(\d+);/g, function (_, code) { return String.fromCharCode(parseInt(code, 10)); })
    .replace(/&amp;/g, "&")
    .trim();
}

function stripCdata(str) {
  if (!str) return str;
  var m = str.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return m ? m[1] : str;
}

function extractTag(block, tag) {
  var re = new RegExp("<" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + tag + ">", "i");
  var m = block.match(re);
  if (!m) return null;
  return decodeEntities(stripCdata(m[1]).trim());
}

// Bing News wraps every link in a "News:Source" click-tracker
// (bing.com/news/apiclick.aspx?...&url=<real article, URL-encoded>&...) —
// unwrap it so the page links straight to the publisher, not through Bing.
function unwrapBingLink(link) {
  if (!link || link.indexOf("bing.com/news/apiclick.aspx") === -1) return link;
  var m = link.match(/[?&]url=([^&]+)/);
  if (!m) return link;
  try {
    return decodeURIComponent(m[1]);
  } catch (err) {
    return link;
  }
}

// Strips any HTML tags a feed snuck into a title/description field (TOI's
// <description> is a full <a><img> blob, but we don't use that field — this
// guards titles too, just in case).
function stripTags(str) {
  return str ? str.replace(/<[^>]*>/g, "").trim() : str;
}

// Thumbnail image, when a feed includes one — tried in order of how common
// each pattern is across our feeds: <enclosure type="image/...">,
// <media:thumbnail>, <media:content medium="image">, Bing's <News:Image>
// (plain text URL), and ESPNcricinfo's <coverImages> (also plain text URL).
function toHttps(url) {
  if (!url) return url;
  return url.indexOf("http://") === 0 ? "https://" + url.slice(7) : url;
}

function extractImage(block) {
  var m =
    block.match(/<enclosure[^>]*\burl="([^"]+)"[^>]*\btype="image\/[^"]*"/i) ||
    block.match(/<enclosure[^>]*\btype="image\/[^"]*"[^>]*\burl="([^"]+)"/i);
  if (m) return m[1];

  m = block.match(/<media:thumbnail[^>]*\burl="([^"]+)"/i);
  if (m) return m[1];

  m =
    block.match(/<media:content[^>]*\burl="([^"]+)"[^>]*\bmedium="image"/i) ||
    block.match(/<media:content[^>]*\bmedium="image"[^>]*\burl="([^"]+)"/i);
  if (m) return m[1];

  var newsImage = extractTag(block, "News:Image");
  if (newsImage) return newsImage;

  var coverImage = extractTag(block, "coverImages");
  if (coverImage) return coverImage.split(",")[0].trim();

  return null;
}

var SUMMARY_MAX_CHARS = 160;

// Most feeds' <description> is a genuine 1-2 sentence summary; TOI/ET's is a
// full <a><img>...caption blob, Bing's is "quote..." with no real structure.
// Strip tags, collapse whitespace, cut cleanly at a word boundary, and bail
// out entirely if nothing meaningful is left (so a feed with a junk/empty
// description doesn't render an empty summary line).
function cleanSummary(rawDescription, title) {
  if (!rawDescription) return null;
  var text = stripTags(rawDescription).replace(/\s+/g, " ").trim();
  if (!text) return null;

  // Some feeds just repeat the title as the description — skip those too.
  if (text.toLowerCase() === (title || "").toLowerCase()) return null;
  // ESPN's live-score feed literally puts the string "null" here when a game
  // has no recap text yet.
  if (text.toLowerCase() === "null") return null;

  if (text.length <= SUMMARY_MAX_CHARS) return text;
  var cut = text.slice(0, SUMMARY_MAX_CHARS);
  var lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > 40) cut = cut.slice(0, lastSpace);
  return cut.trim() + "…";
}

function parseRssItems(xml, feedSource) {
  var items = [];
  var blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  blocks.forEach(function (block) {
    var rawTitle = extractTag(block, "title");
    var link = unwrapBingLink(extractTag(block, "link"));
    var pubDateStr = extractTag(block, "pubDate");
    // Google News uses <source>; Bing News uses the namespaced <News:Source>.
    var sourceTagText = extractTag(block, "source") || extractTag(block, "News:Source");

    if (!rawTitle || !link) return;
    var title = stripTags(rawTitle);
    var source = sourceTagText || feedSource;

    // Google News titles look like "Headline - Source Name"; trim that
    // redundant suffix since we already show the source as its own label.
    if (sourceTagText) {
      var suffix = " - " + sourceTagText;
      if (title.length > suffix.length && title.slice(-suffix.length) === suffix) {
        title = title.slice(0, -suffix.length).trim();
      }
    }

    var pubDate = pubDateStr ? new Date(pubDateStr) : null;
    if (pubDate && isNaN(pubDate.getTime())) pubDate = null;

    items.push({
      title: title,
      url: link.trim(),
      source: source,
      image: toHttps(extractImage(block)),
      summary: cleanSummary(extractTag(block, "description"), title),
      publishedAt: pubDate ? pubDate.toISOString() : null,
      _sortTime: pubDate ? pubDate.getTime() : 0,
    });
  });
  return items;
}

async function fetchWithTimeout(url, timeoutMs) {
  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsDigestBot/1.0; +https://pawanparashar.github.io/stock-watchlist/news.html)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      redirect: "follow",
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchCategory(category) {
  var results = await Promise.allSettled(
    category.feeds.map(function (feed) { return fetchWithTimeout(feed.url, FETCH_TIMEOUT_MS); })
  );

  var allItems = [];
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    var feed = category.feeds[i];
    if (r.status !== "fulfilled" || !r.value.ok) continue;
    try {
      var text = await r.value.text();
      allItems = allItems.concat(parseRssItems(text, feed.source));
    } catch (err) {
      // One bad feed shouldn't blank the whole category.
      continue;
    }
  }

  var seen = {};
  var deduped = [];
  allItems.forEach(function (item) {
    if (seen[item.url]) return;
    seen[item.url] = true;
    deduped.push(item);
  });

  deduped.sort(function (a, b) { return b._sortTime - a._sortTime; });

  return deduped.slice(0, ITEMS_PER_CATEGORY).map(function (item) {
    return {
      title: item.title,
      url: item.url,
      source: item.source,
      image: item.image,
      summary: item.summary,
      publishedAt: item.publishedAt,
    };
  });
}

var DIGEST_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

// A short synthesized paragraph per section (2-5 sentences, one per
// headline that has enough to say) via Workers AI, built from that
// section's own top-3 headlines+summaries — not a separate fetch, so it
// can't introduce anything not already in the section. Runs once per
// 5-minute cache window (see CACHE_TTL_SECONDS), not per page load.
// Best-effort: any failure (model error, timeout, empty category) just
// omits the section summary rather than breaking the section's headlines,
// which are the part that matters.
async function generateSectionDigest(env, category, items) {
  if (!env.AI || !items.length) return null;

  var numbered = items
    .map(function (item, i) {
      return (i + 1) + ". " + item.title + (item.summary ? " — " + item.summary : "");
    })
    .join("\n");

  var prompt =
    "Section: " + category.label + "\n\nHeadlines:\n" + numbered +
    "\n\nWrite a " + items.length + "-sentence plain-text summary, one sentence per headline above, " +
    "in the same order, each sentence covering what that headline/summary says. " +
    "State facts only, no commentary, no \"this section\" framing, no markdown, no bullet points — " +
    "just " + items.length + " sentences in a row.";

  try {
    var result = await Promise.race([
      env.AI.run(DIGEST_MODEL, {
        messages: [
          { role: "system", content: "You write short, neutral multi-sentence summaries of news headlines — one plain sentence per headline, in order. Output only those sentences as flowing text, no preamble, no quotes, no numbering, no markdown." },
          { role: "user", content: prompt },
        ],
        max_tokens: 220,
      }),
      new Promise(function (_, reject) { setTimeout(function () { reject(new Error("AI timeout")); }, 15000); }),
    ]);
    var text = result && (result.response || result.result || "");
    text = (text || "").trim().replace(/^["'\s]+|["'\s]+$/g, "");
    return text || null;
  } catch (err) {
    return null;
  }
}

// The "Today's Briefing" line at the top of the page — one short paragraph
// pulled across all 9 sections, not just a concatenation of the per-section
// digests below it. Built straight from each section's own top-3 headlines
// (not from the per-section digest text), so it can run in parallel with
// generateSectionDigest instead of waiting on it — both read the same
// already-fetched items, they just produce different-shaped output.
async function generateOverallBriefing(env, categoryResults) {
  if (!env.AI) return null;

  var hasAnyItems = categoryResults.some(function (items) { return items.length > 0; });
  if (!hasAnyItems) return null;

  var sections = CATEGORIES.map(function (cat, i) {
    var items = categoryResults[i];
    if (!items.length) return null;
    var lines = items.map(function (item) { return "- " + item.title; }).join("\n");
    return cat.label + ":\n" + lines;
  }).filter(Boolean).join("\n\n");

  var prompt =
    "Here are today's top headlines across sections of a personal news digest:\n\n" + sections +
    "\n\nWrite a 4-6 sentence \"Today's Briefing\" opening paragraph that highlights the most " +
    "notable developments across these sections as flowing prose. State facts only, no commentary, " +
    "no headers, no bullet points, no section-by-section structure — just a readable paragraph a " +
    "person could read in 15 seconds to know what's going on today.";

  try {
    var result = await Promise.race([
      env.AI.run(DIGEST_MODEL, {
        messages: [
          { role: "system", content: "You write a short, neutral 'Today's Briefing' paragraph summarizing the most notable items across several news sections. Output only that paragraph as flowing prose — no preamble, no quotes, no markdown, no headers." },
          { role: "user", content: prompt },
        ],
        max_tokens: 260,
      }),
      new Promise(function (_, reject) { setTimeout(function () { reject(new Error("AI timeout")); }, 15000); }),
    ]);
    var text = result && (result.response || result.result || "");
    text = (text || "").trim().replace(/^["'\s]+|["'\s]+$/g, "");
    return text || null;
  } catch (err) {
    return null;
  }
}

async function buildDigest(env) {
  var categoryResults = await Promise.all(CATEGORIES.map(fetchCategory));

  var briefingPromise = generateOverallBriefing(env, categoryResults);
  var digestPromises = CATEGORIES.map(function (cat, i) { return generateSectionDigest(env, cat, categoryResults[i]); });
  var all = await Promise.all([briefingPromise].concat(digestPromises));
  var briefing = all[0];
  var digestTexts = all.slice(1);

  var categories = {};
  CATEGORIES.forEach(function (cat, i) {
    categories[cat.key] = { label: cat.label, summary: digestTexts[i], items: categoryResults[i] };
  });
  return { updated: new Date().toISOString(), briefing: briefing, categories: categories };
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    var reqUrl = new URL(request.url);
    var bypassCache = reqUrl.searchParams.get("fresh") === "1";
    var cacheKey = new Request(reqUrl.origin + "/digest", { method: "GET" });
    var cache = caches.default;
    if (!bypassCache) {
      var cached = await cache.match(cacheKey);
      if (cached) return cached;
    }

    try {
      var digest = await buildDigest(env);
      var response = jsonResponse(digest);
      var toCache = response.clone();
      toCache.headers.set("Cache-Control", "public, max-age=" + CACHE_TTL_SECONDS);
      ctx.waitUntil(cache.put(cacheKey, toCache));
      return response;
    } catch (err) {
      return jsonResponse({ error: err.message || "Unknown error" }, 502);
    }
  },
};
