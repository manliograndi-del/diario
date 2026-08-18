/* Service worker: tiene l'app disponibile anche senza rete.
   Mette in cache i file uno per uno: se uno manca, gli altri
   vengono salvati comunque.
   Il nome della cache porta il prefisso "diario-": sull'origine
   github.io vive anche l'app Palestra e le due si cancellerebbero
   la cache a vicenda. Alza il numero di versione a ogni rilascio. */
const PREFISSO = "diario-";
const CACHE = PREFISSO + "v3";
const FILE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

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
      .then((k) => Promise.all(k
        .filter((x) => x.indexOf(PREFISSO) === 0 && x !== CACHE)
        .map((x) => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((r) => {
      if (r) return r;
      return fetch(e.request).then((res) => {
        const copia = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia)).catch(() => {});
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
