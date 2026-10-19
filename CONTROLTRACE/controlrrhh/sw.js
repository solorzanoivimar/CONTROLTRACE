// CONTROL RRHH · service worker de la app del empleado (Mi RRHH) · v1
// Solo maneja la app del empleado; el resto de CONTROL MAX pasa directo a la red.
const CACHE = 'mi-rrhh-v1';
const APP = ['empleado.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('mi-rrhh-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const f = u.pathname.split('/').pop();
  if (!APP.includes(f)) return;                       // no toca index.html ni otros módulos
  // siempre intenta la versión nueva; si no hay internet, usa la guardada
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
