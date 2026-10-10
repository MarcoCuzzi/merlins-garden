Sto usando Quarz v5 per creare il mio giardino facendomi aiutare dal mio  secondo cervello di Obsidian, praticamente su Obsidian creo le mie idee e le organizzo è in modo privato (e sincronizzato grazie a Syncthing) mentre il mio giardino è una copia migliorata  e pensata per essere pubblicata di parti e collegamenti del mio secondo cervello.
## note
Pe ora il progetto si trova sul mio pc fisso in Documenti/garden/
### Registra dominio
forse puoi registrare un dominio merlinsgarden.org se ritieni che  il sito abbia futuro e stia diventando grande. ho realizzato che però github rimane attivo  anche dovessi smettere di pagare
quindi sto valutando un doppio dominio.
#### Doppio dominio
Posso caricare il mio giardino sia su GitHub GitHub Pages e su Cloudflare o non è bene avere due copie su internet?

**Sì, tecnicamente puoi farlo**, ma pubblicare due copie identiche e accessibili al pubblico sullo stesso web aperto comporta **un problema principale: la SEO e i contenuti duplicati (_duplicate content_)**, oltre a qualche piccolo attrito di sincronizzazione.

Esistono però modi corretti per farlo senza penalizzazioni.

### Cosa succede se pubblichi due copie identiche

1. **Cannibalizzazione SEO e segnali divisi:** I motori di ricerca (come Google) rilevano due URL distinti (`utente.github.io/giardino` e `giardino.pages.dev`) con gli stessi identici testi e struttura. Google sceglierà arbitrariamente quale delle due versioni indicizzare, diluendo l'autorevolezza dei link (_backlink_) e rischiando di deindicizzare pagine di una o dell'altra versione.
    
2. **Confusione per chi ti legge:** I lettori potrebbero trovare versioni diverse della stessa nota tramite ricerche differenti o condividere link verso due domini distinti.
    

### Le 3 soluzioni per gestire due copie in sicurezza

#### 1. Usare il tag `rel="canonical"` (L'approccio consigliato se vuoi entrambi online)

Se vuoi che entrambi i siti siano raggiungibili via browser, devi dichiarare chiaramente ai motori di ricerca quale delle due versioni è quella "maestra".

- Scegli quale versione è la principale (es. Cloudflare Pages).
    
- Nel template HTML del tuo generatore statico (nella sezione `<head>`), inserisci:
    
    HTML
    
    ```
    <link rel="canonical" href="https://tuogiardino.pages.dev/percorso-della-nota/" />
    ```
    
- Anche se il sito è ospitato su GitHub Pages, il tag indicherà a Google di attribuire tutto il valore SEO all'URL di Cloudflare.
    

#### 2. Mettere `noindex` sulla copia secondaria

Se vuoi mantenere GitHub Pages solo come copia di riserva (fallback) accessibile, puoi istruire i motori di ricerca a non indicizzarla.

- Nel file `robots.txt` o nell'header della build destinata a GitHub Pages, aggiungi:
    
    HTML
    
    ```
    <meta name="robots" content="noindex, follow" />
    ```
    

In questo modo Cloudflare sarà l'unica versione visibile sui motori di ricerca, mentre GitHub Pages rimarrà un backup funzionante e visitabile direttamente tramite link.

#### 3. Ridirezione DNS / Edge (La prassi standard del settore)

Se utilizzi un dominio personalizzato (es. `giardino.tuodominio.it`), non serve mantenere due siti web attivi contemporaneamente.

- Il codice sorgente risiede su GitHub.
    
- Cloudflare gestisce il dominio e il deployment.
    
- Se un giorno Cloudflare dovesse avere problemi o smettere di funzionare, ti basta cambiare un record DNS puntandolo su `utente.github.io` per ripristinare il sito in pochi minuti.
    

### Ha senso avere una doppia build?

- **Per ridondanza immediata:** Solo se per te è critico che, in caso di down di Cloudflare (evento estremamente raro), chi naviga sul web trovi subito un mirror funzionante.
    
- **Per conservazione nel tempo:** In realtà **non serve che GitHub Pages sia compilato**. La longevità del tuo giardino risiede nei file sorgente `.md` nel repository Git. Finché il repository è pubblico su GitHub, chiunque può leggerlo, clonarlo o ricompilarlo ovunque anche a distanza di decenni.
    

### Costruzione della risposta

L'analisi si basa sulle linee guida ufficiali di Google Search Central relative ai contenuti duplicati e all'uso dell'attributo `rel="canonical"`, nonché sui principi di ridondanza e failover per architetture statiche JAMstack.
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
[[Immagini-link Cloudflare R2]]



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