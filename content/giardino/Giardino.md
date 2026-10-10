Sto usando Quarz v5 per creare il mio giardino facendomi aiutare dal mio  secondo cervello di Obsidian, praticamente su Obsidian creo le mie idee e le organizzo è in modo privato (e sincronizzato grazie a Syncthing) mentre il mio giardino è una copia migliorata  e pensata per essere pubblicata di parti e collegamenti del mio secondo cervello.

## In che modo posso farlo? come strutturo le cartelle?

![[mappa architettura Obsidian-Giardino]]

## Come sto procedendo?
Sto facendo dei test in locale con delle note create in cartelle separate da altri miei file. osservo come funziona e come mi trovo, le note le prenderò poco alla volta da Obsidian per vedere come va.

## Cosa devo fare?
Aggiugere contenuti e funzionalità come Libro degli ospiti e libri letti film preferiti e musica e youtuber preferiti.

## Features
[[Animazioni inline]]
[[Animazione gif-svg]]
[[Animazioni per frame]]

## Lavorare in locale (senza commit)

Dalla cartella con `package.json`:

````
npx quartz build --serve
````

Poi apri `http://localhost:8080`.

- Ricarica forzata: `Ctrl+Shift+R`.
- Le modifiche ai file di configurazione (`quartz.ts`, `quartz.config.yaml`) richiedono di fermare (`Ctrl+C`) e rilanciare il comando.
- Il commit serve solo per pubblicare.
- Il messaggio `[404] /.well-known/appspecific/com.chrome.devtools.json` è innocuo: lo genera Chrome con F12 aperto.