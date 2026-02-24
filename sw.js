const CACHE_NAME = "absensi-kuttab-v10";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./images/Logo SD QU KUTTAB ZAD.jpeg",
  "./images/gedungsd.jpeg"
];

// Saat install → simpan file ke cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Saat fetch → ambil dari cache dulu
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
