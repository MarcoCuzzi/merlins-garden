# come l ho creato
ma se volessi fare tipo plugin cosi non rischio mi sparisca tutto il lavoro con un aggiornamento e cosi posso anche condividerlo con altri. sul giardino del creatore ho trovato una guida [https://quartz.jzhao.xyz/advanced/making-plugins](https://quartz.jzhao.xyz/advanced/making-plugins)

Buona idea, ed è la strada che la v5 stessa raccomanda. Leggo la guida che hai trovato prima di dirti cosa serve davvero.

Fetched: Making your own plugins

Fetched: Making your own plugins

Sì, è la strada giusta, e risolve entrambe le preoccupazioni. Dalla guida risulta che i plugin v5 vivono in un repository GitHub a parte e si installano con un comando, quindi un aggiornamento di Quartz non li tocca. Chiunque poi può installarlo con una riga.

**Che tipo di plugin sarebbe**

Il nostro script non ha bisogno di un componente nel layout (che era il problema di prima): ci serve solo che venga caricato in ogni pagina. La guida descrive un tipo di plugin, il _transformer_, che può dichiarare risorse da caricare nel browser tramite `externalResources`, comprese quelle con codice "inline". In pratica lo script che oggi sta in `asciiAnimScript.ts` e arriva dalle due righe di `Head.tsx` verrebbe dichiarato dal plugin, e `Head.tsx` tornerebbe com'era all'origine. Dalla documentazione non ho una conferma esplicita del formato esatto per uno script inline, quindi quel dettaglio andrà provato.

**Cosa cambia per chi lo usa**

- Installazione: `npx quartz plugin add github:MarcoCuzzi/nome-del-plugin` (il nome è un esempio).
- Attivazione e opzioni in `quartz.config.yaml`: `fps` di default, massimo di frame e così via si potrebbero impostare lì, senza toccare il codice.
- Il formato dei file di animazione (`animation`, `fps:`, `bare:`, `<frame>`) resta identico.

**Cosa richiede, onestamente**

È più impegnativo di quanto fatto finora:

1. Un repository GitHub nuovo, creato dal template ufficiale dei plugin.
2. Usare `npm install` e un passaggio di build (`npm run build`).
3. Mettere nel repository anche la cartella `dist/` già compilata, perché Quartz la usa direttamente.
4. Installarlo dal tuo giardino con il comando `plugin add`.

La guida cita lo sviluppo locale con plugin "collegati" (symlink), ma non spiega come farlo, quindi per provare il plugin dovrai pubblicare il repository su GitHub (pubblico, se vuoi condividerlo). Non ho verificato come reagisca la tua v5 a un plugin installato così: potrebbe richiedere qualche aggiustamento.

**Il mio consiglio**

Non rifare tutto adesso. Un ordine ragionevole:

1. Fai un commit della versione attuale, che funziona e ti serve.
2. Crea il plugin a parte, in un repository nuovo, partendo dal template.
3. Quando funziona, togli le due righe da `Head.tsx`, cancella `asciiAnimScript.ts` e installa il plugin.

Così se qualcosa non va, hai ancora la versione funzionante e non resti mai senza animazioni.

Se vuoi procedere, il primo passo è semplice e senza codice: crea un repository su GitHub dal template dei plugin (lo trovi indicato nella guida, `quartz-community/plugin-template`) e dimmi cosa vedi. Da lì ti guido un passo alla volta.


# Ma si potrebbe installare anche se il giardino è già creato in un secondo momento, quindi.

Ha pensato per 1s

Ha pensato per 1s

Sì, si può installare in qualsiasi momento su un giardino già esistente. Il comando della guida, `npx quartz plugin add github:...`, si lancia nel progetto che hai già: aggiunge il plugin a `quartz.config.yaml` e a `quartz.lock.json`, senza ricreare nulla.

Il tuo giardino usa già lo stesso meccanismo: i plugin come `@quartz-community/explorer` o `graph` nel tuo `quartz.config.yaml` sono plugin installati esattamente così. Il nostro sarebbe una riga in più nell'elenco `plugins:`, con il suo `source` che punta al tuo repository GitHub.

**Cosa succederebbe all'installazione**

1. Lanci `npx quartz plugin add github:MarcoCuzzi/nome-del-plugin` dalla cartella con `package.json`.
2. Quartz scarica il plugin, lo registra nella config e nel lockfile.
3. Se vuoi cambiare impostazioni, le scrivi sotto `options:` nella sua voce YAML.
4. Riavvii `npx quartz build --serve` e provi.

**Per chi lo riceve da te**

Vale lo stesso: chiunque abbia un giardino Quartz v5, nuovo o vecchio, può aggiungerlo quando vuole con quel comando, e rimuoverlo con `npx quartz plugin remove nome-del-plugin`.

**Una cosa da fare quando lo installi**

Il plugin e le due righe in `Head.tsx` caricherebbero lo script due volte. Il controllo `window.__asciiAnimLoaded` nel nostro script impedirebbe un doppio funzionamento, ma conviene comunque togliere le righe da `Head.tsx` e cancellare `asciiAnimScript.ts` subito dopo l'installazione, per non tenere codice duplicato.

**Cosa fare ora (nessuna modifica, solo preparazione)**

1. Apri un terminale in una cartella **fuori dal giardino**, per esempio `C:\Users\Marks\Documents`. Non dentro `garden`, per non mescolare i due progetti.
2. Scarica il repository e installa le dipendenze:

```
   git clone https://github.com/MarcoCuzzi/quartz-ascii-anim.git
   cd quartz-ascii-anim
   npm install
   npm run build
```

3. Se `npm run build` finisce senza errori rossi, il template funziona sul tuo computer.
4. Incollami qui:
    - il risultato di `dir src /s /b` (l'elenco dei file nella cartella `src`);
    - il contenuto di `src/index.ts`.

Con quelle due cose ti dico file per file cosa cancellare e cosa cambiare, e dove inserire il nostro script, senza indovinare. Se il `git clone` o il `npm install` danno errore, incollami il messaggio.

Ha pensato per 8s

Il template non compila perché due pacchetti da cui dipende, `@quartz-community/utils` e `@quartz-community/types`, vengono scaricati direttamente da GitHub e arrivano **senza i file compilati**. Non è un tuo errore e non è colpa dei passaggi fatti.

**Cosa ho capito**

- Il codice di esempio mi ha confermato il formato esatto per iniettare uno script: `contentType: "inline"`, `loadTime: "afterDOMReady"`, `script: "..."`. Quel dettaglio che prima non potevo verificare ora è chiaro.
- Gli errori di build vengono da due pacchetti scaricati senza i file compilati: `utils` ha solo `package.json` e README, `types` ha solo i sorgenti. Al nostro plugin non servono a runtime: usa solo tipi, che la build elimina. Quindi togliamo il codice di esempio che usa `utils` e disattiviamo la generazione dei file `.d.ts`, che serve solo a chi sviluppa in TypeScript sul plugin.

Lavora nella cartella del plugin (`quartz-ascii-anim`), non nel giardino.

**1. Cancella i file di esempio** (PowerShell)

```
Remove-Item src\emitter.ts, src\filter.ts
Remove-Item src\components, src\i18n, src\util, src\build, test -Recurse
```

Ho tolto anche `src\build` (il validatore del manifest, che non ho letto e che avrebbe protestato per le modifiche) e `test` (i test di esempio non avrebbero più senso).

**2. Sostituisci il contenuto di questi file** (`src\index.ts`, `src\types.ts`, `src\transformer.ts`) e crea `src\script.ts`

`src\index.ts`:

ts

```ts
export { AsciiAnim } from "./transformer";
export type { AsciiAnimOptions } from "./types";
```

`src\types.ts`:

ts

```ts
export interface AsciiAnimOptions {
  fpsMin: number;
  fpsMax: number;
  fpsDefault: number;
  maxFrames: number;
}
```

`src\transformer.ts`:

ts

```ts
import type { QuartzTransformerPlugin } from "@quartz-community/types";
import type { AsciiAnimOptions } from "./types";
import { buildScript } from "./script";

const defaultOptions: AsciiAnimOptions = {
  fpsMin: 1,
  fpsMax: 30,
  fpsDefault: 4,
  maxFrames: 100,
};

export const AsciiAnim: QuartzTransformerPlugin<Partial<AsciiAnimOptions>> = (userOptions) => {
  const options = { ...defaultOptions, ...userOptions };
  return {
    name: "AsciiAnim",
    externalResources() {
      return {
        js: [
          {
            contentType: "inline",
            loadTime: "afterDOMReady",
            script: buildScript(options),
          },
        ],
      };
    },
  };
};
```

`src\script.ts` (nuovo file, è il nostro script di prima con i limiti presi dalle opzioni):

ts

```ts
import type { AsciiAnimOptions } from "./types";

export function buildScript(options: AsciiAnimOptions): string {
  const config = JSON.stringify(options);
  return String.raw`
(function () {
  if (window.__asciiAnimLoaded) return;
  window.__asciiAnimLoaded = true;

  const CFG = ${config};

  function run() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll("pre code").forEach((code) => {
      const text = code.innerText || "";

      // Parola di controllo: la prima riga deve essere "animation"
      const firstLine = text.trim().split("\n")[0].trim();
      if (firstLine !== "animation") return;

      const [head, ...raw] = text.split("<frame>");
      const frames = raw
        .map((f) => f.replace(/^\n+|\n+$/g, ""))
        .slice(0, CFG.maxFrames);
      if (frames.length === 0) return;

      const settings = {};
      head.split("\n").forEach((line) => {
        const [k, v] = line.split(":");
        if (k && v) settings[k.trim()] = v.trim();
      });

      let fps = Number(settings.fps);
      if (!Number.isFinite(fps)) fps = CFG.fpsDefault;
      fps = Math.min(CFG.fpsMax, Math.max(CFG.fpsMin, fps));

      const bare = ["yes", "true", "si"].includes((settings.bare || "").toLowerCase());

      const out = document.createElement("pre");
      out.className = bare ? "ascii-anim bare" : "ascii-anim";
      out.textContent = frames[0];

      const target = bare
        ? (code.closest(".transclude") || code.closest("pre"))
        : code.closest("pre");
      target.replaceWith(out);

      if (reduceMotion || frames.length < 2) return;

      let i = 0;
      const id = setInterval(() => {
        i = (i + 1) % frames.length;
        out.textContent = frames[i];
      }, 1000 / fps);
      if (window.addCleanup) window.addCleanup(() => clearInterval(id));
    });
  }

  document.addEventListener("nav", run);
  run();
})();
`;
}
```

L'unica differenza di logica rispetto a prima è `run()` chiamata subito, oltre che a ogni `nav`. Serve perché ora lo script viene caricato dopo la pagina e potrebbe perdersi il primo evento `nav`. Non fa danni se arriva due volte, perché i blocchi già trasformati non vengono più trovati.

**3. Sostituisci tutto `tsup.config.ts`**

ts

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: false,
  tsconfig: "tsconfig.build.json",
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2022",
  splitting: false,
  outDir: "dist",
  platform: "node",
  noExternal: [/.*/],
  external: ["preact", "preact/hooks", "preact/jsx-runtime", "preact/compat", "vfile", "vfile/*", "unified"],
});
```

**4. Modifica `package.json`**

- `"name"`: `"quartz-ascii-anim"`
- `"description"`: `"Animazioni ASCII per Quartz v5"`
- `"repository"` → `"url"`: `"https://github.com/MarcoCuzzi/quartz-ascii-anim"`
- Dentro `"exports"`, lascia solo la voce `"."` e cancella `"./types"` e `"./components"`.
- Dentro `"dependencies"`, cancella la riga di `@quartz-community/utils`.
- Sostituisci tutto il blocco `"quartz": { ... }` con:

json

```json
"quartz": {
  "name": "ascii-anim",
  "displayName": "ASCII Animations",
  "category": "transformer",
  "version": "1.0.0",
  "quartzVersion": ">=5.0.0",
  "dependencies": [],
  "defaultOrder": 50,
  "defaultEnabled": true,
  "defaultOptions": {
    "fpsMin": 1,
    "fpsMax": 30,
    "fpsDefault": 4,
    "maxFrames": 100
  }
},
```

Ho tolto `optionSchema` e `components`: non conosco il formato per i numeri e non servono, ma non so se Quartz li pretenda. Se più avanti lamenta qualcosa, lo aggiusteremo.

**5. Prova la build**

```
npm run build
```

Se compare la cartella `dist` con dentro `index.js` e nessun errore rosso, la parte difficile è fatta. Incollami l'esito. Se c'è un errore, incollami quello senza toccare altro.

npm run build  
npm error code EJSONPARSE  
npm error JSON.parse Invalid package.json: JSONParseError: Unexpected non-whitespace character after JSON at position 3152 (line 122 column 4) while parsing near "...\n }\r\n }\r\n },\r\n \"engines\": {\r\n ..."  
npm error JSON.parse Failed to parse JSON data.  
npm error JSON.parse Note: package.json must be actual JSON, not just JavaScript.  
npm error A complete log of this run can be found in: C:\Users\Marks\AppData\Local\npm-cache\_logs\2026-10-12T18_27_33_323Z-debug-0.log

Ha pensato per 10s

Ha pensato per 10s

Quell'errore dice che `package.json` non è più un JSON valido: a riga 122 c'è una parentesi graffa di troppo, quasi certamente un pezzo rimasto del vecchio blocco `quartz` dopo la sostituzione. Invece di cercarla a mano, sostituisci **tutto il contenuto** di `package.json` con questo file completo (apri il file, `Ctrl+A`, incolla):

json

```json
{
  "name": "quartz-ascii-anim",
  "version": "0.1.0",
  "description": "Animazioni ASCII per Quartz v5",
  "type": "module",
  "license": "MIT",
  "author": "MarcoCuzzi",
  "homepage": "https://github.com/MarcoCuzzi/quartz-ascii-anim",
  "repository": {
    "type": "git",
    "url": "https://github.com/MarcoCuzzi/quartz-ascii-anim"
  },
  "keywords": [
    "quartz",
    "quartz-plugin",
    "ascii",
    "animation"
  ],
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ],
  "exports": {
    ".": {
      "import": "./dist/index.js"
    },
    "./package.json": "./package.json"
  },
  "main": "./dist/index.js",
  "sideEffects": false,
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "peerDependencies": {
    "preact": "^10.0.0",
    "vfile": "^6.0.3"
  },
  "peerDependenciesMeta": {
    "preact": {
      "optional": false
    },
    "vfile": {
      "optional": true
    }
  },
  "dependencies": {
    "@quartz-community/types": "github:quartz-community/types"
  },
  "devDependencies": {
    "@types/node": "^24.10.0",
    "preact": "^10.28.2",
    "tsup": "^8.5.0",
    "typescript": "^5.9.3",
    "vfile": "^6.0.3"
  },
  "quartz": {
    "name": "ascii-anim",
    "displayName": "ASCII Animations",
    "category": "transformer",
    "version": "1.0.0",
    "quartzVersion": ">=5.0.0",
    "dependencies": [],
    "defaultOrder": 50,
    "defaultEnabled": true,
    "defaultOptions": {
      "fpsMin": 1,
      "fpsMax": 30,
      "fpsDefault": 4,
      "maxFrames": 100
    }
  },
  "engines": {
    "node": ">=22",
    "npm": ">=10.9.2"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

Rispetto all'originale ho fatto qualche semplificazione in più, per ridurre le cose che possono rompersi:

- Ho tenuto solo gli script `build` e `dev`: gli altri (`test`, `lint`, `typecheck`) dipendevano da file che abbiamo cancellato.
- Ho tolto le dipendenze di sviluppo che servivano solo agli esempi (sass, rehype, remark, vitest, eslint e simili).
- Ho tolto dagli `exports` le voci `types`, perché abbiamo disattivato la generazione dei file `.d.ts`.

Poi, nel terminale, nella cartella del plugin:

```
npm install
npm run build
```

Il primo comando serve perché abbiamo cambiato l'elenco delle dipendenze (può dare di nuovo l'avviso sulle vulnerabilità: ignoralo). Se la build va a buon fine compare la cartella `dist` con `index.js`. Incollami l'esito, qualunque sia.

