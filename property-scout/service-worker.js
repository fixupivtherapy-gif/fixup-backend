/* ─────────────────────────────────────────────────────────────
   PR Property Scout — service worker.
   • Precaches the app shell (HTML/CSS/JS, manifest, icons, Leaflet CDN)
     so the app opens fully offline.
   • Runtime-caches OpenStreetMap tiles as you pan/zoom (cache-first with
     a capped, FIFO-evicted tile cache) so visited areas stay visible
     offline.
   Requires HTTPS (or localhost); will not register on file://.
   ───────────────────────────────────────────────────────────── */
const SHELL_CACHE = "pr-scout-v1";
const TILE_CACHE = "pr-scout-tiles-v1";
const TILE_CACHE_MAX = 300; // cap so cached tiles don't grow forever

const SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./styles.css",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => Promise.all(
        // Tolerate individual failures (e.g. a CDN hiccup) so install
        // still succeeds and the app can come online later.
        SHELL.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => null)
        )
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== SHELL_CACHE && k !== TILE_CACHE)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function isTileRequest(url) {
  return /(^|\.)tile\.openstreetmap\.org$/.test(url.hostname);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  // Map tiles → cache-first with a capped runtime cache.
  if (isTileRequest(url)) {
    event.respondWith(tileStrategy(req));
    return;
  }

  // App shell & everything else → cache-first, then network, with an
  // offline navigation fallback to the cached index.html.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).catch(() => {
        if (req.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      });
    })
  );
});

async function tileStrategy(req) {
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(req);

  const networkFetch = fetch(req).then((res) => {
    // Cache successful or opaque tile responses, then trim the cache.
    if (res && (res.ok || res.type === "opaque")) {
      cache.put(req, res.clone()).then(() => trimTileCache(cache));
    }
    return res;
  }).catch(() => null);

  // Serve cached tile instantly when available; otherwise wait for network.
  return cached || (await networkFetch) || Response.error();
}

async function trimTileCache(cache) {
  const keys = await cache.keys();
  const overflow = keys.length - TILE_CACHE_MAX;
  for (let i = 0; i < overflow; i++) {
    await cache.delete(keys[i]); // FIFO: oldest entries first
  }
}
