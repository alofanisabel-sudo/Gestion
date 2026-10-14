// Service worker Gestion : l'app s'ouvre même sans connexion.
// Réseau d'abord : les mises à jour du site sont reprises automatiquement, aucune version à changer à la main.
const CACHE = 'gestion';
const SHELL = ['./', './index.html', './manifest.webmanifest', './logo-192.png', './logo-512.png', './logo-maskable-192.png', './logo-maskable-512.png'];
const OK = new Set(SHELL.map(p => new URL(p, self.location).pathname));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(r => {
      if (r.ok && OK.has(u.pathname)) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
  );
});
