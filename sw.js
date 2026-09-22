importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
const CACHE_NAME = 'baritoxico-cache-v5';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './docs/guia-compost-baritoxico.pdf',
  './img/baritoxico-logo.webp',
  './img/favicon-baritoxico.webp',
  './img/arb.webp',
  './img/finor.webp',
  './img/jovenesporbariloche.webp',
  './img/buply.webp',
  './img/zonadecompost.webp',
  './img/comunidadcompost.webp',
  './img/electroreciclaje.webp',
  './img/aceiteusado.webp',
  './img/residuoselectronicos.webp'
];

// Instalación: Almacenar los recursos estáticos iniciales en caché
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: Remoción y limpieza profunda de versiones obsoletas de caché
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia Avanzada: Stale-While-Revalidate
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        // Guardamos solo respuestas válidas e ignoramos llamadas externas dinámicas (Google Sheets / Maps)
        if (networkResponse && networkResponse.status === 200) {
          if (!e.request.url.includes('docs.google.com') && !e.request.url.includes('google.com/maps')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseToCache);
            });
          }
        }
        return networkResponse;
      }).catch(() => {
        // Falla de red controlada sin romper la app
      });

      return cachedResponse || fetchPromise;
    })
  );
});