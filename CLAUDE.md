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
  il 2026-08-18, confermato il 2026-08-22). Il ramo di lavoro non gli serve a niente:
  lui vede solo il sito pubblicato. Restano validi gli obblighi di sempre: provare
  prima di pubblicare, alzare la versione della cache, e dirgli in italiano cosa
  cambia per lui.
- **Fermalo prima solo per le cose grosse.** Regola sua, scelta il 2026-08-22 fra tre
  possibili. Tre cassetti, e lui vuole sapere in quale sta la sua richiesta:
  - *gratis* — testi, colori, numeri, alimenti nuovi, statistiche calcolate da dati
    che ci sono già, correzioni di difetti. Falle e raccontagliele dopo.
  - *costa* — gesti nuovi, schermate nuove, tutto ciò che cambia **come sono scritti
    i dati salvati**. Fattibile, ma digli prima quanto aggiunge e cosa rischia.
  - *cambia l'app* — sincronizzazione fra dispositivi, accesso con password,
    notifiche, riconoscere il cibo da una foto. Non sono difficili: sono un'altra
    cosa, e romperebbero il patto di adesso (niente rete, niente account, niente
    chiavi). Presentagliele come una decisione, non come una modifica.
  Non dirgli mai di no perché "è complicato" da fare: diglielo solo quando il conto
  lo paga lui, in un'app più lenta, più fragile o più difficile da usare. E in quel
  caso proponigli sempre la versione piccola della stessa idea.
- **Non riscrivere l'app da zero** (valutato insieme il 2026-08-22 e scartato). Con
  questi vincoli — un file, niente librerie, dati sul telefono — una riscrittura
  ridarebbe quasi la stessa app, ma perderebbe le decisioni pagate con l'uso, che
  stanno qui sotto e non in un elenco di funzioni: il gradiente non monotòno, tutti
  i cerchi della striscia che rispondono, `user-select` sul quadrante, la conversione
  del fabbisogno che non tocca un numero scelto a mano, la transizione già provata e
  tolta. E metterebbe a rischio l'unica cosa irreversibile: il diario sul suo
  telefono, che non esiste da nessun'altra parte. Riscrivere avrà senso solo il
  giorno in cui la forma attuale gli impedisce davvero qualcosa che vuole.

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
   **Unica eccezione, dal 2026-08-23:** la libreria di Google per il permesso di Drive.
   Si carica **solo quando lui tocca "Collega Google Drive"** o quando la copia
   automatica parte a app già avviata — **mai all'avvio**, mai come dipendenza della
   pagina. Se non c'è rete fallisce in silenzio e il Diario funziona come sempre.
   Provato: ad app aperta senza collegamento, le chiamate di rete sono zero.
4. **Nessuna chiave API.** Il repo è pubblico.
5. **Mobile prima di tutto.** Larghezza massima 560 px, aree toccabili grandi, si usa
   con una mano in cucina o al ristorante.

## Come sono salvati i dati — romperlo significa cancellargli il diario

`localStorage`, con questi prefissi:

- `diario.config` → `{ob:{kcal,fab,p,c,g}, miei:[...], recenti:[...], tema, fabV, drive}`
  `drive` è `{on, id, ultimo}`: collegato o no, l'identificativo del file su Drive e
  quando è partita l'ultima copia. **Il permesso di Google non si salva mai**: vive in
  memoria (`GTOK`), dura un'ora e si richiede quando serve.