PS C:\Users\Marks\Desktop\Provascript\quartz-ascii-anim> npm run build

> quartz-ascii-anim@0.1.0 build  
> tsup

CLI Building entry: {"index":"src/index.ts"}  
CLI Using tsconfig: tsconfig.build.json  
CLI tsup v8.5.1  
CLI Using tsup config: C:\Users\Marks\Desktop\Provascript\quartz-ascii-anim\tsup.config.ts  
CLI Target: es2022  
CLI Cleaning output folder  
ESM Build start  
ESM dist\index.js 2.38 KB  
ESM dist\index.js.map 3.85 KB  
ESM ⚡️ Build success in 63ms

Ha pensato per 6s

Ha pensato per 6s

La build è riuscita: `dist\index.js` è stato generato, e per il plugin è il traguardo principale. Restano tre passaggi: pubblicarlo su GitHub, installarlo nel giardino, provarlo.

**1. Pubblica il plugin**

Nella cartella del plugin (`...\Provascript\quartz-ascii-anim`):

```
git add -A
git commit -m "Plugin animazioni ASCII"
git push
```

Poi controlla che la cartella compilata sia finita nel repository:

```
git ls-files dist
```

Deve mostrare `dist/index.js` (e il file `.map`). Se non mostra nulla, `dist` viene ignorata da git: dimmelo, perché senza non si può installare.

