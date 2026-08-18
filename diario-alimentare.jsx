import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ============================================================
   DIARIO — diario alimentare con memoria persistente
   Ogni giorno viene salvato con la sua data. A mezzanotte il
   giorno si chiude da solo e ne comincia uno nuovo, senza che
   nulla vada perso.
   ============================================================ */

/* ---------- archivio alimenti (valori per 100 g / 100 ml) ---------- */
// [nome, kcal, proteine, carboidrati, grassi, porzione tipica in g, categoria]
const ARCHIVIO = [
  ["Petto di pollo (crudo)", 100, 23, 0, 0.8, 150, "Carne e pesce"],
  ["Coscia di pollo senza pelle", 119, 20, 0, 4.5, 150, "Carne e pesce"],
  ["Fesa di tacchino", 107, 24, 0, 1, 150, "Carne e pesce"],
  ["Manzo magro (girello)", 122, 22, 0, 3.5, 150, "Carne e pesce"],
  ["Hamburger di manzo 5%", 137, 21, 0, 5, 150, "Carne e pesce"],
  ["Fettina di vitello", 107, 21, 0, 2.5, 150, "Carne e pesce"],
  ["Lonza di maiale", 140, 21, 0, 6, 150, "Carne e pesce"],
  ["Bresaola", 151, 32, 0, 2, 60, "Carne e pesce"],
  ["Prosciutto crudo sgrassato", 159, 28, 0, 5, 60, "Carne e pesce"],
  ["Prosciutto cotto", 215, 20, 1, 14, 60, "Carne e pesce"],
  ["Salmone fresco", 185, 20, 0, 12, 150, "Carne e pesce"],
  ["Salmone affumicato", 147, 25, 0, 5, 80, "Carne e pesce"],
  ["Merluzzo / nasello", 71, 17, 0, 0.3, 180, "Carne e pesce"],
  ["Orata", 121, 20, 0, 4.5, 180, "Carne e pesce"],
  ["Tonno al naturale (sgocciolato)", 103, 25, 0, 0.5, 80, "Carne e pesce"],
  ["Tonno sott'olio (sgocciolato)", 192, 25, 0, 10, 80, "Carne e pesce"],
  ["Gamberi", 71, 13, 0, 0.6, 150, "Carne e pesce"],
  ["Sgombro", 170, 17, 0, 11, 150, "Carne e pesce"],
  ["Alici fresche", 96, 17, 1, 2.6, 120, "Carne e pesce"],

  ["Uovo intero", 128, 12.4, 0.7, 8.7, 55, "Uova e latticini"],
  ["Albume", 43, 10.7, 0.2, 0.2, 100, "Uova e latticini"],
  ["Yogurt greco 0%", 57, 10, 4, 0, 150, "Uova e latticini"],
  ["Yogurt greco 2%", 73, 9, 4, 2, 150, "Uova e latticini"],
  ["Skyr", 63, 11, 4, 0.2, 150, "Uova e latticini"],
  ["Yogurt bianco intero", 66, 3.5, 4.3, 3.9, 125, "Uova e latticini"],
  ["Latte parzialmente scremato", 46, 3.3, 5, 1.5, 200, "Uova e latticini"],
  ["Latte scremato", 36, 3.5, 5, 0.2, 200, "Uova e latticini"],
  ["Fiocchi di latte", 98, 12, 3, 4, 150, "Uova e latticini"],
  ["Ricotta vaccina", 146, 8.8, 3.5, 10.9, 100, "Uova e latticini"],
  ["Mozzarella", 253, 18.7, 0.7, 19.5, 125, "Uova e latticini"],
  ["Mozzarella light", 180, 20, 1, 10, 125, "Uova e latticini"],
  ["Parmigiano Reggiano", 392, 33, 0, 28.5, 20, "Uova e latticini"],
  ["Grana Padano", 384, 33, 0, 28, 20, "Uova e latticini"],
  ["Stracchino", 300, 18, 0, 25, 60, "Uova e latticini"],
  ["Formaggio spalmabile light", 150, 8, 4, 11, 40, "Uova e latticini"],
  ["Feta", 264, 14, 4, 21, 50, "Uova e latticini"],
  ["Provolone", 350, 25, 0, 28, 50, "Uova e latticini"],

  ["Pasta di semola (cruda)", 353, 11, 71, 1.4, 80, "Cereali e pane"],
  ["Pasta di semola (cotta)", 158, 5, 31, 0.6, 200, "Cereali e pane"],
  ["Riso bianco (crudo)", 332, 6.7, 80, 0.4, 80, "Cereali e pane"],
  ["Riso bianco (cotto)", 110, 2.2, 26, 0.1, 200, "Cereali e pane"],
  ["Riso integrale (crudo)", 337, 7.5, 73, 2.5, 80, "Cereali e pane"],
  ["Pane bianco", 275, 8.6, 57, 0.4, 50, "Cereali e pane"],
  ["Pane integrale", 224, 7.5, 44, 1.3, 50, "Cereali e pane"],
  ["Pane di segale", 219, 8, 45, 1, 50, "Cereali e pane"],
  ["Fette biscottate", 410, 11, 73, 6, 20, "Cereali e pane"],
  ["Cracker", 428, 9, 68, 13, 25, "Cereali e pane"],
  ["Grissini", 433, 12, 68, 13, 25, "Cereali e pane"],
  ["Fiocchi d'avena", 375, 13, 59, 7, 50, "Cereali e pane"],
  ["Cornflakes", 361, 7, 84, 0.9, 40, "Cereali e pane"],
  ["Farro perlato (crudo)", 335, 15, 67, 2.5, 80, "Cereali e pane"],
  ["Orzo perlato (crudo)", 319, 10, 71, 1.4, 80, "Cereali e pane"],
  ["Cous cous (crudo)", 376, 12, 72, 1, 80, "Cereali e pane"],
  ["Quinoa (cruda)", 368, 14, 64, 6, 80, "Cereali e pane"],
  ["Polenta (farina)", 362, 8, 76, 3, 60, "Cereali e pane"],
  ["Piadina", 300, 8, 48, 8, 100, "Cereali e pane"],
  ["Pizza margherita", 271, 11, 33, 10, 300, "Cereali e pane"],
  ["Focaccia", 320, 7, 48, 12, 100, "Cereali e pane"],
  ["Tortilla / wrap", 300, 8, 50, 7, 60, "Cereali e pane"],

  ["Ceci lessati", 120, 7, 18, 2, 150, "Legumi"],
  ["Fagioli borlotti lessati", 91, 6.4, 13, 0.5, 150, "Legumi"],
  ["Lenticchie lessate", 92, 7, 17, 0.4, 150, "Legumi"],
  ["Piselli", 76, 5.5, 10, 0.5, 150, "Legumi"],
  ["Edamame", 121, 11, 9, 5, 100, "Legumi"],
  ["Hummus", 237, 8, 14, 17, 50, "Legumi"],

  ["Zucchine", 11, 1.3, 1.4, 0.1, 200, "Verdura"],
  ["Melanzane", 18, 1.1, 2.6, 0.4, 200, "Verdura"],
  ["Pomodori", 17, 1, 3, 0.2, 200, "Verdura"],
  ["Pomodorini", 20, 1.2, 3.5, 0.2, 150, "Verdura"],
  ["Insalata (lattuga)", 15, 1.8, 2.2, 0.4, 100, "Verdura"],
  ["Rucola", 25, 2.6, 2, 0.7, 60, "Verdura"],
  ["Spinaci (crudi)", 23, 2.9, 3.6, 0.4, 200, "Verdura"],
  ["Broccoli", 34, 3, 7, 0.4, 200, "Verdura"],
  ["Cavolfiore", 25, 2, 5, 0.3, 200, "Verdura"],
  ["Verza", 27, 2.1, 4, 0.1, 200, "Verdura"],
  ["Finocchi", 9, 1.2, 1, 0.2, 200, "Verdura"],
  ["Sedano", 20, 2.3, 2.4, 0.2, 100, "Verdura"],
  ["Carote", 35, 1.1, 7.6, 0.2, 150, "Verdura"],
  ["Cetrioli", 14, 0.7, 3, 0.1, 150, "Verdura"],
  ["Peperoni", 22, 0.9, 4.2, 0.3, 150, "Verdura"],
  ["Cipolla", 26, 1, 5.7, 0.1, 80, "Verdura"],
  ["Funghi champignon", 20, 3.1, 0.8, 0.3, 150, "Verdura"],
  ["Zucca", 18, 1.1, 3.5, 0.1, 200, "Verdura"],
  ["Fagiolini", 18, 2.1, 2.4, 0.1, 200, "Verdura"],
  ["Asparagi", 24, 3.6, 4, 0.2, 200, "Verdura"],
  ["Radicchio", 13, 1.4, 1.6, 0.1, 100, "Verdura"],
  ["Cavolo cappuccio", 25, 2, 5, 0.2, 150, "Verdura"],
  ["Patate", 85, 2.1, 17.9, 1, 200, "Verdura"],

  ["Mela", 52, 0.3, 13, 0.2, 150, "Frutta"],
  ["Pera", 57, 0.4, 15, 0.1, 150, "Frutta"],
  ["Banana", 89, 1.1, 23, 0.3, 120, "Frutta"],
  ["Arancia", 47, 0.9, 12, 0.1, 180, "Frutta"],
  ["Kiwi", 61, 1.1, 15, 0.5, 80, "Frutta"],
  ["Fragole", 32, 0.7, 7.7, 0.3, 150, "Frutta"],
  ["Mirtilli", 57, 0.7, 14, 0.3, 100, "Frutta"],
  ["Anguria", 30, 0.6, 8, 0.2, 300, "Frutta"],
  ["Melone", 34, 0.8, 8, 0.2, 250, "Frutta"],
  ["Pesca", 39, 0.9, 10, 0.2, 150, "Frutta"],
  ["Uva", 69, 0.7, 18, 0.2, 150, "Frutta"],
  ["Ananas", 50, 0.5, 13, 0.1, 150, "Frutta"],
  ["Avocado", 160, 2, 9, 15, 100, "Frutta"],

  ["Olio extravergine d'oliva", 884, 0, 0, 100, 10, "Grassi e frutta secca"],
  ["Burro", 758, 0.8, 1, 83, 10, "Grassi e frutta secca"],
  ["Mandorle", 603, 22, 4.6, 55, 25, "Grassi e frutta secca"],
  ["Noci", 654, 15, 14, 65, 25, "Grassi e frutta secca"],
  ["Nocciole", 628, 15, 17, 61, 25, "Grassi e frutta secca"],
  ["Pistacchi", 560, 20, 28, 45, 25, "Grassi e frutta secca"],
  ["Arachidi", 567, 26, 16, 49, 25, "Grassi e frutta secca"],
  ["Burro di arachidi", 588, 25, 20, 50, 20, "Grassi e frutta secca"],
  ["Semi di chia", 486, 17, 42, 31, 15, "Grassi e frutta secca"],

  ["Cioccolato fondente 70%", 598, 8, 46, 43, 20, "Dolci e snack"],
  ["Cioccolato al latte", 535, 7.7, 59, 30, 25, "Dolci e snack"],
  ["Biscotti secchi", 416, 7, 74, 10, 30, "Dolci e snack"],
  ["Cornetto / brioche", 400, 7, 45, 21, 60, "Dolci e snack"],
  ["Gelato", 207, 3.5, 24, 11, 100, "Dolci e snack"],
  ["Miele", 304, 0.3, 82, 0, 15, "Dolci e snack"],
  ["Zucchero", 392, 0, 100, 0, 5, "Dolci e snack"],
  ["Patatine in busta", 536, 6, 53, 34, 30, "Dolci e snack"],

  ["Caffè espresso", 2, 0.1, 0, 0, 30, "Bevande"],
  ["Cappuccino", 60, 3, 5, 3, 150, "Bevande"],
  ["Vino rosso", 85, 0.1, 2.6, 0, 125, "Bevande"],
  ["Birra chiara", 34, 0.5, 3.5, 0, 330, "Bevande"],
  ["Coca-Cola", 42, 0, 10.6, 0, 330, "Bevande"],
  ["Succo d'arancia", 45, 0.7, 10, 0.1, 200, "Bevande"],
  ["Spritz", 130, 0, 13, 0, 150, "Bevande"],
].map((r, i) => ({
  id: "db" + i,
  nome: r[0],
  kcal: r[1],
  p: r[2],
  c: r[3],
  g: r[4],
  porz: r[5],
  cat: r[6],
}));

