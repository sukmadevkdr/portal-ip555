/**
 * Service Worker untuk PWA IP 555
 * Memenuhi syarat Google Chrome (Android & Desktop) untuk memunculkan tombol "Install App / Pasang Aplikasi"
 */
const CACHE_NAME = 'ip555-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Hanya tangani GET requests untuk asset lokal PWA wrapper
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Jika memanggil Google Apps Script atau eksternal, biarkan network menangani langsung
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      });
    }).catch(() => {
      // Fallback offline jika koneksi terputus
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});