- `diario.indice` → `{"2026-08-17": {kcal,p,c,g,n}, ...}` — riepiloghi per lo storico
- `diario.g.YYYY-MM-DD` → `{voci:[...], totali:{...}, passi}` — un file per giorno
  `passi` c'è anche dentro `diario.indice`, così lo storico li mostra senza aprire
  ogni giorno. **Un giorno con i soli passi resta nell'indice**: se lo cancellassimo
  perché non ha voci, la camminata sparirebbe dallo storico.

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
- **I passi si scrivono a mano** (chiesto il 2026-08-27), **oppure arrivano dall'app
  "Diario passi"** (dal 2026-08-28, vedi più sotto). Nessuna pagina web può leggere Fit
  o Health Connect: le porte sono chiuse ai siti e quelle di Fit chiudono del tutto a
  fine 2026 — per questo il numero o lo batte lui o glielo porta un'app Android.
  Il campo sta nella schermata Oggi; per i giorni passati il numero si vede ma non si
  tocca, come le voci.
  **La stima delle calorie non entra nel deficit e non tocca i grammi di grasso**:
  decisione sua, presa sapendo che sommarle avrebbe reso il deficit più bello e meno
  vero. `kcalPassi()` conta 1400 passi per chilometro e **0,5 kcal per chilo per
  chilometro** — la spesa *in più* rispetto allo stare fermi, non quella lorda, che
  conterebbe due volte quello che il fabbisogno già include. Il peso (97 kg) sta in
  `ob.peso` e serve **solo** a questo.
  Se un giorno chiede di sommarle al fabbisogno, ricordagli che la stima ha ±30% di
  errore e che nei giorni di palestra il conto si sovrapporrebbe a quello.
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
- **Quando lo scorrimento non può andare da nessuna parte, la pagina rimbalza**
  (chiesto il 2026-08-22): 13 px nel verso del dito e ritorno, 0,3 s. Succede oltre
  oggi e prima del primo giorno registrato. Serve perché un gesto che non risponde
  sembra un guasto — è lo stesso motivo per cui tutti i cerchi della striscia si
  aprono. `rimbalzo()` non ridisegna niente (non è cambiato niente da disegnare) e
  lavora sulla pagina già in piedi; il `classList.remove` + `offsetWidth` servono a
  farlo ripartire quando il dito insiste. **Non è la transizione fra i giorni**, che
  è stata tolta: questo è un movimento di risposta, e quello gli va bene.
- **Il cambio giorno non ha nessuna transizione**: il giorno nuovo compare e basta.
  Una ce n'era, chiesta e tolta lo stesso giorno (2026-08-22). Provata a 0,24 s e poi
  a 0,36 s, con partenza quasi invisibile e la curva che distribuisce il movimento:
  a Manlio sembrava un salto in tutte le versioni. **Non rimetterla se non la chiede
  lui**, e se la chiede sappi che il problema non era la velocità.
  Il motivo di fondo: l'app disegna **una schermata per volta**, quindi la pagina
  nuova appare per forza già al suo posto e può solo scivolarci dentro. Una
  transizione che convince davvero è quella in cui il dito trascina la pagina vecchia
  mentre arriva la nuova, e vuole due schermate disegnate insieme — un'altra
  architettura, non un ritocco. Se lo chiede, digli che costa quello.
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
- **Copia di sicurezza su Google Drive** (fatta il 2026-08-23, dopo che lui aveva
  chiesto di mettere il diario nel calendario per non perderlo — cosa impossibile: una
  pagina web non gira quando è chiusa, e i dati stanno solo sul suo telefono).
  Quando apre il Diario, e un minuto dopo ogni registrazione, il file completo del
  backup finisce nel **suo** Drive. Da un altro dispositivo: "Riprendi il diario da
  Drive", che passa dalla stessa strada del ripristino da file — esiste **un solo**
  modo di rimettere dentro i dati, ed è già collaudato.
  **Due regole da non togliere mai.**
  La prima: **se qui il diario è vuoto, non si scrive su Drive.**
  Il caso da temere è telefono nuovo + lui che tocca "Collega" per primo: senza quel
  blocco il vuoto di qui cancellerebbe la copia buona di là, e non resterebbe nessun
  posto da cui riprenderla. In quel caso ci si collega e gli si dice di premere
  "Riprendi". Provato apposta.
  La seconda: **non si sovrascrive una copia toccata da qualcun altro.** Prima di
  scrivere si chiede a Drive quando è stato modificato il file e lo si confronta con
  `S.drive.rev`, il segnaposto lasciato dalla nostra ultima scrittura o lettura. Se non
  combaciano, di là c'è roba più nuova — un altro dispositivo — e sovrascriverla la
  cancellerebbe in silenzio: ci si ferma e glielo si dice. `rev` assente (copie fatte
  prima di questo controllo) si accetta una volta sola. È anche la ragione per cui
  "scollega e ricollega" funziona come via d'uscita: azzerando `rev` la prossima
  scrittura passa. Questo è quanto di più vicino a una sincronia esiste oggi: **non
  fonde niente**, evita solo che un dispositivo cancelli l'altro.
  Il permesso è `drive.file`: l'app tocca **solo il file che ha creato lei**, del resto
  del Drive non vede niente. **Non allargarlo**: è la ragione per cui Google non
  pretende di esaminare l'app e non compare la schermata di avviso.
  L'identificativo del client sta in chiaro in `index.html` e **non è una chiave
  segreta**: negli schemi da browser è pubblico per definizione, e vale solo se
  chiamato dall'indirizzo autorizzato (`https://manliograndi-del.github.io`). La
  password del client (`client secret`) **non si usa e non deve entrare nel repo**.
  L'app di Google resta in stato "Testing" con lui come unico test user: pubblicarla
  avrebbe richiesto home page e informativa privacy, che il Diario non ha. Per le app
  che vivono nel browser non cambia niente — la scadenza dei 7 giorni riguarda i
  permessi a lunga durata dei programmi sui server, non questi.
  In `sw.js` c'è una riga che fa **ignorare al service worker tutto ciò che non è del
  nostro indirizzo**: senza, una chiamata a Google andata storta si sarebbe presa in
  cambio la pagina dell'app, e il codice avrebbe letto HTML al posto della risposta.
