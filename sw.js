const CACHE_VERSION = 'v3.2.0';
const CACHE_NAME = `nen858-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './NEN-EN-858-2%20controle%20formulier.html',
  './manifest.json',
  './symitech_logo.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './css/styles.css',
  './js/main.js',
  './js/state.js',
  './js/database.js',
  './js/dropdown-binding.js',
  './js/form-render.js',
  './js/klant-modal.js',
  './js/voorziening-modal.js',
  './js/modal.js',
  './js/photos.js',
  './js/sync-ui.js',
  './js/pdf-builder.js',
  './js/test-data.js',
  './js/toast.js',
  './js/import-mode-modal.js',
  './js/spinner.js',
  './vendor/pdfmake/pdfmake.min.js',
  './vendor/pdfmake/vfs_fonts.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k.startsWith('nen858-') && k !== CACHE_NAME)
          .map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache nieuwe static-assets bij eerste fetch (zelfde origin)
        if (response.ok && new URL(event.request.url).origin === location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
