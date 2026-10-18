> [!note]- # Titolo della sezione (collassato)
> Questo testo e tutti i paragrafi sottostanti sono nascosti finché non clicchi sull'intestazione del callout.
> 
> Puoi inserire liste, codice o altri blocchi.

mi piace che su obsidina se scrivo # titolo , poi questo puo sparire colassando, c'e' modo di farlo anche su quartz?

In Quartz i titoli nativi (`# Titolo`, `## Sottotitolo`) non sono collassabili di default come nell'editor di Obsidian, ma puoi ottenere questo comportamento in due modi:

1. **Senza toccare il codice (usando i Callout collassabili):** soluzione immediata, compatibile sia con Obsidian che con Quartz.
    
2. **Abilitando i titoli collassabili nel layout HTML/JS di Quartz:** per far funzionare nativamente gli header standard (`h1`, `h2`, `h3`).
    

### Soluzione 1: Callout collassabili (Nessuna modifica a Quartz)

Quartz supporta nativamente la sintassi dei callout di Obsidian. Aggiungendo un `-` dopo il tipo di blocco, il contenuto parte collassato; con un `+` parte espanso ma richiudibile:

Markdown

```
> [!note]- # Titolo della sezione (collassato)
> Questo testo e tutti i paragrafi sottostanti sono nascosti finché non clicchi sull'intestazione del callout.
> 
> Puoi inserire liste, codice o altri blocchi.
```

- **Vantaggio:** Funziona all'istante sia durante la preview in Obsidian sia sul sito compilato da Quartz, senza installare plugin o modificare TypeScript/CSS.
    
- **Limite:** Richiede di racchiudere il testo all'interno della sintassi del blockquote (`>` ).
    

### Soluzione 2: Titoli Markdown collassabili nativi in Quartz

Se vuoi che ogni tag Markdown `#`, `##` o `###` diventi automaticamente cliccabile e ripiegabile sul browser, puoi implementare un piccolo script client-side all'interno della cartella di Quartz.

#### 1. Inserisci lo script per il toggle

Crea o modifica un file script personalizzato (ad esempio in `quartz/components/scripts/collapsibleHeadings.inline.ts`):

TypeScript

```
document.addEventListener("nav", () => {
  const headings = document.querySelectorAll("article :is(h1, h2, h3, h4, h5, h6)")

  headings.forEach((heading) => {
    // Evita di registrare due volte l'evento durante la navigazione SPA
    if (heading.dataset.collapsibleInit) return
    heading.dataset.collapsibleInit = "true"

    heading.style.cursor = "pointer"
    heading.setAttribute("title", "Clicca per comprimere/espandere")

    heading.addEventListener("click", () => {
      heading.classList.toggle("collapsed")
      
      let nextElem = heading.nextElementSibling as HTMLElement | null
      const currentLevel = parseInt(heading.tagName.substring(1), 10)

      while (nextElem) {
        // Se incontra un'altra intestazione di livello pari o superiore, ferma il collasso
        if (/^H[1-6]$/.test(nextElem.tagName)) {
          const nextLevel = parseInt(nextElem.tagName.substring(1), 10)
          if (nextLevel <= currentLevel) break
        }
        
        nextElem.style.display = heading.classList.contains("collapsed") ? "none" : ""
        nextElem = nextElem.nextElementSibling as HTMLElement | null
      }
    })
  })
})
```

#### 2. Aggiungi il CSS per l'indicatore a freccia

Nel file di stile personalizzato (`quartz/styles/custom.scss`), aggiungi un'icona per segnalare visivamente lo stato:

SCSS

```
article {
  h1, h2, h3, h4, h5, h6 {
    &::after {
      content: " ▾";
      font-size: 0.75em;
      opacity: 0.5;
      display: inline-block;
      transition: transform 0.15s ease;
    }

    &.collapsed::after {
      transform: rotate(-90deg);
    }
  }
}
```

#### 3. Registra lo script nel layout

Nel file `quartz.layout.ts`, aggiungi lo script tra i componenti condivisi (o importalo all'interno del componente `Content` / `Body`):

TypeScript

```
import collapsibleHeadings from "./components/scripts/collapsibleHeadings.inline"

// All'interno di sharedPageComponents:
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.CustomScript(collapsibleHeadings), // registra lo script
  ],
  footer: Component.Footer(...),
}
```

Al riavvio del dev server (`npx quartz build --serve`), cliccando su qualsiasi `# Titolo` tutti i paragrafi fino all'intestazione successiva si nasconderanno istantaneamente.