# Animazioni ASCII nel giardino Quartz v5

## Cos'è

Un sistema per mostrare animazioni in ASCII art nelle note del giardino. Ogni animazione è un file `.md` con i disegni (frame) e le impostazioni, e si richiama da qualsiasi nota con `![[nome-file]]`.

## Come si usa

### 1. Creare un'animazione

Crea un file `.md` (nel mio caso in `ascii-art/`, es. `ascii-art/fiore.md`) con questo formato. Tutto va **dentro un blocco di codice**, altrimenti Markdown rovina gli spazi del disegno.

````md
```text
fps: 4
<frame>
  _
 (_)
  |
<frame>
  _
 (@)
  |
<frame>
  _
 (*)
  |
```
````

Regole:
- Le righe **prima del primo `<frame>`** sono le impostazioni, una per riga, nel formato `chiave: valore`. Per ora esiste solo `fps` (frame al secondo). Se manca, il default è 4.
- Ogni `<frame>` apre un nuovo disegno. Non servono altri separatori.
- Le righe vuote all'inizio e alla fine di ogni frame vengono tolte. Per tenere spazio sopra o sotto, usare uno spazio o un punto.

### 2. Usarla in una nota

````md
Ecco il mio fiore: ![[ascii-art/fiore]]
````

### 3. Come riconosce che deve animare

Non dipende dal simbolo `![[ ]]`, ma dal contenuto: lo script anima **ogni blocco di codice che contiene la scritta `<frame>`**. Un normale `![[nota]]` resta com'è.

Limite: un blocco di codice che parla di `<frame>` per altri motivi verrebbe animato per errore. Se succede, si può chiedere una parola di controllo come prima riga (es. `animation`) e animare solo in quel caso.

## Come è implementato

### File coinvolti

| File | Cosa fa |
|---|---|
| `quartz/components/asciiAnimScript.ts` | Contiene lo script JavaScript che anima i blocchi (file nuovo) |
| `quartz/components/Head.tsx` | Carica lo script in tutte le pagine (file esistente, modificato) |
| `ascii-art/*.md` | Le animazioni (contenuto del giardino) |

### Modifiche a `Head.tsx` (2 righe)

In alto, con gli altri import:

````tsx
import asciiAnimScript from "./asciiAnimScript"
````

Dentro `<head>`, dopo `<meta name="generator" content="Quartz" />`:

````tsx
<script dangerouslySetInnerHTML={{ __html: asciiAnimScript }} />
````

### Cosa fa lo script (`asciiAnimScript.ts`)

Esporta il codice come stringa (`String.raw`). Ad ogni navigazione (evento `nav` di Quartz):