/* ---------- utilità ---------- */
const CHIAVE_CONFIG = "diario:config";
const CHIAVE_INDICE = "diario:indice";
const chiaveGiorno = (d) => "diario:giorno:" + d;

const OBIETTIVI_DEFAULT = { kcal: 1500, p: 160, c: 120, g: 45 };

const PASTI = ["Colazione", "Pranzo", "Cena", "Spuntino"];

const oggiISO = () => {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
};

const pastoDaOra = () => {
  const h = new Date().getHours();
  if (h < 11) return "Colazione";
  if (h < 15) return "Pranzo";
  if (h < 18) return "Spuntino";
  return "Cena";
};

const oraCorrente = () => {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
};

const num = (v, dec = 0) => {
  const n = Number(v) || 0;
  return n.toFixed(dec).replace(".", ",");
};

const dataEstesa = (iso) => {
  const [a, m, g] = iso.split("-").map(Number);
  const d = new Date(a, m - 1, g);
  const gg = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const mm = [
    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
  ];
  return gg[d.getDay()] + " " + d.getDate() + " " + mm[d.getMonth()];
};

const dataBreve = (iso) => {
  const [, m, g] = iso.split("-");
  return Number(g) + "/" + Number(m);
};

/* ---------- accesso all'archivio persistente ---------- */
const memoria = {
  disponibile: typeof window !== "undefined" && !!window.storage,
  cache: {},
  async leggi(chiave, fallback) {
    if (!this.disponibile) return this.cache[chiave] ?? fallback;
    try {
      const r = await window.storage.get(chiave, false);
      if (!r || r.value == null) return fallback;
      return JSON.parse(r.value);
    } catch (e) {
      return fallback;
    }
  },
  async scrivi(chiave, valore) {
    this.cache[chiave] = valore;
    if (!this.disponibile) return false;
    try {
      const r = await window.storage.set(chiave, JSON.stringify(valore), false);
      return !!r;
    } catch (e) {
      return false;
    }
  },
  async elenca(prefisso) {
    if (!this.disponibile) return Object.keys(this.cache).filter((k) => k.startsWith(prefisso));
    try {
      const r = await window.storage.list(prefisso, false);
      return r && r.keys ? r.keys : [];
    } catch (e) {
      return [];
    }
  },
};

