# Diario alimentare — memoria di progetto

Leggi tutto questo file prima di toccare qualsiasi cosa.

## Chi è l'utente e come lavora

Manlio. **Non legge il codice** e non usa il terminale. Verifica il lavoro in un solo
modo: apre l'indirizzo pubblicato sul telefono e guarda se l'app funziona ancora.

Conseguenze operative:
- Non chiedergli di leggere un diff o di valutare un'implementazione. Spiega **cosa
  cambia per lui**, non come.
- Non lasciare mai il repo in uno stato non funzionante fra una sessione e l'altra.
- Prima di modifiche che toccano i dati salvati, digli di scaricare il backup da
  Impostazioni.
- Scrivi in italiano.

## Cos'è

Diario alimentare per telefono. Registra i pasti nel momento in cui li mangia, mostra
subito calorie e macronutrienti, archivia ogni giorno senza perdere lo storico.
Serve a seguire una fase di deficit calorico con controllo delle proteine.

Pubblicato su GitHub Pages: `https://manliograndi-del.github.io/diario/`
(tutto minuscolo: la repository è stata rinominata da `Diario` a `diario` il 2026-08-18,
il vecchio indirizzo con la D maiuscola non vale più).

## Vincoli tecnici — non negoziabili senza chiederglielo

1. **Un solo file**: tutta l'app sta in `index.html`. HTML, CSS e JavaScript insieme.
2. **Nessun build, nessun framework, nessun npm.** JavaScript semplice, ES5-compatibile.
   Niente React, niente bundler, niente passaggi di compilazione.
3. **Nessuna dipendenza esterna a runtime.** Niente CDN, niente Google Fonts, niente
   chiamate di rete. L'app deve funzionare in aereo. I caratteri sono quelli di sistema
   apposta.
4. **Nessuna chiave API.** Il repo è pubblico.
5. **Mobile prima di tutto.** Larghezza massima 560 px, aree toccabili grandi, si usa
   con una mano in cucina o al ristorante.

## Come sono salvati i dati — romperlo significa cancellargli il diario

`localStorage`, con questi prefissi:

- `diario.config` → `{ob:{kcal,fab,p,c,g}, miei:[...], recenti:[...]}`
- `diario.indice` → `{"2026-08-17": {kcal,p,c,g,n}, ...}` — riepiloghi per lo storico
- `diario.g.YYYY-MM-DD` → `{voci:[...], totali:{...}}` — un file per giorno

**Attenzione, questo è controintuitivo:** sull'origine `manliograndi-del.github.io` vive
anche l'app Palestra, e le due condividono lo stesso `localStorage`. La separazione è
data **solo dal prefisso**. Non usare mai chiavi senza prefisso `diario.`, e non
rinominare i prefissi esistenti.

Se cambi la forma dei dati salvati, scrivi codice che legge anche il formato vecchio.
Non c'è un server da cui recuperare: quei dati esistono solo sul suo telefono.

## Decisioni di progetto già prese, con la ragione

Non ribaltarle senza dirglielo esplicitamente.

- **L'anello esterno è tarato sul fabbisogno (2500 kcal), non sull'obiettivo (1500).**
  Così l'arco vuoto rappresenta il deficit. La tacca nera segna l'obiettivo.
- **L'anello interno sono le proteine** su 160 g.
- **La colonna dei grammi di grasso** usa 7700 kcal ≈ 1 kg. Il colore è ancorato
  all'obiettivo: ambra a 0 g, **verde pieno a 130 g** (il suo target), poi virata al
  rosso, rosso pieno a 260 g.
  Il gradiente **non è monotòno di proposito**: un gradiente che diventa sempre più
  verde man mano che mangi meno premierebbe il non mangiare. Se chiede di renderlo
  monotòno, fallo, ma ricordagli perché era così.
- **La striscia dei 7 giorni** mostra i giorni di calendario, non i 7 registrati. Le
  medie si calcolano solo sui giorni con dati, così un giorno saltato non abbassa la media.
- **Niente stima AI degli alimenti.** C'era nella versione artifact, è stata tolta perché
  richiede una chiave API. Al suo posto c'è "Ricetta", che compone un piatto dagli
  ingredienti e lo salva come alimento riutilizzabile.
- L'archivio conta ~125 alimenti italiani con valori per 100 g. Aggiungerne è sicuro.

## Aspetto

Palette (variabili CSS in `:root`, usale, non inventare colori):
`--carta #E9ECE6` · `--superficie #FFF` · `--inchiostro #141B18` · `--tenue #5B6661`
`--linea #CDD3CB` · `--blu #1F4A6B` (calorie) · `--senape #C08411` (proteine)
`--rosso #A3341F` · `--verde #2E6B4F`

Angoli quasi vivi (3px), pannelli bianchi bordati su fondo grigio-verde, numeri
tabulari e grandi, etichette in maiuscoletto monospaziato. Sobrio, strumentale.
Non aggiungere ombre, sfumature o animazioni decorative.

## Prima di chiudere una sessione

1. **Alza il numero di versione della cache in `sw.js`** (`diario-v2` → `diario-v3`).
   Se non lo fai, il telefono continua a servire la versione vecchia dalla cache e
   Manlio vede la modifica sparire nel nulla. È l'errore che si ripete più spesso.
2. Verifica che l'app si apra e che una voce registrata sopravviva a un ricaricamento.
3. Digli **in italiano e senza gergo** cosa vedrà di diverso, e che deve ricaricare
   due volte perché il service worker si aggiorni.

## File del repo

- `index.html` — tutta l'app
- `sw.js` — funzionamento offline; il numero di cache va alzato a ogni rilascio
- `manifest.webmanifest` — installazione sulla schermata Home
- `icon-192.png`, `icon-512.png` — icone