1. Cerca tutti i `pre code` della pagina.
2. Salta quelli che non contengono `<frame>`.
3. Divide il testo su `<frame>`: la prima parte sono le impostazioni, il resto i frame.
4. Legge `fps` dalle impostazioni.
5. Sostituisce il blocco con un `<pre class="ascii-anim">` e cambia il testo a ogni intervallo.
6. Registra `window.addCleanup(...)` per fermare il timer quando si cambia pagina (senza, l'animazione accelera o si sdoppia navigando).

Il controllo `window.__asciiAnimLoaded` evita che lo script si registri due volte.

````ts
// Script client per le animazioni ASCII: trova i blocchi con <frame> e li anima
export default String.raw`
if (!window.__asciiAnimLoaded) {
  window.__asciiAnimLoaded = true

  document.addEventListener("nav", () => {
    const blocks = document.querySelectorAll("pre code")

    blocks.forEach((code) => {
      const text = code.innerText || ""
      if (!text.includes("<frame>")) return

      const [head, ...raw] = text.split("<frame>")
      const frames = raw.map((f) => f.replace(/^\n+|\n+$/g, ""))

      const settings = {}
      head.split("\n").forEach((line) => {
        const [k, v] = line.split(":")
        if (k && v) settings[k.trim()] = v.trim()
      })
      const fps = Number(settings.fps) || 4

      const out = document.createElement("pre")
      out.className = "ascii-anim"
      out.textContent = frames[0]
      code.closest("pre").replaceWith(out)

      let i = 0
      const id = setInterval(() => {
        i = (i + 1) % frames.length
        out.textContent = frames[i]
      }, 1000 / fps)
      window.addCleanup(() => clearInterval(id))
    })
  })
}
`
````
## Cosa non ha funzionato (e perché)

Tentativo iniziale: creare un componente `AsciiAnim.tsx` e agganciarlo al layout.

- In **v5 non esiste `quartz.layout.ts`**: il layout è in `quartz.config.yaml`, e `quartz.ts` serve solo per override avanzati.
- Aggiungere il componente con `defaults.afterBody` o `byPageType.content.afterBody` in `quartz.ts` non lo ha fatto comparire. I componenti custom sono pensati per arrivare dai plugin.
- Soluzione adottata: caricare lo script dal componente `Head`, che è già presente in tutte le pagine.

Il file `AsciiAnim.tsx` e il suo riferimento in `index.ts` e `quartz.ts` sono stati rimossi.

## Da ricordare

- **`Head.tsx` è un file del core di Quartz.** Un aggiornamento (`npx quartz upgrade`) potrebbe sovrascriverlo: dopo l'upgrade controllare che le 2 righe ci siano ancora.
- Il file dell'animazione è anche una **pagina del sito** (compare nell'explorer), dove l'animazione resta ferma.
- Non è gestito `prefers-reduced-motion`: chi ha disattivato le animazioni nel sistema le vede comunque.

## Idee future

- Stile dei disegni con una regola su `.ascii-anim` in `quartz/styles/custom.scss` (colore, dimensione, ecc.).
- Altre impostazioni nell'intestazione del file (es. `loop: false`).
- Riconoscimento esplicito con parola di controllo.
- Nascondere le pagine `ascii-art/*` dall'explorer.


# Animazioni ASCII: sicurezza e controlli (aggiornamento)

Modifiche fatte dopo la prima versione funzionante. Completano la nota "Animazioni ASCII nel giardino Quartz v5".

## Cosa è cambiato

Tre miglioramenti, tutti in `quartz/components/asciiAnimScript.ts` (nessuna modifica a `Head.tsx`):

1. **Parola di controllo esplicita**
2. **Limiti sui parametri**
3. **Rispetto di `prefers-reduced-motion`**
## Il Codice
````ts
// Script client per le animazioni ASCII
export default String.raw`
if (!window.__asciiAnimLoaded) {
  window.__asciiAnimLoaded = true

  const FPS_MIN = 1
  const FPS_MAX = 30
  const FPS_DEFAULT = 4
  const MAX_FRAMES = 100

  document.addEventListener("nav", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    document.querySelectorAll("pre code").forEach((code) => {
      const text = code.innerText || ""

      // Parola di controllo: la prima riga deve essere "animation"
      const firstLine = text.trim().split("\n")[0].trim()
      if (firstLine !== "animation") return

      const [head, ...raw] = text.split("<frame>")
      const frames = raw
        .map((f) => f.replace(/^\n+|\n+$/g, ""))
        .slice(0, MAX_FRAMES)
      if (frames.length === 0) return

      const settings = {}
      head.split("\n").forEach((line) => {
        const [k, v] = line.split(":")
        if (k && v) settings[k.trim()] = v.trim()
      })

      // fps: numero valido, tenuto tra FPS_MIN e FPS_MAX
      let fps = Number(settings.fps)
      if (!Number.isFinite(fps)) fps = FPS_DEFAULT
      fps = Math.min(FPS_MAX, Math.max(FPS_MIN, fps))

      const out = document.createElement("pre")
      out.className = "ascii-anim"
      out.textContent = frames[0]
      code.closest("pre").replaceWith(out)

      // Se l'utente preferisce meno movimento: resta il primo frame, fermo
      if (reduceMotion || frames.length < 2) return

      let i = 0
      const id = setInterval(() => {
        i = (i + 1) % frames.length
        out.textContent = frames[i]
      }, 1000 / fps)
      window.addCleanup(() => clearInterval(id))
    })
  })
}
`
````
## 1. Parola di controllo

