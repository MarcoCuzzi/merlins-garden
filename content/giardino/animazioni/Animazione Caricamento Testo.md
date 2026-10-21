---

tags:

- quartz
- css
- tutorial

---
Questa nota spiega come ho costruito l'animazione della home di questo giardino. Ci sono due parti, e basta un solo file, `custom.scss`, senza plugin né JavaScript:

1. **Il banner di copertina**: il titolo resta in evidenza al centro dell'immagine, con un'ombra morbida dietro il testo. Su desktop l'immagine si muove come una camera, tra zoom e panoramiche da un lato all'altro. Su smartphone in verticale scorre lentamente, così si vede tutta anche in uno spazio stretto.
2. **Il testo che compare dolcemente**: il contenuto sotto il banner appare un blocco alla volta, come se si scrivesse riga dopo riga.

> [!info] Cosa serve Un sito Quartz v5, un'immagine di copertina e la possibilità di modificare `quartz/styles/custom.scss`. Gli esempi usano la home (`index`), ma si adattano a qualsiasi pagina.

## Parte 1: il banner di copertina

### L'idea in breve

Il titolo di una pagina in Quartz è un elemento HTML con classe `.article-title`. Invece di aggiungere un componente nuovo, uso quell'elemento stesso come banner:

1. gli do un **rapporto** adatto all'immagine;
2. metto l'immagine come **sfondo**;
3. sopra l'immagine metto due **gradienti** che fanno ombra dietro il testo;
4. lo **animo**: in un modo su desktop e in un altro su smartphone in verticale.

Il titolo resta testo vero, quindi è leggibile, selezionabile e accessibile.

### Passo 0: l'immagine

