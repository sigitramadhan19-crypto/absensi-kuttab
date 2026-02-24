const CACHE_NAME = "absensi-kuttab-v14"; // NAIKKAN SETIAP UPDATE

const urlsToCache = [
 "./manifest.json",
  "./images/Logo SD QU KUTTAB ZAD.jpeg",
  "./images/gedungsd.jpeg"
];

// =========================
// INSTALL
// =========================
self.addEventListener("install", event => {
  self.skipWaiting(); // langsung aktifkan SW baru
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// =========================
// ACTIVATE
// =========================
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // hapus cache lama
          }
        })
      );
    })
  );
  return self.clients.claim(); // ambil alih semua tab langsung
});

// =========================
// FETCH
// =========================
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response("Offline", {
          headers: { "Content-Type": "text/plain" }
        });
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});