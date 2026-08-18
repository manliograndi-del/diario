/* Service worker: tiene l'app disponibile anche senza rete.
   Mette in cache i file uno per uno: se uno manca, gli altri
   vengono salvati comunque.

   ATTENZIONE al nome della cache. Sull'origine manliograndi-del.github.io
   vive anche l'app Palestra, e lo spazio delle cache e' in comune come
   lo e' localStorage. Il nome deve percio' cominciare per "diario-", e
   qui dentro si cancellano soltanto le cache che cominciano per "diario-":
   mai quelle dell'altra app.

   A ogni rilascio alza il numero: diario-v1 -> diario-v2. */
const CACHE = "diario-v1";
const FILE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

/* Fino ad agosto 2026 questa app scriveva per errore nella cache di
   Palestra. Qui si tolgono da quella cache soltanto i file del Diario,
   uno per uno; la cache resta in piedi con dentro le cose di Palestra. */
const CACHE_VECCHIA = "palestra-v1";

function nostro(f) {
  return new URL(f, self.registration.scope).href;
}

function ripuliscoVecchia() {
  return caches.has(CACHE_VECCHIA)
    .then((c) => (c ? caches.open(CACHE_VECCHIA) : null))
    .then((c) => (c ? Promise.all(FILE.map((f) => c.delete(nostro(f)).catch(() => null))) : null))
    .catch(() => null);
}

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(FILE.map((f) => c.add(f).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((k) => Promise.all(
        k.filter((x) => x.indexOf("diario-") === 0 && x !== CACHE)
         .map((x) => caches.delete(x))
      ))
      .then(ripuliscoVecchia)
      .then(() => self.clients.claim())
  );
});

/* Si cerca solo dentro la nostra cache, non in tutte quelle dell'origine. */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(e.request).then((r) => {
        if (r) return r;
        return fetch(e.request).then((res) => {
          c.put(e.request, res.clone()).catch(() => {});
          return res;
        }).catch(() => c.match(nostro("./index.html")));
      })
    )
  );
});
