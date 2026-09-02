/* Service worker: tiene l'app disponibile anche senza rete.
   Mette in cache i file uno per uno: se uno manca, gli altri
   vengono salvati comunque.
   Il nome della cache porta il prefisso "diario-": sull'origine
   github.io vive anche l'app Palestra e le due si cancellerebbero
   la cache a vicenda. Alza il numero di versione a ogni rilascio. */
const PREFISSO = "diario-";
const CACHE = PREFISSO + "v39";
/* I cerchi della barra in alto: uno ogni 5%, più quello di quando si sfora.
   Vanno in cache come gli altri file, altrimenti in aereo la notifica
   resterebbe senza disegno. */
const CERCHI = ["./badge/cerchio-oltre.png"];
for (let i = 0; i <= 100; i += 5) CERCHI.push("./badge/cerchio-" + String(i).padStart(3, "0") + ".png");
const FILE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"].concat(CERCHI);

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

/* Mette da parte una copia buona della risposta. */
function conserva(richiesta, risposta) {
  const copia = risposta.clone();
  caches.open(CACHE).then((c) => c.put(richiesta, copia)).catch(() => {});
  return risposta;
}

/* ---------- i due anelli, disegnati qui dentro ----------
   Servono all'immagine grande della notifica: tirando giù la tendina si vedono
   gli stessi due cerchi della schermata Oggi, colori compresi.
   Non possono essere file già pronti come i cerchi della barra: le
   combinazioni di calorie e proteine sono troppe. E non può disegnarli la
   pagina, perché le immagini della notifica le va a prendere il browser da un
   indirizzo, anche quando l'app è chiusa. Le prende **da qui**: è provato che
   la richiesta passa dal service worker, e OffscreenCanvas sa disegnare.

   La tavolozza è copiata da quella di `index.html`: qui dentro le variabili
   CSS non esistono. **Se cambi i colori di là, cambiali anche qui**, o gli
   anelli della notifica smetteranno di somigliare a quelli dell'app. */
/* I colori **non stanno scritti qui**: li manda la pagina nell'indirizzo, presi
   dalle stesse variabili CSS che sta usando in quel momento. Prima erano
   ricopiati qui dentro, ed era una trappola: cambiare la tavolozza in
   index.html non bastava, e il disegno della notifica restava dei colori
   vecchi senza che nessuno se ne accorgesse. Così arriva già giusto anche il
   tema chiaro o scuro, senza doverlo chiedere.
   Quelli qui sotto servono solo a non restare senza disegno se l'indirizzo
   arriva monco. */
const RIPIEGO = { carta:"#E9ECE6", inchiostro:"#141B18", tenue:"#5B6661",
                  traccia:"#E4E8E1", blu:"#1F4A6B", senape:"#C08411", rosso:"#A3341F" };
function tavolozza(u) {
  const c = Object.assign({}, RIPIEGO), v = (u.searchParams.get("c") || "").split(",");
  const nomi = ["carta", "inchiostro", "tenue", "traccia", "blu", "senape", "rosso"];
  nomi.forEach((n, i) => { if (/^[0-9a-fA-F]{6}$/.test(v[i] || "")) c[n] = "#" + v[i]; });
  return c;
}

function arco(x, cx, cy, r, spesso, colore, quota) {
  if (quota <= 0) return;
  x.strokeStyle = colore; x.lineWidth = spesso; x.lineCap = "round";
  x.beginPath();
  x.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, quota));
  x.stroke();
}