- **Sincronizzazione a due sensi: ancora da fare.** Chiesta il 2026-08-18, rimandata,
  e il 2026-08-22 abbiamo scelto di partire dalla sola copia di sicurezza — l'80% di
  quello che gli serve senza il problema di decidere chi vince quando due dispositivi
  hanno scritto lo stesso giorno. Se si riprende il discorso, la regola semplice e
  onesta è "l'ultima versione di quel giorno vince".
- **Note di allora sulla sincronizzazione:**
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

## L'app che legge i passi — cartella `passi/`

Fatta il 2026-08-28, quando Manlio ha detto la cosa che sapevamo tutti e due:
scrivere i passi a mano ogni giorno gli sarebbe costato e avrebbe smesso di farlo.

Kotlin, niente Compose, interfaccia costruita a mano con le View: le stesse scelte
dell'app da polso della Palestra, e per la stessa ragione — **quel codice qui non si
può provare**, in questa sessione non c'è l'SDK di Android, quindi meno pezzi ci sono
meno cose si rompono. La compilazione la fa GitHub.

Fa **una cosa sola**: chiede il permesso di leggere i passi, legge gli ultimi 7 giorni
da Health Connect, li mostra, e quando lui tocca "Manda al Diario" apre il Diario con i
numeri scritti nell'indirizzo. Nessun dato esce se non quando tocca il tasto.

    #passi=1;2026-08-27:8412,2026-08-26:5130
    versione ; data:passi , data:passi …

- **Il collegamento va in un senso solo**, come per l'orologio: l'app racconta, il
  Diario decide. Il Diario mostra un riquadro di conferma con l'elenco dei giorni e
  "(era N)" dove il numero cambierebbe, e **registra soltanto i passi**: le voci di
  cibo non le tocca (`passiRegistra()`). L'indirizzo si ripulisce subito dopo
  (`pulisciPassi`), altrimenti un ricaricamento riproporrebbe gli stessi giorni a
  distanza di settimane. C'è l'ascolto su `hashchange`: ad app già aperta il telefono
  non ricarica la pagina, cambia solo l'indirizzo.