/* ============================================================
   COMPONENTE PRINCIPALE
   ============================================================ */
export default function Diario() {
  const [pronto, setPronto] = useState(false);
  const [scheda, setScheda] = useState("oggi");
  const [data, setData] = useState(oggiISO());
  const [voci, setVoci] = useState([]);
  const [indice, setIndice] = useState({});
  const [obiettivi, setObiettivi] = useState(OBIETTIVI_DEFAULT);
  const [miei, setMiei] = useState([]);
  const [recenti, setRecenti] = useState([]);
  const [avviso, setAvviso] = useState(null);
  const [salvataggio, setSalvataggio] = useState("");

  const timerSalva = useRef(null);
  const caricato = useRef(false);

  /* --- avvio: recupera tutto dall'archivio --- */
  useEffect(() => {
    (async () => {
      const cfg = await memoria.leggi(CHIAVE_CONFIG, null);
      if (cfg) {
        setObiettivi({ ...OBIETTIVI_DEFAULT, ...(cfg.obiettivi || {}) });
        setMiei(cfg.miei || []);
        setRecenti(cfg.recenti || []);
      }
      const idx = await memoria.leggi(CHIAVE_INDICE, {});
      setIndice(idx || {});
      const d = oggiISO();
      const giorno = await memoria.leggi(chiaveGiorno(d), { voci: [] });
      setData(d);
      setVoci(giorno.voci || []);
      caricato.current = true;
      setPronto(true);
      if (!memoria.disponibile) {
        setAvviso("L'archivio non risponde: i dati di questa sessione non verranno salvati.");
      }
    })();
  }, []);

  /* --- il giorno si chiude da solo a mezzanotte --- */
  useEffect(() => {
    const controlla = async () => {
      const d = oggiISO();
      if (d !== data && caricato.current) {
        await salvaOra(data, voci);
        const giorno = await memoria.leggi(chiaveGiorno(d), { voci: [] });
        setData(d);
        setVoci(giorno.voci || []);
        setAvviso("È un nuovo giorno. Ieri è archiviato.");
      }
    };
    const t = setInterval(controlla, 20000);
    document.addEventListener("visibilitychange", controlla);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", controlla);
    };
  }, [data, voci]);

  /* --- totali --- */
  const totali = useMemo(() => {
    return voci.reduce(
      (t, v) => ({
        kcal: t.kcal + v.kcal,
        p: t.p + v.p,
        c: t.c + v.c,
        g: t.g + v.g,
      }),
      { kcal: 0, p: 0, c: 0, g: 0 }
    );
  }, [voci]);

  /* --- salvataggio --- */
  const salvaOra = useCallback(
    async (d, elenco) => {
      const t = elenco.reduce(
        (a, v) => ({ kcal: a.kcal + v.kcal, p: a.p + v.p, c: a.c + v.c, g: a.g + v.g }),
        { kcal: 0, p: 0, c: 0, g: 0 }
      );
      const ok = await memoria.scrivi(chiaveGiorno(d), { voci: elenco, totali: t });
      setIndice((prec) => {
        const nuovo = { ...prec };
        if (elenco.length === 0) delete nuovo[d];
        else
          nuovo[d] = {
            kcal: Math.round(t.kcal),
            p: Math.round(t.p),
            c: Math.round(t.c),
            g: Math.round(t.g),
            n: elenco.length,
          };
        memoria.scrivi(CHIAVE_INDICE, nuovo);
        return nuovo;
      });
      return ok;
    },
    []
  );

  useEffect(() => {
    if (!caricato.current) return;
    setSalvataggio("in corso");
    clearTimeout(timerSalva.current);
    timerSalva.current = setTimeout(async () => {
      const ok = await salvaOra(data, voci);
      setSalvataggio(ok || !memoria.disponibile ? "fatto" : "errore");
      setTimeout(() => setSalvataggio(""), 1600);
    }, 700);
    return () => clearTimeout(timerSalva.current);
  }, [voci, data, salvaOra]);

  const salvaConfig = useCallback(
    async (patch) => {
      const cfg = {
        obiettivi: patch.obiettivi || obiettivi,
        miei: patch.miei || miei,
        recenti: patch.recenti || recenti,
      };
      await memoria.scrivi(CHIAVE_CONFIG, cfg);
    },
    [obiettivi, miei, recenti]
  );

  /* --- azioni --- */
  const aggiungiVoce = (alimento, grammi, pasto) => {
    const f = grammi / 100;
    const voce = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      nome: alimento.nome,
      grammi,
      unita: alimento.unita || "g",
      kcal: alimento.kcal * f,
      p: alimento.p * f,
      c: alimento.c * f,
      g: alimento.g * f,
      pasto,
      ora: oraCorrente(),
      base: { kcal: alimento.kcal, p: alimento.p, c: alimento.c, g: alimento.g },
    };
    setVoci((v) => [...v, voce]);
    const nuoviRecenti = [
      { nome: alimento.nome, kcal: alimento.kcal, p: alimento.p, c: alimento.c, g: alimento.g, porz: grammi },
      ...recenti.filter((r) => r.nome !== alimento.nome),
    ].slice(0, 14);
    setRecenti(nuoviRecenti);
    salvaConfig({ recenti: nuoviRecenti });
    setScheda("oggi");
  };

  const rimuoviVoce = (id) => setVoci((v) => v.filter((x) => x.id !== id));

  const salvaAlimentoMio = (alimento) => {
    const nuovi = [{ ...alimento, id: "mio" + Date.now() }, ...miei].slice(0, 200);
    setMiei(nuovi);
    salvaConfig({ miei: nuovi });
  };

  const eliminaAlimentoMio = (id) => {
    const nuovi = miei.filter((m) => m.id !== id);
    setMiei(nuovi);
    salvaConfig({ miei: nuovi });
  };

  const aggiornaObiettivi = (o) => {
    setObiettivi(o);
    salvaConfig({ obiettivi: o });
  };

  if (!pronto) {
    return (
      <div className="app schermo-attesa">
        <style>{CSS}</style>
        <div className="attesa-testo">Recupero il diario…</div>
      </div>
    );
  }

  return (
    <div className="app">
      <style>{CSS}</style>

      <header className="testata">
        <div className="testata-riga">
          <div>
            <div className="occhiello">Diario</div>
            <h1 className="data-titolo">{data === oggiISO() ? "Oggi" : dataEstesa(data)}</h1>
            <div className="data-sotto">{dataEstesa(data)}</div>
          </div>
          <div className={"spia spia-" + salvataggio}>
            {salvataggio === "in corso" && "salvo…"}
            {salvataggio === "fatto" && "salvato"}
            {salvataggio === "errore" && "non salvato"}
          </div>
        </div>
      </header>

      {avviso && (
        <div className="avviso" onClick={() => setAvviso(null)}>
          {avviso} <span className="avviso-x">chiudi</span>
        </div>
      )}

      <main className="corpo">
        {scheda === "oggi" && (
          <SchedaOggi
            voci={voci}
            totali={totali}
            obiettivi={obiettivi}
            rimuovi={rimuoviVoce}
            vaiAggiungi={() => setScheda("aggiungi")}
          />
        )}
        {scheda === "aggiungi" && (
          <SchedaAggiungi
            miei={miei}
            recenti={recenti}
            aggiungi={aggiungiVoce}
            salvaAlimentoMio={salvaAlimentoMio}
            annulla={() => setScheda("oggi")}
          />
        )}
        {scheda === "storico" && <SchedaStorico indice={indice} obiettivi={obiettivi} />}
        {scheda === "impostazioni" && (
          <SchedaImpostazioni
            obiettivi={obiettivi}
            aggiornaObiettivi={aggiornaObiettivi}
            miei={miei}
            eliminaAlimentoMio={eliminaAlimentoMio}
            indice={indice}
          />
        )}
      </main>

      <nav className="barra">
        {[
          ["oggi", "Oggi"],
          ["aggiungi", "Aggiungi"],
          ["storico", "Storico"],
          ["impostazioni", "Impostazioni"],
        ].map(([k, etichetta]) => (
          <button
            key={k}
            className={"barra-voce " + (scheda === k ? "barra-attiva" : "")}
            onClick={() => setScheda(k)}
          >
            {etichetta}
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ============================================================
   OGGI
   ============================================================ */
function SchedaOggi({ voci, totali, obiettivi, rimuovi, vaiAggiungi }) {
  const restanti = obiettivi.kcal - totali.kcal;
  const quota = Math.min(1, totali.kcal / Math.max(1, obiettivi.kcal));
  const sforato = totali.kcal > obiettivi.kcal;

  const blocchi = Math.max(1, Math.round(obiettivi.p / 10));
  const blocchiPieni = totali.p / 10;

  const perPasto = PASTI.map((p) => ({
    pasto: p,
    elenco: voci.filter((v) => v.pasto === p),
  })).filter((x) => x.elenco.length > 0);

  return (
    <>
      {/* SIGNATURE — i blocchi di proteine, uno ogni 10 g */}
      <section className="pannello pannello-proteine">
        <div className="pannello-testa">
          <span className="etichetta">Proteine</span>
          <span className="cifra-grande">
            {num(totali.p)}
            <span className="cifra-unita">/{obiettivi.p} g</span>
          </span>
        </div>
        <div className="blocchi">
          {Array.from({ length: blocchi }).map((_, i) => {
            const riempimento = Math.max(0, Math.min(1, blocchiPieni - i));
            return (
              <div key={i} className="blocco">
                <div className="blocco-pieno" style={{ height: riempimento * 100 + "%" }} />
              </div>
            );
          })}
        </div>
        <div className="pannello-piede">
          {totali.p >= obiettivi.p
            ? "Obiettivo raggiunto"
            : "Mancano " + num(obiettivi.p - totali.p) + " g — ogni blocco vale 10 g"}
        </div>
      </section>

      {/* calorie */}
      <section className="pannello">
        <div className="pannello-testa">
          <span className="etichetta">Calorie</span>
          <span className={"cifra-grande " + (sforato ? "cifra-rossa" : "")}>
            {sforato ? "+" + num(-restanti) : num(restanti)}
            <span className="cifra-unita">{sforato ? " kcal oltre" : " kcal rimaste"}</span>
          </span>
        </div>
        <div className="nastro">
          <div
            className={"nastro-pieno " + (sforato ? "nastro-sforato" : "")}
            style={{ width: quota * 100 + "%" }}
          />
        </div>
        <div className="pannello-piede">
          {num(totali.kcal)} di {obiettivi.kcal} kcal
        </div>
      </section>

      {/* carboidrati e grassi */}
      <section className="coppia">
        <MacroPiccolo etichetta="Carboidrati" valore={totali.c} obiettivo={obiettivi.c} />
        <MacroPiccolo etichetta="Grassi" valore={totali.g} obiettivo={obiettivi.g} />
      </section>

      <button className="bottone-primario" onClick={vaiAggiungi}>
        Aggiungi quello che hai mangiato
      </button>

      {/* elenco */}
      {perPasto.length === 0 ? (
        <div className="vuoto">
          Nessuna voce per oggi. Registra il primo alimento appena lo mangi: bastano dieci secondi.
        </div>
      ) : (
        perPasto.map(({ pasto, elenco }) => {
          const tp = elenco.reduce((a, v) => a + v.kcal, 0);
          return (
            <section key={pasto} className="gruppo">
              <div className="gruppo-testa">
                <h2 className="gruppo-titolo">{pasto}</h2>
                <span className="gruppo-kcal">{num(tp)} kcal</span>
              </div>
              {elenco.map((v) => (
                <div key={v.id} className="voce">
                  <div className="voce-corpo">
                    <div className="voce-nome">{v.nome}</div>
                    <div className="voce-dati">
                      {num(v.grammi)} {v.unita} · {num(v.kcal)} kcal · P {num(v.p, 1)} · C{" "}
                      {num(v.c, 1)} · G {num(v.g, 1)}
                    </div>
                  </div>
                  <button
                    className="voce-togli"
                    onClick={() => rimuovi(v.id)}
                    aria-label={"Togli " + v.nome}
                  >
                    togli
                  </button>
                </div>
              ))}
            </section>
          );
        })
      )}
    </>
  );
}

function MacroPiccolo({ etichetta, valore, obiettivo }) {
  const q = Math.min(1, valore / Math.max(1, obiettivo));
  return (
    <div className="pannello pannello-mini">
      <div className="etichetta">{etichetta}</div>
      <div className="cifra-media">
        {num(valore)}
        <span className="cifra-unita">/{obiettivo} g</span>
      </div>
      <div className="nastro nastro-sottile">
        <div className="nastro-pieno nastro-neutro" style={{ width: q * 100 + "%" }} />
      </div>
    </div>
  );
}

/* ============================================================
   AGGIUNGI
   ============================================================ */
function SchedaAggiungi({ miei, recenti, aggiungi, salvaAlimentoMio, annulla }) {
  const [cerca, setCerca] = useState("");
  const [scelto, setScelto] = useState(null);
  const [grammi, setGrammi] = useState(100);
  const [pasto, setPasto] = useState(pastoDaOra());
  const [modo, setModo] = useState("cerca"); // cerca | stima | manuale
  const [descrizione, setDescrizione] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const [erroreStima, setErroreStima] = useState("");
  const [manuale, setManuale] = useState({ nome: "", kcal: "", p: "", c: "", g: "" });

  const risultati = useMemo(() => {
    const q = cerca.trim().toLowerCase();
    const tutti = [
      ...miei.map((m) => ({ ...m, mio: true })),
      ...ARCHIVIO,
    ];
    if (!q) return [];
    return tutti
      .filter((a) => a.nome.toLowerCase().includes(q))
      .slice(0, 40);
  }, [cerca, miei]);

  const scegli = (a) => {
    setScelto(a);
    setGrammi(a.porz || 100);
  };

  const stimaConAI = async () => {
    if (!descrizione.trim()) return;
    setInCorso(true);
    setErroreStima("");
    try {
      const risposta = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content:
                "Sei un database nutrizionale italiano. L'utente descrive un alimento o un piatto. " +
                "Restituisci SOLO un oggetto JSON, senza testo attorno e senza backtick, con questi campi: " +
                '{"nome": string breve in italiano, "grammi": number (peso totale stimato della porzione descritta, in grammi), ' +
                '"kcal": number, "p": number, "c": number, "g": number} ' +
                "dove kcal, p, c, g sono i valori PER 100 GRAMMI dell'alimento. " +
                "Se la descrizione indica una quantità, usala per il campo grammi; altrimenti stima una porzione tipica. " +
                "Descrizione: " +
                descrizione,
            },
          ],
        }),
      });
      const dati = await risposta.json();
      const testo = (dati.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      const pulito = testo.replace(/```json|```/g, "").trim();
      const primo = pulito.indexOf("{");
      const ultimo = pulito.lastIndexOf("}");
      const oggetto = JSON.parse(pulito.slice(primo, ultimo + 1));
      if (typeof oggetto.kcal !== "number") throw new Error("formato");
      const alimento = {
        id: "ai" + Date.now(),
        nome: oggetto.nome || descrizione.slice(0, 40),
        kcal: oggetto.kcal,
        p: oggetto.p || 0,
        c: oggetto.c || 0,
        g: oggetto.g || 0,
        porz: oggetto.grammi || 100,
        stimato: true,
      };
      setScelto(alimento);
      setGrammi(alimento.porz);
      setModo("cerca");
    } catch (e) {
      setErroreStima("La stima non è arrivata. Riprova, o inserisci i valori a mano.");
    }
    setInCorso(false);
  };

  const confermaManuale = () => {
    const a = {
      id: "man" + Date.now(),
      nome: manuale.nome.trim() || "Alimento",
      kcal: Number(manuale.kcal) || 0,
      p: Number(manuale.p) || 0,
      c: Number(manuale.c) || 0,
      g: Number(manuale.g) || 0,
      porz: 100,
    };
    setScelto(a);
    setGrammi(100);
    setModo("cerca");
  };

  /* --- pannello quantità --- */
  if (scelto) {
    const f = grammi / 100;
    return (
      <>
        <button className="link-indietro" onClick={() => setScelto(null)}>
          ← Cambia alimento
        </button>
        <section className="pannello">
          <div className="etichetta">{scelto.stimato ? "Stima" : "Alimento"}</div>
          <h2 className="titolo-scelto">{scelto.nome}</h2>
          <div className="riga-base">
            per 100 g: {num(scelto.kcal)} kcal · P {num(scelto.p, 1)} · C {num(scelto.c, 1)} · G{" "}
            {num(scelto.g, 1)}
          </div>

          <div className="etichetta etichetta-sopra">Quantità</div>
          <div className="quantita-riga">
            <button className="passo" onClick={() => setGrammi((x) => Math.max(1, x - 10))}>
              −10
            </button>
            <input
              className="campo-quantita"
              type="number"
              inputMode="numeric"
              value={grammi}
              onChange={(e) => setGrammi(Math.max(0, Number(e.target.value)))}
            />
            <span className="unita">g</span>
            <button className="passo" onClick={() => setGrammi((x) => x + 10)}>
              +10
            </button>
          </div>
          <div className="chip-riga">
            {[scelto.porz || 100, 30, 50, 100, 150, 200, 250]
              .filter((v, i, a) => a.indexOf(v) === i)
              .map((v) => (
                <button
                  key={v}
                  className={"chip " + (grammi === v ? "chip-attivo" : "")}
                  onClick={() => setGrammi(v)}
                >
                  {v} g
                </button>
              ))}
          </div>

          <div className="anteprima">
            <div className="anteprima-kcal">{num(scelto.kcal * f)} kcal</div>
            <div className="anteprima-macro">
              P {num(scelto.p * f, 1)} g · C {num(scelto.c * f, 1)} g · G {num(scelto.g * f, 1)} g
            </div>
          </div>

          <div className="etichetta etichetta-sopra">Pasto</div>
          <div className="chip-riga">
            {PASTI.map((p) => (
              <button
                key={p}
                className={"chip " + (pasto === p ? "chip-attivo" : "")}
                onClick={() => setPasto(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <button className="bottone-primario" onClick={() => aggiungi(scelto, grammi, pasto)}>
            Aggiungi al diario
          </button>
          {(scelto.stimato || String(scelto.id).startsWith("man")) && (
            <button
              className="bottone-secondario"
              onClick={() => {
                salvaAlimentoMio({
                  nome: scelto.nome,
                  kcal: scelto.kcal,
                  p: scelto.p,
                  c: scelto.c,
                  g: scelto.g,
                  porz: grammi,
                });
              }}
            >
              Salva tra i miei alimenti
            </button>
          )}
        </section>
      </>
    );
  }

  /* --- ricerca --- */
  return (
    <>
      <button className="link-indietro" onClick={annulla}>
        ← Torna a oggi
      </button>

      <div className="modo-riga">
        {[
          ["cerca", "Cerca"],
          ["stima", "Descrivi"],
          ["manuale", "A mano"],
        ].map(([k, e]) => (
          <button
            key={k}
            className={"modo " + (modo === k ? "modo-attivo" : "")}
            onClick={() => setModo(k)}
          >
            {e}
          </button>
        ))}
      </div>

      {modo === "cerca" && (
        <>
          <input
            className="campo-cerca"
            placeholder="Pollo, riso, yogurt greco…"
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            autoFocus
          />
          {!cerca && recenti.length > 0 && (
            <section className="gruppo">
              <div className="gruppo-testa">
                <h2 className="gruppo-titolo">Ultimi usati</h2>
              </div>
              {recenti.map((r, i) => (
                <button key={i} className="riga-alimento" onClick={() => scegli(r)}>
                  <span className="riga-nome">{r.nome}</span>
                  <span className="riga-kcal">{num(r.kcal)} kcal / 100 g</span>
                </button>
              ))}
            </section>
          )}
          {cerca && risultati.length === 0 && (
            <div className="vuoto">
              Niente con questo nome. Prova la scheda <strong>Descrivi</strong>: scrivi cosa hai
              mangiato a parole e i valori vengono stimati.
            </div>
          )}
          {risultati.map((a) => (
            <button key={a.id} className="riga-alimento" onClick={() => scegli(a)}>
              <span className="riga-nome">
                {a.nome}
                {a.mio && <span className="tag-mio">mio</span>}
              </span>
              <span className="riga-kcal">{num(a.kcal)} kcal / 100 g</span>
            </button>
          ))}
        </>
      )}

      {modo === "stima" && (
        <section className="pannello">
          <div className="etichetta">Descrivi il pasto</div>
          <textarea
            className="campo-testo"
            rows={3}
            placeholder="Un piatto di pasta al pesto, circa 80 g di pasta secca"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
          />
          <button className="bottone-primario" onClick={stimaConAI} disabled={inCorso}>
            {inCorso ? "Sto stimando…" : "Stima calorie e macro"}
          </button>
          {erroreStima && <div className="errore">{erroreStima}</div>}
          <div className="nota">
            La stima serve per i piatti composti. È un'approssimazione: per gli alimenti singoli
            l'archivio è più preciso.
          </div>
        </section>
      )}

      {modo === "manuale" && (
        <section className="pannello">
          <div className="etichetta">Valori per 100 g</div>
          <input
            className="campo-testo"
            placeholder="Nome dell'alimento"
            value={manuale.nome}
            onChange={(e) => setManuale({ ...manuale, nome: e.target.value })}
          />
          <div className="griglia-manuale">
            {[
              ["kcal", "kcal"],
              ["p", "Proteine"],
              ["c", "Carboidrati"],
              ["g", "Grassi"],
            ].map(([k, et]) => (
              <div key={k}>
                <div className="mini-etichetta">{et}</div>
                <input
                  className="campo-testo"
                  type="number"
                  inputMode="decimal"
                  value={manuale[k]}
                  onChange={(e) => setManuale({ ...manuale, [k]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <button className="bottone-primario" onClick={confermaManuale}>
            Continua
          </button>
        </section>
      )}
    </>
  );
}

/* ============================================================
   STORICO
   ============================================================ */
function SchedaStorico({ indice, obiettivi }) {
  const [aperto, setAperto] = useState(null);
  const [vociGiorno, setVociGiorno] = useState([]);

  const giorni = useMemo(
    () => Object.keys(indice).sort((a, b) => (a < b ? 1 : -1)),
    [indice]
  );

  const ultimi = useMemo(() => giorni.slice(0, 14).reverse(), [giorni]);
  const massimo = Math.max(obiettivi.kcal, ...ultimi.map((d) => indice[d].kcal), 1);

  const media7 = useMemo(() => {
    const s = giorni.slice(0, 7);
    if (s.length === 0) return null;
    return {
      kcal: s.reduce((a, d) => a + indice[d].kcal, 0) / s.length,
      p: s.reduce((a, d) => a + indice[d].p, 0) / s.length,
      n: s.length,
    };
  }, [giorni, indice]);

  const apri = async (d) => {
    if (aperto === d) {
      setAperto(null);
      return;
    }
    const g = await memoria.leggi(chiaveGiorno(d), { voci: [] });
    setVociGiorno(g.voci || []);
    setAperto(d);
  };

  if (giorni.length === 0) {
    return <div className="vuoto">Lo storico si riempie da solo: ogni giorno registrato resta qui.</div>;
  }

  return (
    <>
      {media7 && (
        <section className="pannello">
          <div className="etichetta">Media degli ultimi {media7.n} giorni registrati</div>
          <div className="cifra-media">
            {num(media7.kcal)}
            <span className="cifra-unita"> kcal · {num(media7.p)} g di proteine</span>
          </div>
          <div className="pannello-piede">
            {media7.kcal <= obiettivi.kcal
              ? "Sotto l'obiettivo di " + num(obiettivi.kcal - media7.kcal) + " kcal al giorno"
              : "Sopra l'obiettivo di " + num(media7.kcal - obiettivi.kcal) + " kcal al giorno"}
          </div>
        </section>
      )}

      <section className="pannello">
        <div className="etichetta">Ultimi giorni</div>
        <div className="grafico">
          {ultimi.map((d) => {
            const v = indice[d];
            const h = (v.kcal / massimo) * 100;
            return (
              <div key={d} className="colonna" title={d}>
                <div className="colonna-corpo">
                  <div
                    className={"colonna-barra " + (v.kcal > obiettivi.kcal ? "colonna-sforata" : "")}
                    style={{ height: h + "%" }}
                  />
                </div>
                <div className="colonna-etichetta">{dataBreve(d)}</div>
              </div>
            );
          })}
          <div
            className="linea-obiettivo"
            style={{ bottom: 22 + (obiettivi.kcal / massimo) * 118 + "px" }}
          />
        </div>
      </section>

      {giorni.map((d) => {
        const v = indice[d];
        return (
          <div key={d} className="gruppo">
            <button className="giorno-riga" onClick={() => apri(d)}>
              <div>
                <div className="giorno-data">{dataEstesa(d)}</div>
                <div className="giorno-macro">
                  P {v.p} · C {v.c} · G {v.g} · {v.n} voci
                </div>
              </div>
              <div className={"giorno-kcal " + (v.kcal > obiettivi.kcal ? "cifra-rossa" : "")}>
                {v.kcal} kcal
              </div>
            </button>
            {aperto === d && (
              <div className="dettaglio">
                {vociGiorno.map((x) => (
                  <div key={x.id} className="dettaglio-voce">
                    <span>
                      {x.nome} <span className="dettaglio-g">{num(x.grammi)} g</span>
                    </span>
                    <span>{num(x.kcal)} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

/* ============================================================
   IMPOSTAZIONI
   ============================================================ */
function SchedaImpostazioni({ obiettivi, aggiornaObiettivi, miei, eliminaAlimentoMio, indice }) {
  const [bozza, setBozza] = useState(obiettivi);
  const [esporta, setEsporta] = useState("");
  const [inCorso, setInCorso] = useState(false);

  const generaEsportazione = async () => {
    setInCorso(true);
    const chiavi = await memoria.elenca("diario:giorno:");
    const tutto = {};
    for (const k of chiavi) {
      const d = k.replace("diario:giorno:", "");
      const g = await memoria.leggi(k, null);
      if (g) tutto[d] = g;
    }
    setEsporta(JSON.stringify({ obiettivi, giorni: tutto }, null, 1));
    setInCorso(false);
  };

  return (
    <>
      <section className="pannello">
        <div className="etichetta">Obiettivi giornalieri</div>
        <div className="griglia-manuale">
          {[
            ["kcal", "Calorie"],
            ["p", "Proteine (g)"],
            ["c", "Carboidrati (g)"],
            ["g", "Grassi (g)"],
          ].map(([k, et]) => (
            <div key={k}>
              <div className="mini-etichetta">{et}</div>
              <input
                className="campo-testo"
                type="number"
                inputMode="numeric"
                value={bozza[k]}
                onChange={(e) => setBozza({ ...bozza, [k]: Number(e.target.value) })}
              />
            </div>
          ))}
        </div>
        <button className="bottone-primario" onClick={() => aggiornaObiettivi(bozza)}>
          Salva obiettivi
        </button>
      </section>

      <section className="pannello">
        <div className="etichetta">I miei alimenti ({miei.length})</div>
        {miei.length === 0 ? (
          <div className="nota">
            Gli alimenti che stimi o inserisci a mano puoi salvarli qui, così la volta dopo li
            ritrovi in un tocco.
          </div>
        ) : (
          miei.map((m) => (
            <div key={m.id} className="voce">
              <div className="voce-corpo">
                <div className="voce-nome">{m.nome}</div>
                <div className="voce-dati">
                  {num(m.kcal)} kcal · P {num(m.p, 1)} · C {num(m.c, 1)} · G {num(m.g, 1)} / 100 g
                </div>
              </div>
              <button className="voce-togli" onClick={() => eliminaAlimentoMio(m.id)}>
                togli
              </button>
            </div>
          ))
        )}
      </section>

      <section className="pannello">
        <div className="etichetta">Copia di sicurezza</div>
        <div className="nota">
          {Object.keys(indice).length} giorni registrati. Genera il testo e incollalo dove vuoi:
          è il tuo diario in chiaro.
        </div>
        <button className="bottone-secondario" onClick={generaEsportazione} disabled={inCorso}>
          {inCorso ? "Raccolgo i dati…" : "Genera copia"}
        </button>
        {esporta && (
          <textarea className="campo-testo campo-export" rows={8} readOnly value={esporta} />
        )}
      </section>
    </>
  );
}

/* ============================================================
   STILE
   ============================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@500;600;700&family=Inter+Tight:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.app {
  --carta: #E9ECE6;
  --superficie: #FFFFFF;
  --inchiostro: #141B18;
  --tenue: #5B6661;
  --linea: #CDD3CB;
  --blu: #1F4A6B;
  --senape: #C08411;
  --rosso: #A3341F;

  font-family: 'Inter Tight', system-ui, sans-serif;
  background: var(--carta);
  color: var(--inchiostro);
  min-height: 100vh;
  padding: 0 0 84px;
  max-width: 560px;
  margin: 0 auto;
  -webkit-font-smoothing: antialiased;
}
.app * { box-sizing: border-box; }
.app button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
.app input, .app textarea { font-family: inherit; }

.schermo-attesa { display: flex; align-items: center; justify-content: center; min-height: 60vh; }
.attesa-testo { color: var(--tenue); font-size: 15px; }

/* testata */
.testata { padding: 22px 18px 12px; }
.testata-riga { display: flex; justify-content: space-between; align-items: flex-start; }
.occhiello {
  font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--tenue); margin-bottom: 4px;
}
.data-titolo {
  font-family: 'Familjen Grotesk', sans-serif; font-weight: 700; font-size: 34px;
  line-height: 1; margin: 0; letter-spacing: -0.02em;
}
.data-sotto { font-size: 13px; color: var(--tenue); margin-top: 5px; }
.spia {
  font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: var(--tenue);
  padding-top: 6px; transition: opacity .2s; letter-spacing: .04em;
}
.spia-errore { color: var(--rosso); }

.avviso {
  margin: 0 18px 12px; padding: 11px 13px; background: var(--inchiostro); color: #EFF2EE;
  font-size: 13px; border-radius: 3px; display: flex; justify-content: space-between; gap: 10px;
}
.avviso-x { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; opacity: .65; white-space: nowrap; }

.corpo { padding: 0 18px; display: flex; flex-direction: column; gap: 12px; }

/* pannelli */
.pannello {
  background: var(--superficie); border: 1px solid var(--linea); border-radius: 3px;
  padding: 16px;
}
.pannello-mini { padding: 13px; }
.coppia { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.pannello-testa { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.pannello-piede { font-size: 12.5px; color: var(--tenue); margin-top: 11px; }

.etichetta {
  font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--tenue);
}
.etichetta-sopra { margin-top: 20px; display: block; }
.mini-etichetta { font-size: 11.5px; color: var(--tenue); margin-bottom: 4px; }

.cifra-grande {
  font-family: 'Familjen Grotesk', sans-serif; font-weight: 700; font-size: 30px;
  letter-spacing: -0.02em; line-height: 1; font-variant-numeric: tabular-nums;
}
.cifra-media {
  font-family: 'Familjen Grotesk', sans-serif; font-weight: 600; font-size: 22px;
  margin: 6px 0 9px; font-variant-numeric: tabular-nums; letter-spacing: -0.01em;
}
.cifra-unita { font-family: 'Inter Tight', sans-serif; font-weight: 400; font-size: 13px; color: var(--tenue); }
.cifra-rossa { color: var(--rosso); }

/* SIGNATURE: blocchi da 10 g di proteine */
.pannello-proteine { border-color: #B9C2B8; }
.blocchi { display: flex; gap: 3px; margin-top: 15px; height: 46px; }
.blocco {
  flex: 1; background: #EDEFEA; border: 1px solid var(--linea); border-radius: 1px;
  display: flex; align-items: flex-end; overflow: hidden; min-width: 0;
}
.blocco-pieno { width: 100%; background: var(--senape); transition: height .35s cubic-bezier(.2,.7,.3,1); }

/* nastro calorie */
.nastro {
  height: 9px; background: #EDEFEA; border: 1px solid var(--linea); border-radius: 1px;
  margin-top: 14px; overflow: hidden;
}
.nastro-sottile { height: 6px; margin-top: 4px; }
.nastro-pieno { height: 100%; background: var(--blu); transition: width .35s cubic-bezier(.2,.7,.3,1); }
.nastro-neutro { background: #7A8A84; }
.nastro-sforato { background: var(--rosso); }

/* bottoni */
.bottone-primario {
  width: 100%; background: var(--inchiostro); color: #F2F5F1; padding: 15px;
  border-radius: 3px; font-size: 15px; font-weight: 600; margin-top: 16px;
  transition: transform .12s, opacity .12s;
}
.bottone-primario:active { transform: scale(.985); }
.bottone-primario:disabled { opacity: .5; }
.bottone-secondario {
  width: 100%; background: transparent; color: var(--inchiostro); padding: 13px;
  border: 1px solid var(--inchiostro); border-radius: 3px; font-size: 14px;
  font-weight: 500; margin-top: 9px;
}
.link-indietro { font-size: 13.5px; color: var(--tenue); padding: 4px 0; text-align: left; }

/* elenco voci */
.gruppo { margin-top: 6px; }
.gruppo-testa {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 6px 2px 8px; border-bottom: 1px solid var(--linea);
}
.gruppo-titolo {
  font-family: 'Familjen Grotesk', sans-serif; font-size: 15px; font-weight: 600;
  margin: 0; letter-spacing: -0.01em;
}
.gruppo-kcal { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--tenue); }
.voce {
  display: flex; align-items: center; gap: 10px; padding: 11px 2px;
  border-bottom: 1px solid var(--linea);
}
.voce-corpo { flex: 1; min-width: 0; }
.voce-nome { font-size: 14.5px; font-weight: 500; }
.voce-dati {
  font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--tenue); margin-top: 3px;
}
.voce-togli {
  font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: var(--tenue);
  border: 1px solid var(--linea); border-radius: 2px; padding: 5px 8px; flex-shrink: 0;
}
.voce-togli:active { background: var(--rosso); color: #fff; border-color: var(--rosso); }

.vuoto {
  background: var(--superficie); border: 1px dashed var(--linea); border-radius: 3px;
  padding: 20px; font-size: 14px; color: var(--tenue); line-height: 1.5;
}

/* ricerca e campi */
.modo-riga { display: flex; gap: 6px; }
.modo {
  flex: 1; padding: 10px; font-size: 13.5px; font-weight: 500;
  border: 1px solid var(--linea); border-radius: 3px; background: var(--superficie); color: var(--tenue);
}
.modo-attivo { background: var(--inchiostro); color: #F2F5F1; border-color: var(--inchiostro); }
.campo-cerca {
  width: 100%; padding: 14px; font-size: 16px; border: 1px solid var(--linea);
  border-radius: 3px; background: var(--superficie); color: var(--inchiostro);
}
.campo-cerca:focus, .campo-testo:focus, .campo-quantita:focus { outline: 2px solid var(--blu); outline-offset: 1px; }
.campo-testo {
  width: 100%; padding: 12px; font-size: 15px; border: 1px solid var(--linea);
  border-radius: 3px; background: var(--superficie); color: var(--inchiostro); margin-top: 8px;
  resize: vertical;
}
.campo-export { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; }
.griglia-manuale { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
.griglia-manuale .campo-testo { margin-top: 0; }

.riga-alimento {
  width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 10px;
  padding: 13px 2px; border-bottom: 1px solid var(--linea); text-align: left;
}
.riga-nome { font-size: 14.5px; }
.riga-kcal { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--tenue); white-space: nowrap; }
.tag-mio {
  font-family: 'IBM Plex Mono', monospace; font-size: 9px; text-transform: uppercase;
  letter-spacing: .1em; border: 1px solid var(--linea); border-radius: 2px;
  padding: 1px 4px; margin-left: 7px; color: var(--tenue);
}

.titolo-scelto {
  font-family: 'Familjen Grotesk', sans-serif; font-size: 21px; font-weight: 600;
  margin: 7px 0 5px; letter-spacing: -0.01em;
}
.riga-base { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--tenue); }

.quantita-riga { display: flex; align-items: center; gap: 9px; margin-top: 9px; }
.passo {
  width: 54px; padding: 13px 0; border: 1px solid var(--linea); border-radius: 3px;
  background: var(--superficie); font-size: 15px; font-weight: 600;
}
.passo:active { background: var(--inchiostro); color: #fff; }
.campo-quantita {
  flex: 1; padding: 13px; font-size: 19px; font-weight: 600; text-align: center;
  border: 1px solid var(--linea); border-radius: 3px; background: var(--superficie);
  font-family: 'Familjen Grotesk', sans-serif; color: var(--inchiostro); min-width: 0;
}
.unita { font-size: 14px; color: var(--tenue); }
.chip-riga { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 9px; }
.chip {
  padding: 8px 12px; border: 1px solid var(--linea); border-radius: 20px;
  font-size: 13px; background: var(--superficie);
}
.chip-attivo { background: var(--inchiostro); color: #F2F5F1; border-color: var(--inchiostro); }

.anteprima {
  margin-top: 16px; padding: 13px; background: var(--carta);
  border-radius: 3px; border: 1px solid var(--linea);
}
.anteprima-kcal {
  font-family: 'Familjen Grotesk', sans-serif; font-size: 25px; font-weight: 700;
  letter-spacing: -0.02em; font-variant-numeric: tabular-nums;
}
.anteprima-macro {
  font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; color: var(--tenue); margin-top: 4px;
}

.nota { font-size: 12.5px; color: var(--tenue); line-height: 1.5; margin-top: 10px; }
.errore { font-size: 13px; color: var(--rosso); margin-top: 10px; }

/* grafico storico */
.grafico {
  display: flex; gap: 4px; align-items: flex-end; height: 140px;
  margin-top: 14px; position: relative;
}
.colonna { flex: 1; display: flex; flex-direction: column; height: 100%; min-width: 0; }
.colonna-corpo { flex: 1; display: flex; align-items: flex-end; }
.colonna-barra { width: 100%; background: var(--blu); border-radius: 1px 1px 0 0; }
.colonna-sforata { background: var(--rosso); }
.colonna-etichetta {
  font-family: 'IBM Plex Mono', monospace; font-size: 8.5px; color: var(--tenue);
  text-align: center; padding-top: 5px; white-space: nowrap; overflow: hidden;
}
.linea-obiettivo {
  position: absolute; left: 0; right: 0; height: 0;
  border-top: 1px dashed var(--senape); pointer-events: none;
}

.giorno-riga {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  gap: 10px; padding: 13px 2px; border-bottom: 1px solid var(--linea); text-align: left;
}
.giorno-data { font-size: 14.5px; font-weight: 500; }
.giorno-macro { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: var(--tenue); margin-top: 3px; }
.giorno-kcal {
  font-family: 'Familjen Grotesk', sans-serif; font-size: 17px; font-weight: 600;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.dettaglio { padding: 9px 2px 13px; }
.dettaglio-voce {
  display: flex; justify-content: space-between; gap: 10px; font-size: 12.5px;
  color: var(--tenue); padding: 4px 0;
}
.dettaglio-g { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; }

/* barra di navigazione */
.barra {
  position: fixed; bottom: 0; left: 0; right: 0; display: flex;
  background: var(--superficie); border-top: 1px solid var(--linea);
  max-width: 560px; margin: 0 auto; padding-bottom: env(safe-area-inset-bottom);
}
.barra-voce {
  flex: 1; padding: 15px 4px; font-size: 12px; color: var(--tenue);
  border-top: 2px solid transparent; margin-top: -1px; font-weight: 500;
}
.barra-attiva { color: var(--inchiostro); border-top-color: var(--inchiostro); font-weight: 600; }

@media (prefers-reduced-motion: reduce) {
  .app * { transition: none !important; }
}
`;