async function disegnaAnelli(u) {
  const n = (k, d) => { const v = Number(u.searchParams.get(k)); return isFinite(v) && v > 0 ? v : d; };
  const kcal = Math.max(0, Number(u.searchParams.get("k")) || 0);
  const obK = n("ok", 1500);
  const prot = Math.max(0, Number(u.searchParams.get("p")) || 0), obP = n("op", 160);
  const C = tavolozza(u);

  const W = 1024, H = 512, c = new OffscreenCanvas(W, H), x = c.getContext("2d");
  x.fillStyle = C.carta; x.fillRect(0, 0, W, H);

  /* Fuori le calorie sull'obiettivo, dentro le proteine sul loro. Oltre
     l'obiettivo l'anello riparte per un secondo giro in rosso, col primo giro
     pieno che resta sotto: sono le stesse regole di `anelli()` in index.html.
     Se cambiano di là, vanno cambiate anche qui. */
  const cx = 262, cy = 256, spesso = 34, R = 186, r = R - spesso - 6;
  const qk = kcal / obK;
  x.strokeStyle = C.traccia; x.lineWidth = spesso; x.lineCap = "butt";
  x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke();
  arco(x, cx, cy, R, spesso, C.blu, Math.min(1, qk));
  arco(x, cx, cy, R, spesso, C.rosso, Math.min(1, Math.max(0, qk - 1)));
  arco(x, cx, cy, r, spesso, C.senape, Math.min(1, prot / obP));

  /* i numeri, a destra */
  const sx = 540;
  x.textBaseline = "alphabetic";
  x.fillStyle = C.tenue; x.font = "600 26px system-ui, sans-serif";
  x.fillText("CALORIE", sx, 150);
  x.fillStyle = kcal > obK ? C.rosso : C.blu; x.font = "700 92px system-ui, sans-serif";
  const nk = x.measureText(String(Math.round(kcal))).width;
  x.fillText(String(Math.round(kcal)), sx, 232);
  x.fillStyle = C.tenue; x.font = "400 34px system-ui, sans-serif";
  x.fillText(" di " + Math.round(obK), sx + nk, 232);

  x.fillStyle = C.tenue; x.font = "600 26px system-ui, sans-serif";
  x.fillText("PROTEINE", sx, 340);
  x.fillStyle = C.senape; x.font = "700 92px system-ui, sans-serif";
  const np = x.measureText(String(Math.round(prot))).width;
  x.fillText(String(Math.round(prot)), sx, 422);
  x.fillStyle = C.tenue; x.font = "400 34px system-ui, sans-serif";
  x.fillText(" di " + Math.round(obP) + " g", sx + np, 422);

  const b = await c.convertToBlob({ type: "image/png" });
  return new Response(b, { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  /* Quello che non è di casa nostra non ci riguarda: da quando il Diario parla
     con Google Drive, senza questa riga una chiamata a Google andata storta si
     sarebbe presa in cambio la pagina dell'app, e chi l'ha chiamata avrebbe
     letto HTML al posto della risposta. */
  if (new URL(e.request.url).origin !== self.location.origin) return;

  /* Il disegno degli anelli non è un file: si fa qui, ogni volta, sui numeri
     che arrivano nell'indirizzo. Dopo il controllo dell'origine, così resta
     roba nostra e nostra soltanto. */
  {
    const u = new URL(e.request.url);
    if (u.pathname.indexOf("/anelli.png") >= 0) {
      e.respondWith(disegnaAnelli(u).catch(() => new Response("", { status: 204 })));
      return;
    }
  }

  /* La pagina viene chiesta prima alla rete: è tutta l'app, e servirla
     dalla cache significava mostrare per giorni una versione vecchia,
     costringendo a ricaricare due volte. Senza rete si ricade sulla
     copia salvata, quindi l'app funziona lo stesso in aereo. */
  if (e.request.mode === "navigate" || e.request.destination === "document") {
    e.respondWith(
      fetch(e.request)
        .then((res) => conserva(e.request, res))
        .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
    );
    return;
  }

  /* Icone e manifest cambiano quasi mai: prima la cache, è più veloce. */
  e.respondWith(
    caches.match(e.request).then((r) => {
      if (r) return r;
      return fetch(e.request)
        .then((res) => conserva(e.request, res))
        .catch(() => caches.match("./index.html"));
    })
  );
});

/* La notifica del cerchio si tocca e riporta al Diario, senza aprirne una
   seconda copia se è già aperto. */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((l) => {
      for (const c of l) if ("focus" in c) return c.focus();
      return self.clients.openWindow("./");
    })
  );
});
