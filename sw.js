const CACHE_NAME = "platform-buddy-v183-04-06";
const CORE_ASSETS = [
  "./",
  "index.html",
  "index.html?v=183.04.06",
  "styles.css",
  "styles.css?v=183.04.06",
  "guide-panel-cascade.css",
  "guide-panel-cascade.css?v=183.04.06",
  "app.js",
  "app.js?v=183.04.06",
  "video.js",
  "video.js?v=183.04.06",
  "manifest.webmanifest",
  "icon.svg",
  "apple-touch-icon.png",
  "home-bg-lite.jpg",
  "icon-sheet-lite.jpg",
  "buddy-team-normal-lite.webp",
  "buddy-character-lite.webp"
];

const GUIDE_PANEL_MARKUP = `
        <details class="guide-mode-bar" id="guideModePanel" aria-label="\u8868\u793a\u30e2\u30fc\u30c9">
          <summary class="guide-mode-trigger" aria-label="\u30ac\u30a4\u30c9\u8a2d\u5b9a\u3092\u958b\u304f">
            <span>\u30ac\u30a4\u30c9</span>
          </summary>
          <div class="guide-mode-popover">
            <div class="guide-mode-copy">
              <span>\u30ac\u30a4\u30c9\u30e2\u30fc\u30c9</span>
              <small id="guideModeDescription">\u77ed\u3044\u30ac\u30a4\u30c9\u3092\u8868\u793a</small>
            </div>
            <button class="guide-mode-toggle" id="guideModeBtn" type="button" aria-pressed="true">
              \u30aa\u30f3
            </button>
            <button class="guide-mode-close" type="button" data-guide-panel-close>\u9589\u3058\u308b</button>
          </div>
        </details>`;

const GUIDE_PANEL_SCRIPT = `
    <script>
      (() => {
        const panel = document.getElementById("guideModePanel");
        if (!panel || panel.dataset.closeReady === "true") return;
        panel.dataset.closeReady = "true";

        document.addEventListener("click", (event) => {
          if (event.target.closest("[data-guide-panel-close]")) {
            panel.open = false;
            return;
          }
          if (panel.open && !panel.contains(event.target)) {
            panel.open = false;
          }
        });

        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape") panel.open = false;
        });
      })();
    </script>`;

function upgradeIndexHtml(html) {
  let next = html
    .replace(/styles\.css\?v=183\.04\.04/g, "styles.css?v=183.04.06")
    .replace(/app\.js\?v=183\.04\.04/g, "app.js?v=183.04.06")
    .replace(/video\.js\?v=183\.04\.04/g, "video.js?v=183.04.06");

  if (!next.includes("guide-panel-cascade.css")) {
    next = next.replace(
      /<link rel="stylesheet" href="styles\.css\?v=183\.04\.06">/,
      '<link rel="stylesheet" href="styles.css?v=183.04.06">\n    <link rel="stylesheet" href="guide-panel-cascade.css?v=183.04.06">'
    );
  }

  if (!next.includes('id="guideModePanel"')) {
    next = next.replace(
      /        <section class="guide-mode-bar"[\s\S]*?<\/section>/,
      GUIDE_PANEL_MARKUP
    );
  }

  if (!next.includes("data-guide-panel-close")) {
    next = next.replace("</body>", `${GUIDE_PANEL_SCRIPT}\n  </body>`);
  } else if (!next.includes("dataset.closeReady")) {
    next = next.replace("</body>", `${GUIDE_PANEL_SCRIPT}\n  </body>`);
  }

  return next;
}

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

  const url = new URL(event.request.url);
  const isNavigation = event.request.mode === "navigate";
  const isIndex = url.pathname.endsWith("/") || url.pathname.endsWith("/index.html");

  if (isNavigation || isIndex) {
    event.respondWith(
      fetch(event.request)
        .then((response) => response.text().then((html) => new Response(upgradeIndexHtml(html), {
          status: response.status,
          statusText: response.statusText,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        })))
        .catch(() => caches.match(event.request))
    );
    return;
  }

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
