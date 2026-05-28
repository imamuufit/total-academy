const CACHE_NAME = "platform-buddy-v113";
const CORE_ASSETS = [
  "./",
  "index.html",
  "index.html?v=113",
  "styles.css",
  "styles.css?v=113",
  "app.js",
  "app.js?v=113",
  "manifest.webmanifest",
  "icon.svg",
  "apple-touch-icon.png",
  "home-bg-lite.jpg",
  "icon-sheet-lite.jpg",
  "buddy-team-normal-lite.webp",
  "buddy-character-lite.webp"
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