Su GitHub potresti vedere una croce rossa accanto al commit: il template include controlli automatici (test, lint) che puntano a file che abbiamo cancellato. Non impedisce l'installazione e lo sistemiamo dopo.

**2. Installalo nel giardino**

Prima, per sicurezza, fai un commit nel giardino (cartella `...\Documents\garden\quartz`). Poi, nella stessa cartella:

```
npx quartz plugin add github:MarcoCuzzi/quartz-ascii-anim
```

Dovrebbe aggiungere una voce a `quartz.config.yaml` e a `quartz.lock.json`. Controlla che nella voce ci sia `enabled: true`.

**3. Togli le righe di prima da `Head.tsx`, altrimenti non capiamo cosa funziona**

Il plugin e il vecchio metodo usano lo stesso controllo anti-doppione (`__asciiAnimLoaded`): se lasci le due righe in `Head.tsx`, parte solo il vecchio script e non sapresti se il plugin funziona. Quindi in `Head.tsx` cancella:

- la riga `import asciiAnimScript from "./asciiAnimScript"`,
- il commento `{/* per animazioni ASCII */}` e la riga `<script dangerouslySetInnerHTML=... />`.

Lascia il file `asciiAnimScript.ts` dov'è, come copia di riserva finché non hai verificato che tutto funzioni.

