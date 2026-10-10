**Solo CSS (molto semplice, per animazioni piccole)**  
Aggiungi poche righe in `quartz/styles/custom.scss`, senza JavaScript e senza creare componenti. Esempio di spinner:

scss

```scss
.spinner::before {
  content: "|";
  animation: spin 0.4s steps(1) infinite;
}
@keyframes spin {
  25% { content: "/"; }
  50% { content: "-"; }
  75% { content: "\\"; }
}
```

Nella nota scrivi `<span class="spinner"></span>` (l'HTML inline di solito funziona in Quartz). Il limite è che è comodo per un carattere o una riga, ma per arte su più righe diventa scomodo.