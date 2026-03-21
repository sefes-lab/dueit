var CACHE_NAME = 'dueit-v0.55';
var ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/storage.js',
  './js/version.js',
  './js/validation.js',
  './js/countdown.js',
  './js/assignments.js',
  './js/classes.js',
  './js/import-export.js',
  './js/calendar.js',
  './js/gamification.js',
  './js/renderer.js',
  './js/app.js',
  './icons/icon.svg',
  './icons/icon-maskable.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (n) { return n !== CACHE_NAME; })
             .map(function (n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  e.respondWith(
    fetch(e.request).then(function (response) {
      // Update cache with fresh response
      if (response.ok) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(function () {
      // Offline fallback to cache
      return caches.match(e.request);
    })
  );
});