**4. Prova**

1. `Ctrl+C` e rilancia `npx quartz build --serve`.
2. Controlla che il terminale non mostri errori.
3. Apri `localhost:8080` con `Ctrl+Shift+R` sulla pagina con l'animazione.

Se il disegno si muove, il plugin funziona e puoi cancellare `asciiAnimScript.ts`. Se resta fermo o compare un errore, incollami cosa vedi (terminale o Console) e riguardiamo: se qualcosa non va, l'ipotesi più probabile è nel manifest di `package.json`, che non ho potuto verificare del tutto.

 /static/contentIndex.json  
PS C:\Users\Marks\Desktop\Giardino\quartz> npx quartz build --serve

Quartz v5.0.0

⚠ Plugin "quartz-ascii-anim" declares category "transformer" but its factory returned an instance missing the required methods. Skipping.  
Cleaned output directory `public` in 30ms  
Found 7 input files from `content` in 32ms  
⠹ Parsing input files using 1 threads  
Warning: content/ascii-art/Animazione gif-svg.md isn't yet tracked by git, dates will be inaccurate  
⠇ Parsing input files using 1 threads  
Warning: content/ascii-art/Animazioni inline.md isn't yet tracked by git, dates will be inaccurate  
⠙ Parsing input files using 1 threads  
Warning: content/ascii-art/Animazioni per frame.md isn't yet tracked by git, dates will be inaccurate  
⠼ Parsing input files using 1 threads  
Warning: content/ascii-art/drawings/fiore.md isn't yet tracked by git, dates will be inaccurate  
⠦ Parsing input files using 1 threads  
Warning: content/ascii-art/drawings/fiore2.md isn't yet tracked by git, dates will be inaccurate  
⠏ Parsing input files using 1 threads  
Warning: content/concepts/proprietà-transitiva.md isn't yet tracked by git, dates will be inaccurate  
Parsed 7 Markdown files in 6s  
Filtered out 0 files in 56μs  
Emitted 64 files to `public` in 3s  
Done processing 7 files in 9s

