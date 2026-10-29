const CACHE_NAME = "tt-inspector-v1";

const STATIC_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./genReport.js",
  "./manifest.json"
];

// Instalación
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_FILES))
  );

  self.skipWaiting();
});

// Activación
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// Actualización automática (Network First)
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {

        const responseClone = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseClone);
          });

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