- **I passi si leggono aggregati per giorno** (`aggregateGroupByPeriod` con
  `StepsRecord.COUNT_TOTAL`). Se il telefono e un orologio scrivono tutti e due nello
  stesso magazzino, sommare i singoli record li conterebbe due volte. Non sostituirlo
  con una lettura dei record grezzi.
- **Un permesso solo**, `android.permission.health.READ_STEPS`. Non allargarlo: è
  quello che gli ho promesso e l'unico che serve.
- Fit deve **condividere con Health Connect**: se l'app dice "non ho passi degli ultimi
  giorni", è quasi sempre quello, non un errore dell'app.
- **La libreria `connect-client` pretende strumenti recenti**: plugin Android 8.6.1 e
  `compileSdk 35` (il primo tentativo con 8.5.2 e 34 si è fermato lì). `targetSdk`
  resta 34: è il telefono a cui parla, non il compilatore.

**La compilazione la fa GitHub** (`.github/workflows/passi.yml`) a ogni modifica dentro
`passi/`, e pubblica sempre allo stesso indirizzo:
`https://github.com/manliograndi-del/diario/releases/download/passi/diario-passi.apk`
Se il file non si aggiorna, guarda i log dell'azione prima di dare la colpa al telefono.

## La palestra dentro il Diario

Chiesta il 2026-08-28, subito dopo i passi: "assieme ai passi devi mettere anche la
palestra prendendo i dati dalla palestra".

**Non c'è nessun collegamento fra le due app, e non serve.** Diario e Palestra vivono
sullo stesso indirizzo (`manliograndi-del.github.io`) e quindi sullo **stesso
`localStorage`**: quella che finora era una trappola da evitare — non usare chiavi
senza prefisso — qui diventa la strada. Il Diario apre `palestra.indice` e legge.
Niente rete, niente sincronizzazione, niente da autorizzare. Se la Palestra non è mai
stata aperta su questo telefono, la chiave non c'è e il pannello dice che non ti sei
allenato.

**Il Diario legge e basta: non scrive mai dentro le chiavi `palestra.`.** Se un giorno
serve un dato nuovo, lo aggiunge la Palestra al proprio indice — è lei che conosce la
scheda.

- `S.pal` è la copia dell'indice della Palestra. `leggiPalestra()` la rilegge e dice
  se è cambiata; gira all'avvio e **quando l'app torna in primo piano**. È lì che
  serve davvero: lui esce dalla Palestra e rientra nel Diario, e la seduta appena
  finita deve esserci già. Senza quel giro il pannello continuerebbe a dire "nessun
  allenamento oggi" fino al ricaricamento.
- **I minuti di cardio li conta la Palestra** (`minC` nel suo indice, dal 2026-08-28).
  Il Diario non ha la `SCHEDA` e non può sapere che il tapis roulant dura 15': se
  provi a indovinarli qui, al primo cambio di scheda il numero diventa falso.