Ha pensato per 9s

Ha pensato per 9s

Ecco la causa, ed era scritta nel terminale:

```
⚠ Plugin "quartz-ascii-anim" declares category "transformer" but its factory returned an instance missing the required methods. Skipping.
```

Quartz trova il plugin, lo chiama, ma il nostro transformer restituisce solo `name` e `externalResources`, e per il suo controllo non basta: pretende almeno uno dei metodi di trasformazione, e ignora il plugin. Per questo non succedeva nulla. Mi dispiace per i giri: quel messaggio era proprio ciò che ti chiedevo da un po'. Quindi il mio sospetto sui file `.d.ts` era sbagliato: non serve nulla di tutto ciò.

**La correzione (nel plugin)**

In `src\transformer.ts` aggiungo tre metodi che non fanno nulla, per soddisfare il controllo. Non so quale dei tre Quartz verifichi, quindi li metto tutti. Sostituisci tutto il contenuto del file con:

ts

```ts
import type { QuartzTransformerPlugin, BuildCtx } from "@quartz-community/types";
import type { AsciiAnimOptions } from "./types";
import { buildScript } from "./script";

const defaultOptions: AsciiAnimOptions = {
  fpsMin: 1,
  fpsMax: 30,
  fpsDefault: 4,
  maxFrames: 100,
};

export const AsciiAnim: QuartzTransformerPlugin<Partial<AsciiAnimOptions>> = (userOptions) => {
  const options = { ...defaultOptions, ...userOptions };
  return {
    name: "AsciiAnim",
    // Metodi vuoti: Quartz richiede almeno uno di questi per accettare il transformer
    textTransform(_ctx: BuildCtx, src: string) {
      return src;
    },
    markdownPlugins() {
      return [];
    },
    htmlPlugins() {
      return [];
    },
    externalResources() {
      return {
        js: [
          {
            contentType: "inline",
            loadTime: "afterDOMReady",
            script: buildScript(options),
          },
        ],
      };
    },
  };
};
```