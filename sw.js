// Minimal service worker — exists only so the board can be installed as an
// app (Mac "Add to Dock" / iPad "Add to Home Screen") and keeps showing its
// last-cached shell if the network briefly drops, rather than a blank error
// page. It must NEVER cache the live data calls (price/news Workers are a
// different origin and are explicitly excluded below) — the whole point of
// this board is live data, so anything stale there would be worse than
// useless.
const CACHE_NAME = "live-board-shell-v1";
const APP_SHELL = [
  "board.html",
  "manifest.json",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/apple-touch-icon.png",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);
  // Only ever intercept same-origin GET requests for the app shell itself —
  // the stock-watchlist-proxy / news-digest-proxy Worker calls are a
  // different origin and pass straight through untouched.
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var networkFetch = fetch(event.request)
        .then(function (res) {
          if (res.ok) {
            var copy = res.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
          }
          return res;
        })
        .catch(function () { return cached; });
      return cached || networkFetch;
    })
  );
});