- **Le calorie sono una stima e non entrano nel deficit**, esattamente come per i
  passi e per la stessa decisione sua. `kcalPalestra()` usa il conto classico
  kcal/min = MET × 3,5 × kg / 200, con **MET 3,5 ai pesi** — quello dei circuiti *con
  il recupero dentro*, perché fra una serie e l'altra c'è un minuto fermo e contarlo
  come lavoro raddoppierebbe il numero — e **MET 5 al cardio**. Ogni serie vale un
  minuto e mezzo: mezzo di lavoro e uno di recupero, che è poi il timer della
  Palestra. Una seduta intera (34 serie + 30' di cardio, 97 kg) viene circa 560 kcal.
  Se un giorno chiede di sommarle al fabbisogno, valgono le stesse obiezioni dei
  passi: è una stima, e nei giorni di palestra si sommerebbe a quella della camminata.
- Si vede in tre posti, tutti alimentati dallo stesso indice: il **pannello Palestra**
  nella schermata Oggi (sotto la Camminata, stessa forma), la **riga di riepilogo** del
  dettaglio di un giorno, e il **riepilogo del mese** nello Storico (allenamenti,
  serie, kcal totali e a seduta).
- Un giorno di sola palestra **non compare nel calendario** dello Storico: quel
  calendario è dei giorni di cibo, e l'indice del Diario non ha quel giorno. Nei
  totali del mese però l'allenamento è contato — si contano su `palestra.indice`,
  non sull'indice del Diario, apposta.

## Il cerchio nella barra in alto

Chiesto il 2026-08-28: "un cerchio che si vede in percentuale tra le calorie
consumate e le 1500 massime che voglio consumare in un giorno", in cima allo
schermo del telefono.

**Una pagina web non può disegnare nella barra di stato di Android. Una notifica
sì.** L'icona piccola di una notifica — il `badge` — *è* quel disegno lassù.
Quindi il cerchio è una notifica silenziosa, sempre con la stessa `tag`
(`"calorie"`), che riscriviamo ogni volta che il numero cambia: la notifica
nuova prende il posto della vecchia invece di accodarsi.

- **Android della `badge` usa solo il canale alfa** e colora tutto di bianco.
  Niente colori, niente rosso quando sfora. Per questo i cerchi sono immagini
  già pronte in `badge/` — una ogni 5% più `cerchio-oltre.png` — disegnate con
  il contorno a mezza trasparenza (esce grigio) e la fetta in nero pieno (esce
  bianca). Le ha generate uno script con un canvas: se servono di nuovo, si
  ridisegnano, ma **non provare a generarle al volo nella pagina**: le immagini
  della notifica le carica il browser da un indirizzo, non da un canvas, e da
  file funzionano anche senza rete perché il service worker le ha in cache
  (sono nella lista `CERCHI` di `sw.js`).
- **Sopra l'obiettivo il cerchio diventa un disco pieno.** A 100% e a 130% si
  vede la stessa cosa, ed è voluto: nella barra c'è spazio per un'informazione
  sola, il numero preciso sta nel testo della notifica.
- **Si aggiorna solo ad app aperta**: quando segni qualcosa, quando apri il
  Diario, quando torna in primo piano. Senza un server che spinga le notifiche
  non c'è altro modo, e non serve — a app chiusa il numero non cambia.
  **L'unico caso vero è la mezzanotte**: il cerchio resta pieno di ieri finché
  non riapre l'app. Se un giorno dà fastidio, l'unica soluzione onesta è un'app
  Android, non un trucco nella pagina.
- **Il permesso si chiede solo dopo un suo tocco** (`accendiCerchio()`), mai
  all'avvio: chiederlo all'apertura è il modo migliore per farselo negare per
  sempre, e un "no" è definitivo finché non lo cambia nelle impostazioni di
  Android. L'interruttore sta in Impostazioni e lo stato vive in
  `config.cerchio` — che **`salvaCfg()` deve continuare a scrivere**.
- La notifica è `silent:true` e `renotify:false`: non suona e non vibra mai.
  Toccandola si torna al Diario (`notificationclick` in `sw.js`), senza aprirne
  una seconda copia.

**Tirando giù la tendina ci sono i due anelli veri** (chiesti il 2026-08-28: lui
aveva chiesto un widget con "i due cerchi delle calorie e delle proteine"). Sono
l'immagine grande della notifica, disegnata **dentro il service worker** con
`OffscreenCanvas` e servita a `anelli.png?k=…&f=…&p=…`.

- **Un widget vero sulla schermata Home non si può fare, e non è una pigrizia.**
  I widget li può dare solo un'app Android installata, e i numeri del Diario
  vivono dentro il browser: un'app non li vede. L'unico ponte pagina→app è
  aprire un indirizzo, cioè saltare visibilmente da un'app all'altra, e farlo a
  ogni voce di cibo sarebbe peggio del male. Se lo richiede, la risposta onesta
  è ancora questa.
- **Che il disegno passi dal service worker è stato provato**, non dedotto: una
  prova apposta ha mostrato che le richieste di `image`, `icon` e `badge` di una
  notifica **passano dal `fetch` del service worker**. È il motivo per cui
  funziona anche ad app chiusa, e senza rete.
- Non potevano essere file già pronti come i cerchi della barra: le
  combinazioni di calorie e proteine sono troppe. E non poteva disegnarli la
  pagina: l'immagine se la va a prendere il browser da un indirizzo.
- **La tavolozza in `sw.js` è una copia di quella di `index.html`**, perché lì
  dentro le variabili CSS non esistono. Se cambi i colori di là, cambiali anche
  qui, o gli anelli della notifica smetteranno di somigliare a quelli dell'app.
  Il disegno segue anche il tema chiaro/scuro dell'ora, che gli arriva
  nell'indirizzo.
- Nell'indirizzo c'è anche `&v=<ora>`: senza, il browser riuserebbe l'immagine
  di prima e la notifica mostrerebbe numeri vecchi.

## Aspetto

Palette (variabili CSS in `:root`, usale, non inventare colori):
`--carta #E9ECE6` · `--superficie #FFF` · `--inchiostro #141B18` · `--tenue #5B6661`
`--linea #CDD3CB` · `--blu #1F4A6B` (calorie) · `--senape #C08411` (proteine)
`--rosso #A3341F` · `--verde #2E6B4F` (aggiunto davvero il 2026-08-21: prima il
verde esisteva solo dentro `coloreGrassi()` e questo file lo dava per scontato)
Più `--su-inchiostro` (il testo sopra i fondi color inchiostro), `--traccia` (le piste
vuote di anelli e nastri), `--neutro`. Servono al tema scuro: se scrivi
un colore fisso invece di una variabile, di notte diventa illeggibile.

Angoli quasi vivi (3px), pannelli bianchi bordati su fondo grigio-verde, numeri
tabulari e grandi, etichette in maiuscoletto monospaziato. Sobrio, strumentale.
Non aggiungere ombre, sfumature o animazioni decorative.

## Prima di chiudere una sessione

1. **Alza il numero di versione della cache in `sw.js`** (`diario-v23` → `diario-v24`).
   Dal 2026-08-18 il service worker chiede la pagina prima alla rete, quindi una
   versione nuova arriva con un ricaricamento solo; il numero di cache va alzato
   lo stesso, governa la copia di riserva usata offline.
2. Verifica che l'app si apra e che una voce registrata sopravviva a un ricaricamento.
3. Digli **in italiano e senza gergo** cosa vedrà di diverso, e che deve ricaricare
   due volte perché il service worker si aggiorni.

## Pulizie già fatte

**2026-08-22, rilettura completa del file** cercando roba morta. Tolti: un
`@font-face` di un carattere che nessuno usava, il disegno dei "blocchi proteine"
di una versione vecchia (`.pannello.prot`, `.blocchi`, `.blocco`) con la variabile
`--linea-prot` che serviva solo a quello, la classe `.dett-v`, e il campo `fabV`
nello stato — la versione la scrive `salvaCfg()` leggendo la costante, in memoria
non serviva. Corretto un commento che diceva ancora che lo scorrimento si fermava
ai sette giorni. Undici righe in meno, niente di visibile cambiato.

Controllato anche il resto: nessuna classe CSS senza usi, nessuna variabile di
colore orfana, nessuna funzione mai chiamata, nessun pezzo di stato mai letto.
Se rifai questo giro, il modo è confrontare i selettori dichiarati nello `<style>`
con le stringhe di classe scritte nel JavaScript.

## File del repo

- `index.html` — tutta l'app
- `sw.js` — funzionamento offline; il numero di cache va alzato a ogni rilascio
- `manifest.webmanifest` — installazione sulla schermata Home
- `icon-192.png`, `icon-512.png` — icone
- `badge/` — i cerchi della barra di stato, uno ogni 5% (generati, non scritti a mano)
- `passi/` — l'app Android che legge i passi da Health Connect (Kotlin, la compila GitHub)
- `.github/workflows/passi.yml` — la fabbrica dell'APK dei passi
