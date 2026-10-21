---

tags:

- quartz
- css
- tutorial

---

Questa nota spiega come ho costruito il banner di copertina della home di questo giardino: il titolo resta in evidenza al centro dell'immagine, con un'ombra morbida dietro il testo. Su desktop il banner è fermo e mostra l'immagine intera, mentre su smartphone in verticale l'immagine scorre lentamente con una panoramica, così si vedono tutte le parti anche in uno spazio stretto. Basta un solo file, `custom.scss`, senza plugin né JavaScript.

> [!info] Cosa serve Un sito Quartz v5, un'immagine di copertina e la possibilità di modificare `quartz/styles/custom.scss`. Gli esempi usano la home (`index`), ma si adattano a qualsiasi pagina.

## L'idea in breve

Il titolo di una pagina in Quartz è un elemento HTML con classe `.article-title`. Invece di aggiungere un componente nuovo, uso quell'elemento stesso come banner:

1. gli do un **rapporto** adatto all'immagine;
2. metto l'immagine come **sfondo CSS**;
3. sopra l'immagine metto due **gradienti** che fanno ombra dietro il testo;
4. solo su smartphone in verticale lo **animo** con i `@keyframes`.

Il titolo resta testo vero, quindi è leggibile, selezionabile e accessibile.

## Passo 0: l'immagine

