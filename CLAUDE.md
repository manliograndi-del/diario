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
- **Pubblica da solo su `main` senza richiedere il permesso ogni volta** (autorizzato
  il 2026-08-18). Il ramo di lavoro non gli serve a niente: lui vede solo il sito
  pubblicato. Restano validi gli obblighi di sempre: provare prima di pubblicare,
  alzare la versione della cache, e dirgli in italiano cosa cambia per lui.

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

- `diario.config` → `{ob:{kcal,fab,p,c,g}, miei:[...], recenti:[...], tema, fabV}`
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

- **L'anello esterno è tarato sul fabbisogno, non sull'obiettivo (1500).**
  Così l'arco vuoto rappresenta il deficit. La tacca nera segna l'obiettivo.
- **Il fabbisogno è 2200 kcal dal 2026-08-21** (prima 2500, l'ha chiesto lui).
  Cambiare `OB_DEF` non bastava: il numero vecchio era già salvato in
  `diario.config` sul suo telefono. La conversione la fa `FAB_V` in `avvia()`, una
  volta sola e **solo se lì c'è ancora il valore di fabbrica 2500**: un fabbisogno
  scelto a mano in Impostazioni non viene mai toccato.
  **Attenzione:** `fabV` va scritto anche da `salvaCfg()`, altrimenti la conversione
  riparte a ogni avvio. `ripristina()` invece non lo scrive apposta, così un backup
  di prima del 2026-08-21 (che riporta 2500) viene riconvertito al riavvio.
  Da 2200 discende tutto il resto: l'anello, il deficit, i grammi di grasso e
  l'obiettivo del cerchio, che ora sta a ~91 g invece di 130.
- **L'anello interno sono le proteine** su 160 g.
- **Il cerchio dei grammi di grasso** usa 7700 kcal ≈ 1 kg. Era una colonna verticale
  fino al 2026-08-18: lui ha chiesto un cerchio, e il cerchio è più leggibile.
  Il **diametro** è proporzionale ai grammi risparmiati sul massimo teorico (il
  fabbisogno intero, ~286 g con 2200 kcal): pieno quando non hai mangiato niente, si
  sgonfia man mano che mangi. Il cerchio tratteggiato segna i grammi dell'obiettivo
  (~91 g). La cifra è orizzontale, grande e **senza `g`** — l'ha chiesto così.
  Il colore è ancorato all'obiettivo: ambra a 0 g, **verde pieno sull'obiettivo** (i
  ~91 g), poi virata al rosso, rosso pieno al doppio. Quei numeri non sono scritti da
  nessuna parte: escono da fabbisogno e obiettivo, e si spostano se lui li cambia.
  **Sopra il fabbisogno il cerchio diventa rosso e conta i grammi guadagnati**
  (dal 2026-08-21). Prima il conto si fermava a zero: una giornata sopra il
  fabbisogno sembrava una giornata neutra, e con 2200 kcal capita molto più spesso
  che con 2500. `grammiGrasso()` tiene il segno, `grammiPersi()` e `grammiSopra()`
  ne prendono i due lati. Il disco rosso cresce sulla scala dell'obiettivo: pieno
  quando hai messo su tanto quanto in una buona giornata ne avresti tolto. Lì il
  tratteggio dell'obiettivo sparisce, finirebbe sotto il disco.
  Il gradiente **non è monotòno di proposito**: un gradiente che diventa sempre più
  verde man mano che mangi meno premierebbe il non mangiare. Se chiede di renderlo
  monotòno, fallo, ma ricordagli perché era così.
- **La striscia dei 7 giorni** mostra i giorni di calendario, non i 7 registrati. Le
  medie si calcolano solo sui giorni con dati, così un giorno saltato non abbassa la media.
  Dal 2026-08-22 è una **finestra che scorre**: di norma finisce su oggi (`S.finestra`
  vale `null`), e scorrendo il dito oltre il bordo sinistro arretra di un giorno per
  volta. Quando è arretrata l'etichetta diventa "Dal 13/8 al 19/8" e il grassetto di
  "oggi" segue il giorno vero, non l'ultimo cerchio. Chiudere il giorno o cambiare
  schermata la riporta su oggi.
- **Niente stima AI degli alimenti.** C'era nella versione artifact, è stata tolta perché
  richiede una chiave API. Al suo posto c'è "Ricetta", che compone un piatto dagli
  ingredienti e lo salva come alimento riutilizzabile.
- **Il quadrante grande segue il giorno aperto nella striscia.** Anelli, cifre,
  grasso e macro parlano di quel giorno, e anche il titolo della pagina; per un
  giorno passato spariscono il pulsante “Aggiungi” e l'elenco con i “togli”,
  perché non si modifica. Prima i numeri grandi restavano di oggi mentre sotto si
  leggeva un altro giorno, e non si capiva a cosa si riferissero.
- **Nella striscia dei 7 giorni si tocca un giorno** e si apre sotto la scheda
  completa: totali, confronto con l'obiettivo, voci raggruppate per pasto con l'ora,
  in ordine di orario.
  **Tutti e sette i cerchi rispondono**, oggi compreso e anche i giorni senza voci
  (che dicono di essere vuoti). Le prime versioni lasciavano inerti oggi e i giorni
  vuoti perché non avevano niente da aggiungere: Manlio ha toccato cinque cerchi
  morti e ha concluso che l'app era rotta. Non reintrodurre eccezioni qui.
  Lo stesso blocco (`dettaglioGiorno`) alimenta anche il dettaglio nello Storico:
  se lo cambi, cambiano tutti e due.
- **Il titolone in cima dice dove sei** (chiesto il 2026-08-21). Prima era sempre
  "Oggi" con la data, in tutte e quattro le schermate: sopra lo Storico sembrava un
  errore. Ora è "Aggiungi", "Storico" o "Impostazioni"; nella schermata di oggi è
  "Oggi", e con un giorno aperto è il nome di quel giorno.
- **La testata è alta sempre uguale, 85 px** (chiesto il 2026-08-22). La seconda riga
  — la data, i giorni registrati — sta **di fianco** al titolo, non sotto: quando era
  sotto, passando da oggi a un giorno passato la testata si accorciava e tutta la
  pagina saliva di scatto sotto il dito. Perciò il titolo di un giorno passato è il
  nome del giorno ("Mercoledì") con "19 settembre" accanto in piccolo: intero
  andrebbe a capo sui telefoni stretti, e si tornerebbe da capo.
  Provato a 320, 390 e 430 px su tutte e quattro le schermate: 85 px sempre.
  **Per la stessa ragione la riga "Giorno passato / torna a oggi" dentro il quadrante
  c'è anche su oggi**, dove porta solo l'etichetta "Oggi": se comparisse soltanto sui
  giorni passati, i cerchi scenderebbero di quaranta pixel a ogni scorrimento.
- **Il cambio giorno ha una transizione** (chiesta il 2026-08-22): testata e corpo
  entrano dal lato da cui arrivi, 0,24 s (`da-destra` / `da-sinistra`, `S.anima`,
  azzerata subito dopo il disegno perché un ridisegno qualsiasi non la rifaccia).
  Vale sia per il dito sia per il tocco sulla striscia e su "torna a oggi", ma non
  nello Storico, dove si apre una scheda dentro la pagina e non si cambia pagina.
  **Non è il dito che trascina la pagina**: per quello servirebbero due schermate
  disegnate insieme, e l'app ne disegna una sola per volta — è la scelta che la tiene
  semplice. Se lo chiede, digli che costa quello.
- **Lo Storico si apre sul mese** (chiesto il 2026-08-21). Calendario del mese con i
  giorni registrati toccabili, una lineetta colorata sotto il numero — verde sotto
  l'obiettivo, blu in deficit, rossa sopra il fabbisogno — e sotto i totali: grammi
  di grasso persi (o guadagnati) nel mese, giorni registrati, giorni sotto
  l'obiettivo, medie di calorie, proteine, carboidrati e grassi.
  Le frecce si fermano al primo mese registrato e al mese corrente; i mesi vuoti in
  mezzo si aprono lo stesso, un mese senza niente dice quanto uno pieno.
  I giorni senza dati sono grigi e piatti, non pulsanti muti.
  **La scheda del giorno toccato compare subito sotto il calendario**, non in fondo
  al pannello: là sarebbe fuori schermo e il tocco sembrerebbe non fare niente.
  Lo stesso giorno compare anche nell'elenco sotto: `S.apertoDove` dice da dove è
  stato toccato, altrimenti la scheda si aprirebbe in due posti insieme.
  **I grammi di ogni mese passato sono ricalcolati con il fabbisogno di adesso**, di
  proposito: serve a confrontare i mesi con lo stesso metro. Se cambia il
  fabbisogno, cambia tutto lo storico.
- **Sul quadrante si cambia giorno scorrendo il dito** (chiesto il 2026-08-22):
  a destra il giorno prima, a sinistra quello dopo. Oltre oggi non si va, e indietro
  si arriva **fino al primo giorno registrato** (i sette giorni della striscia si
  aprono sempre, anche su un diario appena cominciato): `primoGiorno()`. La striscia
  arretra insieme al giorno, così dove sei è sempre segnato sotto.
  Il gesto vale **solo sul quadrante**, non su tutta la pagina: più in basso ci sono
  elenchi e pulsanti, e un dito storto lì avrebbe cambiato giorno per sbaglio.
  Sono eventi `pointer`, non `touch`: valgono anche col mouse, e il browser manda
  `pointercancel` appena capisce che quel dito sta scorrendo la pagina, quindi un
  movimento verticale non cambia mai giorno. Serve `touch-action:pan-y` sul
  `.quadrante`, altrimenti lo scorrimento verticale se lo prende tutto il browser
  e quello orizzontale non arriva mai. Soglie: 50 px di corsa, meno di 40 px di
  deriva verticale.
  **Serve anche `user-select:none` sul `.quadrante`**: senza, un dito che parte sopra
  un numero fa partire il trascinamento del testo, il browser manda `pointercancel` e
  il giorno non cambia. Capitava solo su certi giorni — dove al centro del quadrante
  cadeva una scritta invece del disegno — cioè il difetto peggiore, quello che sembra
  un capriccio dell'app.
- **Niente istruzioni scritte sotto i cerchi** (chiesto il 2026-08-22). Sono stati
  tolti l'invito "Tocca un giorno... oppure scorri con il dito" sotto la striscia e
  tutto il paragrafo che spiegava il cerchio del grasso e le 7700 kcal. Sotto la
  striscia resta solo la media di calorie e proteine. Chi usa l'app tutti i giorni
  quelle spiegazioni le ha già lette: non riaggiungerle per rendere una funzione
  nuova "scopribile", diglielo qui in chat invece.
- **Il salvataggio è ritardato di 500 ms** per non riscrivere a ogni tocco, e viene
  forzato su `pagehide` e `visibilitychange`. Senza quel recupero, una voce
  registrata e seguita dalla chiusura immediata dell'app andrebbe persa.
- **Sincronizzazione fra dispositivi: chiesta il 2026-08-18, rimandata da lui.**
  Vuole ritrovare il diario ovunque si colleghi. Richiede un server e un accesso con
  password: fattibile e gratuito a questi volumi, ma la configurazione su un pannello
  esterno tocca a lui, e quel tipo di navigazione gli costa fatica. Se si riprende il
  discorso: il telefono resta la fonte di verità, si registra sempre in locale e
  subito anche senza rete, la sincronia avviene dopo. Non barattare il funzionamento
  offline per la sincronia.
- Il travaso fra dispositivi oggi si fa da Impostazioni: si scarica il file di backup
  e sull'altro dispositivo si usa “Scegli il file di backup”.
- **Tema scuro automatico dalle 20 alle 7** (chiesto il 2026-08-18), con Automatico /
  Chiaro / Scuro in Impostazioni. **Non** segue `prefers-color-scheme`: chi tiene il
  telefono sempre su chiaro non vedrebbe mai cambiare niente e penserebbe che sia
  rotto. L'ora si comporta sempre allo stesso modo.
  Cambia solo i neutri: blu, senape, verde e rosso restano quello che significano,
  solo schiariti quanto basta per leggersi sul fondo scuro.
  Il tema vive in `:root[data-tema="scuro"]`. **Ogni colore va preso da una variabile
  CSS**, anche dentro gli SVG (`style="stroke:var(--blu)"`, non `stroke="#1F4A6B"`).
  L'unica eccezione è `coloreGrassi()`, che calcola una sfumatura: ha due terne RGB e
  legge `temaScuro()`. Se aggiungi un colore fisso, al buio sparisce.
- L'archivio conta ~125 alimenti italiani con valori per 100 g. Aggiungerne è sicuro.

## Aspetto

Palette (variabili CSS in `:root`, usale, non inventare colori):
`--carta #E9ECE6` · `--superficie #FFF` · `--inchiostro #141B18` · `--tenue #5B6661`
`--linea #CDD3CB` · `--blu #1F4A6B` (calorie) · `--senape #C08411` (proteine)
`--rosso #A3341F` · `--verde #2E6B4F` (aggiunto davvero il 2026-08-21: prima il
verde esisteva solo dentro `coloreGrassi()` e questo file lo dava per scontato)
Più `--su-inchiostro` (il testo sopra i fondi color inchiostro), `--traccia` (le piste
vuote di anelli e nastri), `--neutro`, `--linea-prot`. Servono al tema scuro: se scrivi
un colore fisso invece di una variabile, di notte diventa illeggibile.

Angoli quasi vivi (3px), pannelli bianchi bordati su fondo grigio-verde, numeri
tabulari e grandi, etichette in maiuscoletto monospaziato. Sobrio, strumentale.
Non aggiungere ombre, sfumature o animazioni decorative.

## Prima di chiudere una sessione

1. **Alza il numero di versione della cache in `sw.js`** (`diario-v15` → `diario-v16`).
   Dal 2026-08-18 il service worker chiede la pagina prima alla rete, quindi una
   versione nuova arriva con un ricaricamento solo; il numero di cache va alzato
   lo stesso, governa la copia di riserva usata offline.
2. Verifica che l'app si apra e che una voce registrata sopravviva a un ricaricamento.
3. Digli **in italiano e senza gergo** cosa vedrà di diverso, e che deve ricaricare
   due volte perché il service worker si aggiorni.

## File del repo

- `index.html` — tutta l'app
- `sw.js` — funzionamento offline; il numero di cache va alzato a ogni rilascio
- `manifest.webmanifest` — installazione sulla schermata Home
- `icon-192.png`, `icon-512.png` — icone
