// Service worker de Génie Civil Académie (écrit à la main, sans dépendance).
// Pages : réseau d'abord, puis cache, puis page hors ligne. Ressources /_next/static : cache d'abord.
const VERSION = 'gca-v1';
const PAGES = `${VERSION}-pages`;
const STATIQUES = `${VERSION}-statiques`;
const HORS_LIGNE = '/hors-ligne';

async function mettreEnCachePage(url) {
  const cache = await caches.open(PAGES);
  const rep = await fetch(url, { credentials: 'same-origin' });
  if (!rep.ok) return;
  await cache.put(url, rep.clone());
  // Récupère aussi les scripts et feuilles de style référencés par la page.
  const html = await rep.text();
  const ressources = [...new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) ?? [])];
  const statiques = await caches.open(STATIQUES);
  await Promise.all(ressources.map((r) => statiques.add(r).catch(() => undefined)));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await mettreEnCachePage(HORS_LIGNE);
      try {
        const liste = await (await fetch('/precache.json')).json();
        for (const url of liste) await mettreEnCachePage(url).catch(() => undefined);
      } catch {
        // la liste est facultative : les pages visitées seront mises en cache au fil de l'eau
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cles = await caches.keys();
      await Promise.all(cles.filter((c) => !c.startsWith(VERSION)).map((c) => caches.delete(c)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const rep = await fetch(request);
          const cache = await caches.open(PAGES);
          cache.put(request, rep.clone());
          return rep;
        } catch {
          return (await caches.match(request)) ?? (await caches.match(HORS_LIGNE)) ?? Response.error();
        }
      })(),
    );
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      (async () => {
        const deja = await caches.match(request);
        if (deja) return deja;
        const rep = await fetch(request);
        if (rep.ok) (await caches.open(STATIQUES)).put(request, rep.clone());
        return rep;
      })(),
    );
    return;
  }

  // Autres ressources du site (polices, icônes) : cache, puis réseau qui met à jour.
  event.respondWith(
    (async () => {
      const cache = await caches.open(STATIQUES);
      const deja = await cache.match(request);
      const reseau = fetch(request)
        .then((rep) => {
          if (rep.ok) cache.put(request, rep.clone());
          return rep;
        })
        .catch(() => deja ?? Response.error());
      return deja ?? reseau;
    })(),
  );
});