- **Dove**: dentro `content/`, ad esempio `content/images/utils/copertina.webp`. Quartz copia i file di `content` nel sito.
- **Proporzioni**: la mia è 2172 × 724 px, cioè esattamente **3:1**. Il rapporto è importante, lo spiego nel passo 1.
- **Peso**: punta a 150-250 KB. Ridimensiona a circa 1800 × 600 px e salva in WebP a qualità 75-80 (va bene anche [squoosh.app](https://squoosh.app/)). Un file leggero conta più di qualsiasi altro ritocco per la velocità del sito.
- **Nome**: usa minuscole e niente spazi. Windows non distingue le maiuscole, GitHub Pages sì (vedi i problemi comuni in fondo).

> [!tip] Immagine pensata per un banner Un'immagine larga e bassa (3:1 o simile) funziona meglio di una quadrata, perché un banner basso ne mostra solo una fascia. Se la generi con un'AI, chiedila in formato panoramico, con i soggetti principali ai lati e il centro più libero e scuro per il titolo.

## Passo 1: il banner

Aggiungi in fondo a `quartz/styles/custom.scss`:

```scss
// Hero: la pagina "index" ha il titolo sopra l'immagine di copertina
body[data-slug="index"] .article-title {
  display: flex;
  align-items: center;        // titolo centrato in verticale
  justify-content: center;    // e in orizzontale
  text-align: center;
  aspect-ratio: 3 / 1;        // stesso rapporto dell'immagine: nessun bordo tagliato
  height: auto;
  margin: 0 0 1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: #fff;
  font-size: clamp(1.6rem, 4vw, 2.6rem);
  line-height: 1.15;
  text-shadow:
    0 0 12px rgba(0, 0, 0, 0.9),
    0 0 30px rgba(0, 0, 0, 0.7),
    0 2px 4px rgba(0, 0, 0, 0.6);
  background:
    radial-gradient(
      ellipse 55% 65% at center,
      rgba(0, 0, 0, 0.55) 0%,
      rgba(0, 0, 0, 0.3) 45%,
      rgba(0, 0, 0, 0) 100%
    ),
    linear-gradient(rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08)),
    url("./images/utils/copertina.webp") center / cover no-repeat;
}
```

### Cosa fa ogni parte

- **`body[data-slug="index"]`**: Quartz imposta `data-slug` sul `<body>` di ogni pagina, quindi la regola vale solo per la home. Per un'altra pagina cambia lo slug.
- **`aspect-ratio: 3 / 1`**: il box ha la stessa forma dell'immagine, quindi `cover` non deve tagliare niente e si vedono anche i bordi. Con un'altezza fissa, a certe larghezze l'immagine verrebbe ritagliata ai lati.
- **I tre strati di `background`**, dal più in alto al più in basso:
    1. un `radial-gradient` ellittico: scuro al centro e trasparente ai bordi, è l'**ombra morbida dietro il titolo**;
    2. un `linear-gradient` uniforme e leggerissimo, un velo che uniforma l'immagine;
    3. l'**immagine** vera e propria.
- **`text-shadow`**: un alone scuro attorno alle lettere, che le stacca dallo sfondo.
- **`font-size: clamp(...)`**: il testo si ingrandisce e rimpicciolisce con la larghezza dello schermo, restando tra 1,6 rem e 2,6 rem.
- **Il percorso `./images/...`** è relativo al CSS, che sta nella radice del sito.

> [!tip] Titolo corto Il titolo del frontmatter finisce dentro il banner. Tienilo breve (nel mio caso `Merlin's garden - My digital garden`): un titolo lungo occupa più righe e fa crescere il box. Il testo di benvenuto più lungo mettilo come paragrafo normale sotto.

Con questo passo hai già un banner completo e fermo, che su desktop e su smartphone in orizzontale mostra l'immagine intera.

## Passo 2: la panoramica su smartphone in verticale

Su un telefono in verticale il banner è stretto (circa 380 px) e un'immagine panoramica verrebbe ritagliata, mostrando solo una fascia centrale. La soluzione è alzare il banner e far **scorrere** l'immagine lentamente: così si vede tutta, in sequenza. Sono tre animazioni indipendenti (spostamento orizzontale, verticale e zoom) con durate diverse, quindi la loro combinazione non si ripete mai identica e il movimento sembra naturale e non un loop.

Aggiungi questo blocco **dopo** la regola del passo 1:

```scss
// Telefono in verticale: banner più alto con panoramica animata
@media (max-width: 800px) and (orientation: portrait) {
  body[data-slug="index"] .article-title {
    aspect-ratio: auto;
    height: 260px;
    background-size: auto, auto, auto 100%;
    animation:
      copertina-pan-x 41s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite,
      copertina-pan-y 23s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite,
      copertina-zoom  31s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  }
}
```

E in fondo al file i `@keyframes`:

```scss
// orizzontale: tocca entrambi i bordi, con soste e piccoli ripensamenti
@keyframes copertina-pan-x {
  0%   { background-position-x: 0, 0, 0%; }     // bordo sinistro
  12%  { background-position-x: 0, 0, 22%; }
  20%  { background-position-x: 0, 0, 18%; }    // ripensamento
  38%  { background-position-x: 0, 0, 62%; }
  46%  { background-position-x: 0, 0, 70%; }
  52%  { background-position-x: 0, 0, 66%; }    // ripensamento
  70%  { background-position-x: 0, 0, 100%; }   // bordo destro
  78%  { background-position-x: 0, 0, 96%; }
  90%  { background-position-x: 0, 0, 40%; }
  100% { background-position-x: 0, 0, 0%; }
}

// verticale: dolce, serve solo quando lo zoom lascia margine
@keyframes copertina-pan-y {
  0%   { background-position-y: 0, 0, 40%; }
  35%  { background-position-y: 0, 0, 90%; }
  70%  { background-position-y: 0, 0, 10%; }
  100% { background-position-y: 0, 0, 40%; }
}

// zoom: parte da immagine intera in altezza, si avvicina e torna indietro
@keyframes copertina-zoom {
  0%   { background-size: auto, auto, auto 100%; }
  30%  { background-size: auto, auto, auto 112%; }
  55%  { background-size: auto, auto, auto 124%; }
  80%  { background-size: auto, auto, auto 106%; }
  100% { background-size: auto, auto, auto 100%; }
}
```

### Perché è scritto così

- **`@media (max-width: 800px) and (orientation: portrait)`**: il blocco si attiva solo su schermi stretti **e** in verticale. Con il telefono in orizzontale vale ancora il banner 3:1 del passo 1 e l'immagine si vede intera.
- **`aspect-ratio: auto` e `height: 260px`**: annullano il rapporto 3:1 e danno al banner un'altezza fissa, più adatta a uno schermo stretto.
- **`background-size: ... auto 100%`**: l'immagine riempie l'altezza del banner e si estende oltre i lati, ed è quello spazio che la panoramica attraversa.
- **Tre valori separati da virgola** (`0, 0, 22%`): lo sfondo ha tre strati (due gradienti e l'immagine). Ogni valore si riferisce a uno strato, nell'ordine. I primi due restano fermi a `0`, così l'ombra dietro il titolo non si sposta. Si muove solo l'immagine, la terza.
- **Le posizioni `0%` e `100%`** toccano i bordi dell'immagine: in quei momenti si vede tutta, fino all'ultimo pixel. I "ripensamenti" (ad esempio da `22%` a `18%`) danno al movimento un andamento meno meccanico.
- **Lo zoom non scende mai sotto `100%`**: sotto quel valore comparirebbero strisce vuote sopra o sotto l'immagine.
- **`cubic-bezier(0.45, 0.05, 0.55, 0.95)`**: un'accelerazione morbida, con rallentamenti sfumati a ogni punto chiave.
- **Durate diverse e "scomode"** (41, 23 e 31 secondi): tienile numeri diversi tra loro, meglio se primi, per evitare che i movimenti si sincronizzino.
- **L'ordine nel file conta**: questo blocco sta dopo la regola base, quindi la sostituisce per queste dimensioni dello schermo.

## Passo 3: rispetto per chi non vuole movimento

Chi ha attivato "riduci movimento" nel sistema operativo non deve vedere animazioni. Questo blocco le spegne e mostra un banner fermo con l'immagine ben inquadrata:

```scss
// chi ha attivato "riduci movimento" non vede l'animazione
@media (prefers-reduced-motion: reduce) {
  body[data-slug="index"] .article-title {
    animation: none;
    background-size: auto, auto, cover;
    background-position: 0 0, 0 0, center 35%;
  }
}
```

Mettilo **dopo** gli altri blocchi, così ha la precedenza.

## Come personalizzarlo

|Cosa vuoi|Cosa cambiare|
|---|---|
|Ombra dietro il titolo più forte|alza il primo `0.55` nel `radial-gradient`|
|Ombra più larga o più stretta|cambia `55% 65%` (larghezza e altezza dell'ellisse)|
|Immagine più luminosa|abbassa `0.3` e `0.08` nei gradienti|
|Testo più grande o più piccolo|cambia i valori nel `clamp(...)`|
|Banner più alto su telefono|cambia `height: 260px`|
|Panoramica più lenta o più veloce|cambia `41s`, `23s`, `31s`, tenendoli numeri diversi tra loro|
|Zoom su telefono più evidente|alza `124%` in `copertina-zoom` (con `135%` si nota molto, ma l'immagine perde nitidezza)|
|Più indugio ai bordi|aggiungi un punto chiave in più vicino a `0%` o `100%` in `copertina-pan-x`|
|Quale fascia si vede con "riduci movimento"|cambia la percentuale in `center 35%`|
|Stesso banner su un'altra pagina|cambia `index` con lo slug di quella pagina|

## Problemi comuni

- **In locale funziona, online no.** Può essere la cache: aspetta che finisca il deploy (scheda Actions su GitHub) e ricarica con **Ctrl+Shift+R**. Se non è la cache, controlla le maiuscole del nome file.
- **Maiuscole nei nomi dei file.** Windows e macOS le ignorano, GitHub Pages no. Il nome nel CSS, quello sul disco e quello che Git ha registrato (`git ls-files`) devono coincidere esattamente. Se rinomini un file cambiando solo le maiuscole, Git su Windows non se ne accorge: passa da un nome temporaneo con `git mv`.
- **Il banner non compare.** Controlla con F12 che la classe sia `.article-title` e che il `data-slug` del `<body>` sia `index`. Nei plugin della community i nomi possono cambiare.
- **I bordi dell'immagine sono tagliati su desktop.** Il rapporto nel CSS (`3 / 1`) non corrisponde a quello reale dell'immagine. Dividi larghezza per altezza e usa quel valore.
- **Il titolo è lungo e il box cresce.** Accorcia il titolo nel frontmatter o riduci il `font-size` nel `clamp(...)`.
- **L'animazione scatta su telefoni vecchi.** Animare `background-size` e `background-position` non è accelerato dalla scheda video. Su dispositivi poco potenti si può ridurre lo zoom o allungare le durate.
- **Un avviso sul "LCP" nei test di velocità.** Lo sfondo CSS non è visibile al browser finché non ha letto il CSS. La cura più efficace è un'immagine leggera (passo 0).

## Aggiornare Quartz senza perdere tutto

Tutto vive in `custom.scss` e in `content/`, due posti che Quartz non sovrascrive negli aggiornamenti. Prima di aggiornare, fai il commit e lavora su un branch separato: se qualcosa si rompe, torni indietro senza perdere niente. L'unico rischio è che una versione futura cambi il nome della classe `.article-title`: in quel caso basta aggiornare i selettori.

## Per approfondire

- [Documentazione di Quartz](https://quartz.jzhao.xyz/)