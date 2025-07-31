const CACHE_NAME = 'opm-cache-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/main.js',
  '/manifest.json',
  '/service-worker.js',
  '/img/rvz-blk.svg',
  '/img/info.svg',
  '/img/close.svg',
  '/components/homeScreen.js',
  '/components/sessionScreen.js',
  '/components/listeningScreen.js',
  '/components/infoModal.js',
  '/styles/header.css',
  '/styles/home.css',
  '/styles/session.css',
  '/styles/listening.css',
  '/styles/modal.css',
  '/assets/oro.mp3',
  '/assets/plata.mp3',
  '/assets/mata.mp3'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cached => cached || fetch(evt.request))
  );
});