Prima lo script animava ogni blocco di codice che conteneva `<frame>`. Ora anima **solo i blocchi la cui prima riga è `animation`**. I blocchi di codice normali non vengono mai toccati, nemmeno se contengono `<frame>`.

### Nuovo formato dei file di animazione

````md
```text
animation
fps: 4
<frame>
  _
 (_)
  |
<frame>
  _
 (@)
  |
```
````

Regole aggiornate:
- La **prima riga** del blocco deve essere `animation`, altrimenti il blocco resta com'è.
- Poi le impostazioni (`chiave: valore`, una per riga). Per ora solo `fps`.
- Ogni `<frame>` apre un nuovo disegno.

**Da fare**: aggiornare tutti i file di animazione già esistenti (es. `ascii-art/fiore.md`) aggiungendo `animation` come prima riga. Senza, non vengono più animati.

## 2. Limiti sui parametri

Costanti all'inizio dello script, modificabili:

| Costante | Valore | Significato |
|---|---|---|
| `FPS_MIN` | 1 | fps minimo accettato |
| `FPS_MAX` | 30 | fps massimo accettato |
| `FPS_DEFAULT` | 4 | usato se `fps` manca o non è un numero |
| `MAX_FRAMES` | 100 | numero massimo di frame letti |

Effetto: `fps: 1000` viene ridotto a 30, `fps: abc` diventa 4, oltre 100 frame vengono ignorati. Protegge soprattutto da errori miei (pagina bloccata da un valore sbagliato).

## 3. Movimento ridotto

Lo script legge `prefers-reduced-motion: reduce`. Se l'utente ha attivato "riduci animazioni" nel sistema operativo:
- il disegno compare comunque, con il **primo frame fermo**;
- non parte nessun timer.

Stessa cosa se l'animazione ha un solo frame.

## Come testare

- **Limite fps**: mettere `fps: 1000` in un'animazione, ricaricare con `Ctrl+Shift+R`. Deve andare a 30 e non bloccare la pagina.
- **Parola di controllo**: togliere `animation` dalla prima riga. Il blocco deve restare un normale blocco di codice con il testo visibile.
- **Movimento ridotto**: in Chrome con F12 aperto, `Ctrl+Shift+P`, scrivere "Show Rendering", poi "Emulate CSS media feature prefers-reduced-motion" → `reduce`. Dopo il ricaricamento il disegno resta fermo.

## Sicurezza: cosa è già a posto

- I frame vengono scritti con `textContent`, **mai** con `innerHTML`: anche un disegno con `<script>` dentro verrebbe mostrato come testo, non eseguito. **Non cambiare mai `textContent` in `innerHTML`.**
- `dangerouslySetInnerHTML` in `Head.tsx` è sicuro perché la stringa è scritta da me e non dipende da chi visita il sito. Diventerebbe un problema solo con contenuti inseriti da altri.

## Idee scartate o rimandate

- **Caricare lo script come file in `quartz/static/`** invece di `dangerouslySetInnerHTML`: più pulito, ma richiede più passaggi. Da fare se aggiungo altri script.
- **Trasformare tutto in un plugin locale** per non dipendere da `Head.tsx`: risolve il problema degli aggiornamenti, ma più lavoro e non verificato in locale. Da valutare se dopo un paio di upgrade ripristinare le due righe diventa fastidioso.

## Promemoria sugli aggiornamenti

Prima di `npx quartz upgrade`:
1. Fare un commit.
2. Dopo l'upgrade, controllare con `git status` / `git diff` se `Head.tsx` ha ancora le due righe (import di `asciiAnimScript` e il tag `<script dangerouslySetInnerHTML=...>`).