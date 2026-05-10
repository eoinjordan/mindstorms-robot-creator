/* Mindstorms Robot Creator - service worker
   Caches all local assets for offline use. CDN scripts are cached on first load.
   The app works fully offline for code generation, .lms download, and Blockly.
   Builder sessions and server features still require the local MCP server.
*/

const CACHE_NAME = "mindstorms-robot-creator-v2";

// Local assets to pre-cache on install
const LOCAL_ASSETS = [
  "./index.html",
  "./app.js",
  "./styles.css",
  "./manifest.json",
  "./icon-192.svg",
  "./icon-512.svg"
];

// CDN scripts — cached on first network fetch
const CDN_ORIGINS = [
  "https://cdnjs.cloudflare.com",
  "https://cdn.jsdelivr.net",
  "https://unpkg.com"
];

// ─── Install: pre-cache local assets ──────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(LOCAL_ASSETS))
  );
  // Take control immediately on first install
  self.skipWaiting();
});

// ─── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── Fetch: network-first for same-origin POST, cache-first for assets ────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept the local action server calls — always go to network
  if (url.hostname === "127.0.0.1" || url.hostname === "localhost") return;

  // POST requests are not cacheable
  if (request.method !== "GET") return;

  const isCdnRequest = CDN_ORIGINS.some(o => request.url.startsWith(o));
  const isLocalAsset = url.origin === self.location.origin;

  if (isLocalAsset || isCdnRequest) {
    // Cache-first: serve from cache, update in the background
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response && response.status === 200 && response.type !== "opaque") {
            const toCache = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, toCache));
          }
          return response;
        }).catch(() => null);

        return cached || networkFetch;
      })
    );
  }
  // All other requests (e.g. external API calls) pass through to network
});
