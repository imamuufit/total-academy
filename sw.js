const CACHE_NAME = "platform-buddy-v103";
const CORE_ASSETS = [
  "./",
  "index.html",
  "index.html?v=103",
  "styles.css",
  "styles.css?v=103",
  "app.js",
  "app.js?v=103",
  "manifest.webmanifest",
  "icon.svg",
  "apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.destination === "image") {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) =>
          cached || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          })
        )
      )
    );
    return;
  }
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