- **Dove**: dentro `content/`, ad esempio `content/images/utils/copertina.webp`. Quartz copia i file di `content` nel sito.
- **Proporzioni**: la mia è 2172 × 724 px, cioè esattamente **3:1**. Il rapporto è importante, lo spiego nel passo 1.
- **Peso**: punta a 150-250 KB. Ridimensiona a circa 1800 × 600 px e salva in WebP a qualità 75-80 (va bene anche [squoosh.app](https://squoosh.app)). Un file leggero conta più di qualsiasi altro ritocco per la velocità del sito.
- **Nome**: usa minuscole e niente spazi. Windows non distingue le maiuscole, GitHub Pages sì (vedi i problemi comuni in fondo).

> [!tip] Immagine pensata per un banner Un'immagine larga e bassa (3:1 o simile) funziona meglio di una quadrata, perché un banner basso ne mostra solo una fascia. Se la generi con un'AI, chiedila in formato panoramico, con i soggetti principali ai lati e il centro più libero e scuro per il titolo.

### Passo 1: il banner

Aggiungi in fondo a `quartz/styles/custom.scss`:

scss

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

#### Cosa fa ogni parte

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

Con questo passo hai già un banner completo e fermo. Ora lo facciamo muovere.

### Passo 2: l'animazione su desktop

Su desktop l'immagine entra già tutta nel banner, quindi il movimento nasce da uno **zoom** che ne mostra una parte per volta, e da uno spostamento da un lato all'altro. La coreografia dura 32 secondi:

1. l'immagine parte intera;
2. si avvicina a sinistra (nel mio caso l'uomo sulla barca) fino al bordo;
3. si allontana al centro e poi attraversa verso destra (la statua);
4. resta un momento sul bordo destro;
5. torna all'immagine intera e fa un piccolo "respiro" di zoom al centro, poi il ciclo ricomincia.

#### Il trucco: un livello separato con `transform`

Animare lo sfondo (`background-position`, `background-size`) è possibile, ma i movimenti lenti tendono a procedere a scatti di un pixel. Il browser invece muove in modo molto più fluido un elemento con `transform`. Per questo su desktop l'immagine passa su un **livello separato** (lo pseudo-elemento `::before`) e si anima quello. Aggiungi dopo la regola del passo 1:

scss

```scss
// Desktop (e telefono in orizzontale): l'immagine passa su un livello separato
// e si muove con transform, che è molto più fluido dello sfondo animato.
// Livelli, dal basso: ::before = immagine, ::after = ombra dietro il titolo, poi il testo.
@media not all and (max-width: 800px) and (orientation: portrait) {
  body[data-slug="index"] .article-title {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    background: none;          // lo sfondo passa ai due livelli qui sotto
  }

  body[data-slug="index"] .article-title::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -2;
    background: url("./images/utils/copertina.webp") center / cover no-repeat;
    transform-origin: center;
    animation: copertina-desktop 32s infinite;
  }

  body[data-slug="index"] .article-title::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      radial-gradient(
        ellipse 55% 65% at center,
        rgba(0, 0, 0, 0.55) 0%,
        rgba(0, 0, 0, 0.3) 45%,
        rgba(0, 0, 0, 0) 100%
      ),
      linear-gradient(rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08));
  }
}
```

#### Come funziona questo blocco

- **`@media not all and (max-width: 800px) and (orientation: portrait)`**: significa "tutto tranne un telefono in verticale". Vale quindi per desktop, tablet larghi e telefono in orizzontale. Il telefono in verticale ha una sua animazione (passo 3).
- **`background: none`** sull'elemento: lo sfondo originale (quello del passo 1) viene tolto, perché immagine e ombra passano ai due pseudo-elementi.
- **Tre livelli sovrapposti**, dal basso: `::before` con l'immagine (`z-index: -2`), `::after` con i gradienti dell'ombra (`z-index: -1`) e infine il testo. L'ombra resta ferma dietro il titolo mentre l'immagine si muove sotto.
- **`isolation: isolate` e `overflow: hidden`**: il primo tiene i livelli con `z-index` negativo dentro il banner, il secondo ritaglia l'immagine ingrandita ai bordi (anche ai bordi arrotondati).
- **`inset: 0`**: ogni pseudo-elemento copre tutto il banner.

#### La coreografia

Aggiungi in fondo al file i `@keyframes`:

scss

```scss
// Coreografia desktop: una sola animazione, con una curva diversa per ogni tratto.
// translate(x, y): x positivo = si vede la parte sinistra dell'immagine,
//                  y negativo = si vede la parte bassa.
// Limite per non scoprire bordi vuoti: |x| e |y| <= (zoom - 1) / 2 * 100%
@keyframes copertina-desktop {
  // Ogni tratto parte e arriva con velocità zero (curve "in-out"): nessuna inversione brusca.
  0% {   // immagine intera
    transform: translate(0%, 0%) scale(1);
    animation-timing-function: cubic-bezier(0.5, 0, 0.2, 1);
  }
  8% {   // si avvicina a sinistra (l'uomo sulla barca)
    transform: translate(30%, -14%) scale(1.7);
    animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1);
  }
  22% {  // deriva lenta fino al bordo sinistro
    transform: translate(40%, -18%) scale(1.8);
    animation-timing-function: cubic-bezier(0.5, 0, 0.5, 1);
  }
  33% {  // allontanamento al centro: lo zoom rallenta dolcemente, poi riparte
    transform: translate(0%, 0%) scale(1.3);
    animation-timing-function: cubic-bezier(0.5, 0, 0.5, 1);
  }
  44% {  // la statua a destra
    transform: translate(-36%, 16%) scale(1.75);
    animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1);
  }
  58% {  // deriva lenta fino al bordo destro
    transform: translate(-40%, 20%) scale(1.8);
    animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  }
  76% {  // torna all'immagine intera
    transform: translate(0%, 0%) scale(1);
    animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1);
  }
  88% {  // respiro al centro
    transform: translate(0%, 0%) scale(1.2);
    animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1);
  }
  100% {
    transform: translate(0%, 0%) scale(1);
  }
}
```

#### Perché è scritta così

- **Percentuali = momenti del ciclo**: `22%` di 32 secondi è circa il secondo 7. Ogni blocco dice dove deve trovarsi l'immagine in quel momento, e il browser anima il passaggio tra un momento e il successivo.
- **`translate(x, y) scale(s)`**: lo `scale` è lo zoom (1 = immagine intera, 1,8 = ingrandita dell'80%). Il `translate` sposta l'immagine in percentuale delle sue dimensioni: con `x` positivo si vede la parte sinistra, con `y` negativo la parte bassa.
- **Il limite dei bordi vuoti**: se sposti troppo, compaiono strisce vuote. Il massimo consentito è `(zoom − 1) / 2 × 100%`. Con zoom 1,8 si può arrivare a 40%, ed è per questo che ai bordi ci sono proprio i valori `40%` e `-40%`.
- **Una curva diversa per ogni tratto**: `animation-timing-function` dentro un keyframe vale per il tratto che parte da lì. Le derive lente usano curve dolci e il passaggio al centro usa curve più decise, e così si gioca con la velocità.
- **Velocità zero a ogni sosta**: tutte le curve sono del tipo "in-out", cioè partono e arrivano piano. È importante: in una versione precedente il passaggio al centro iniziava un tratto alla massima velocità nel punto in cui lo zoom cambiava direzione, e si vedeva uno scatto nel ridimensionamento. Quando una grandezza cambia direzione (lo zoom che prima diminuisce e poi aumenta), deve rallentare fino a fermarsi, non invertirsi di colpo.

### Passo 3: la panoramica su smartphone in verticale

Su un telefono in verticale il banner è stretto (circa 380 px) e un'immagine panoramica verrebbe ritagliata, mostrando solo una fascia centrale. La soluzione è alzare il banner e far **scorrere** l'immagine lentamente: così si vede tutta, in sequenza. Qui l'animazione è fatta di tre movimenti indipendenti (orizzontale, verticale e zoom) con durate diverse, quindi la loro combinazione non si ripete mai identica e il movimento sembra naturale e non un loop.

Aggiungi questo blocco:

scss

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

scss

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

#### Perché è scritto così

- **`aspect-ratio: auto` e `height: 260px`**: annullano il rapporto 3:1 e danno al banner un'altezza fissa, più adatta a uno schermo stretto.
- **`background-size: ... auto 100%`**: l'immagine riempie l'altezza del banner e si estende oltre i lati, ed è quello spazio che la panoramica attraversa.
- **Qui si anima lo sfondo**, non un livello separato: su un telefono in verticale la parte principale del movimento è un lungo scorrimento, e la versione più semplice funziona bene.
- **Tre valori separati da virgola** (`0, 0, 22%`): lo sfondo ha tre strati (due gradienti e l'immagine). Ogni valore si riferisce a uno strato, nell'ordine. I primi due restano fermi a `0`, così l'ombra dietro il titolo non si sposta. Si muove solo l'immagine, la terza.
- **Le posizioni `0%` e `100%`** toccano i bordi dell'immagine: in quei momenti si vede tutta, fino all'ultimo pixel. I "ripensamenti" (ad esempio da `22%` a `18%`) danno al movimento un andamento meno meccanico.
- **Lo zoom non scende mai sotto `100%`**: sotto quel valore comparirebbero strisce vuote sopra o sotto l'immagine.
- **Durate diverse e "scomode"** (41, 23 e 31 secondi): tienile numeri diversi tra loro, meglio se primi, per evitare che i movimenti si sincronizzino.
- **Telefono in orizzontale**: non rientra in questo blocco, quindi usa il banner 3:1 con l'animazione desktop, e l'immagine si vede intera.

### Passo 4: rispetto per chi non vuole movimento

Chi ha attivato "riduci movimento" nel sistema operativo non deve vedere animazioni. Questo blocco le spegne e mostra un banner fermo con l'immagine intera:

scss

```scss
// chi ha attivato "riduci movimento" non vede l'animazione
@media (prefers-reduced-motion: reduce) {
  body[data-slug="index"] .article-title {
    animation: none;
    background-size: auto, auto, cover;
    background-position: 0 0, 0 0, center 35%;
  }
  body[data-slug="index"] .article-title::before {
    animation: none;
  }
}
```

Mettilo **dopo** gli altri blocchi, così ha la precedenza. Le due regole servono perché le animazioni sono in due posti diversi: sull'elemento stesso (telefono in verticale) e sul suo `::before` (desktop).

## Parte 2: il testo che compare dolcemente

Per far comparire il contenuto sotto il banner un blocco alla volta, serve prima sapere **dove sta il testo** nell'HTML. In Quartz v5 i paragrafi non sono figli diretti di `<article>`: sono dentro un `div.markdown-preview-view`. Lo si scopre così:

1. apri la pagina, premi **F12**, clicca la freccina in alto a sinistra del pannello e poi su un paragrafo;
2. nella **Console** incolla `[...document.querySelector('article').children].map(c => c.tagName.toLowerCase() + '.' + c.className)`: mostra cosa c'è direttamente dentro `<article>`.

Poi il codice:

scss

```scss
@keyframes scrittura-dolce {
  from { opacity: 0; transform: translateY(12px); filter: blur(4px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
}

body[data-slug="index"] .markdown-preview-view > * {
  animation: scrittura-dolce 1.4s cubic-bezier(0.22, 0.61, 0.36, 1) both;
  animation-delay: 1.8s;   // blocchi oltre il dodicesimo
}

// un blocco dopo l'altro, come se si scrivesse riga dopo riga
@for $i from 1 through 12 {
  body[data-slug="index"] .markdown-preview-view > *:nth-child(#{$i}) {
    animation-delay: #{$i * 0.15}s;
  }
}

@media (prefers-reduced-motion: reduce) {
  body[data-slug="index"] .markdown-preview-view > * {
    animation: none;
  }
}
```

### Come funziona

- **`@keyframes scrittura-dolce`**: ogni blocco parte invisibile, spostato di 12 px verso il basso e sfocato, e arriva alla posizione normale, nitido e visibile.
- **`.markdown-preview-view > *`**: seleziona ogni blocco di primo livello del contenuto (paragrafo, citazione, titolo, lista).
- **`both`**: tiene i blocchi invisibili durante l'attesa del loro turno e visibili alla fine. Senza, comparirebbero per un istante prima di sparire e rientrare.
- **`cubic-bezier(0.22, 0.61, 0.36, 1)`**: una curva che parte decisa e rallenta dolcemente alla fine.
- **`@for $i from 1 through 12`**: un ciclo di Sass (funziona perché il file è `.scss`) che dà a ogni blocco un ritardo crescente di 0,15 secondi. Il primo parte dopo 0,15 s, il secondo dopo 0,30 s e così via. I blocchi dal tredicesimo in poi usano il ritardo di base di 1,8 s.
- **`body[data-slug="index"]`**: Quartz imposta `data-slug` sul `<body>` di ogni pagina, quindi l'effetto vale solo per la home.
- **`prefers-reduced-motion`**: chi ha attivato "riduci movimento" nel sistema operativo vede il testo subito, senza animazione.
- Ho limitato l'effetto alla home. Sulle note il testo può essere l'elemento che i test di velocità considerano per il caricamento, e una comparsa lenta lo ritarderebbe.

## Come personalizzarlo

### Banner

|Cosa vuoi|Cosa cambiare|
|---|---|
|Ombra dietro il titolo più forte|alza il primo `0.55` nel `radial-gradient` (in tutti e due i punti in cui compare)|
|Ombra più larga o più stretta|cambia `55% 65%` (larghezza e altezza dell'ellisse)|
|Immagine più luminosa|abbassa `0.3` e `0.08` nei gradienti|
|Testo più grande o più piccolo|cambia i valori nel `clamp(...)`|
|Movimento desktop più rapido o più lento|cambia `32s` (con `24s` diventa molto dinamico)|
|Zoom desktop più o meno spinto|cambia i valori di `scale(...)` e adatta i `translate` con la regola `(zoom − 1) / 2 × 100%`|
|Inquadratura diversa su desktop|cambia il secondo valore dei `translate` (positivo = parte alta, negativo = parte bassa)|
|Banner più alto su telefono|cambia `height: 260px`|
|Panoramica su telefono più lenta o più veloce|cambia `41s`, `23s`, `31s`, tenendoli numeri diversi tra loro|
|Zoom su telefono più evidente|alza `124%` in `copertina-zoom` (con `135%` si nota molto, ma l'immagine perde nitidezza)|
|Quale fascia si vede con "riduci movimento"|cambia la percentuale in `center 35%`|
|Stesso banner su un'altra pagina|cambia `index` con lo slug di quella pagina|

### Testo

|Cosa vuoi|Cosa cambiare|
|---|---|
|Comparsa più rapida|abbassa `0.15` (pausa tra i blocchi) o `1.4s` (durata di ogni blocco)|
|Effetto più marcato|alza `12px` a `20px` e `4px` a `6px`|
|Effetto più sobrio|abbassa `12px` a `6px`, oppure togli `filter: blur(...)`|
|Più blocchi in cascata|alza `12` nel ciclo `@for`|
|Stesso effetto su tutte le pagine|togli il prefisso `body[data-slug="index"]` nei tre punti in cui compare|
|Stesso effetto su un'altra pagina|cambia `index` con lo slug di quella pagina|

## Problemi comuni

- **In locale funziona, online no.** Può essere la cache: aspetta che finisca il deploy (scheda Actions su GitHub) e ricarica con **Ctrl+Shift+R**. Se non è la cache, controlla le maiuscole del nome file.
- **Maiuscole nei nomi dei file.** Windows e macOS le ignorano, GitHub Pages no. Il nome nel CSS, quello sul disco e quello che Git ha registrato (`git ls-files`) devono coincidere esattamente. Se rinomini un file cambiando solo le maiuscole, Git su Windows non se ne accorge: passa da un nome temporaneo con `git mv`.
- **Il banner non compare.** Controlla con F12 che la classe sia `.article-title` e che il `data-slug` del `<body>` sia `index`. Nei plugin della community i nomi possono cambiare.
- **I bordi dell'immagine sono tagliati su desktop (senza animazione).** Il rapporto nel CSS (`3 / 1`) non corrisponde a quello reale dell'immagine. Dividi larghezza per altezza e usa quel valore.
- **Compaiono strisce vuote durante lo zoom su desktop.** Un `translate` supera il limite `(zoom − 1) / 2 × 100%`. Riduci lo spostamento o alza lo zoom.
- **Lo zoom su desktop è un po' morbido.** Con zoom 1,8 un'immagine di 1800 px su schermi ad alta densità perde nitidezza. Usa una versione più larga (circa 2400-3000 px, con più peso) o riduci lo zoom.
- **Lo zoom su desktop scatta.** Controlla che nei `@keyframes` ogni tratto parta e arrivi con velocità zero (curve "in-out", come sopra). Se scatta ancora, può dipendere dal browser (succede soprattutto su Firefox e Safari): una variante è tenere il livello dell'immagine già alla dimensione massima e usare solo riduzioni di scala.
- **Il titolo è lungo e il box cresce.** Accorcia il titolo nel frontmatter o riduci il `font-size` nel `clamp(...)`.
- **L'animazione su telefono scatta.** Animare `background-size` e `background-position` non è accelerato dalla scheda video. Su dispositivi poco potenti si può ridurre lo zoom o allungare le durate.
- **Un avviso sul "LCP" nei test di velocità.** L'immagine è uno sfondo CSS, e il browser la scopre solo dopo aver letto il CSS. La cura più efficace è un'immagine leggera (passo 0).
- **Il testo non compare o resta invisibile.** Controlla con la Console che la classe sia `.markdown-preview-view` e che il file compili (guarda il terminale dove gira `npx quartz build --serve`).

## Aggiornare Quartz senza perdere tutto

Tutto vive in `custom.scss` e in `content/`, due posti che Quartz non sovrascrive negli aggiornamenti. Prima di aggiornare, fai il commit e lavora su un branch separato: se qualcosa si rompe, torni indietro senza perdere niente. L'unico rischio è che una versione futura cambi il nome della classe `.article-title` o la struttura del contenuto (`.markdown-preview-view`): in quel caso basta aggiornare i selettori.

## Per approfondire

- [Documentazione di Quartz](https://quartz.jzhao.xyz/)