var CACHE_NAME = 'dueit-v0.4';
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
    caches.match(e.request).then(function (cached) {
      return cached || fetch(e.request);
    })
  );
});
