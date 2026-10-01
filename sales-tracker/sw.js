/* Sales Tracker service worker.
 *
 * Bump VERSION whenever any file in ASSETS changes: browsers re-fetch this
 * script, spot the diff, install a fresh cache and the page offers a reload.
 */
const VERSION = "2026-10-01.2";
const CACHE = "sales-tracker-" + VERSION;
const SHELL = new URL("index.html", self.location.href).href;
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "fonts/bricolage-grotesque-latin.woff2",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png"
];

self.addEventListener("install", event => {
  // No skipWaiting: an open tab keeps the build it started with until the
  // person taps Reload. On a first install there is nothing to wait for.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;

  // Any navigation — "/", "/index.html", a bookmark with a query string —
  // resolves to the one cached shell, which is what makes offline launches work.
  const navigate = req.mode === "navigate";
  const key = navigate ? SHELL : req;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(key, { ignoreSearch: true });
    const fromNet = fetch(req).then(res => {
      if (res && res.ok && res.type === "basic") cache.put(key, res.clone());
      return res;
    });

    if (hit) {
      event.waitUntil(fromNet.catch(() => {}));  // refresh for the next launch
      return hit;
    }
    try {
      return await fromNet;
    } catch (err) {
      const shell = await cache.match(SHELL);
      if (navigate && shell) return shell;
      throw err;
    }
  })());
});
