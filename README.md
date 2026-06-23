# GastroLab — Il Configuratore di Poke Bowl d'Autore

GastroLab è una **Single Page Application (SPA)** moderna, leggera e reattiva, progettata per offrire un'esperienza d'uso premium e minimale (ispirata allo stile *Shadcn*) nella composizione e nell'ordinazione di Poke Bowl personalizzate. 

L'intera applicazione è sviluppata in **Vanilla JavaScript**, **HTML5** e **Tailwind CSS**, garantendo prestazioni fulminee senza la necessità di pesanti framework esterni.

---

## Funzionalità Principali

- **Architettura SPA Real-time**: Navigazione istantanea tra Home Page, Configuratore e Dashboard Amministratore senza alcun ricaricamento della pagina.
- **Filtri Globali Sincronizzati**: Sistema di filtraggio simultaneo (Vegan, Senza Glutine) che agisce istantaneamente sia sulle ricette predefinite in Home Page sia sugli ingredienti all'interno del configuratore.
- **Configuratore Guidato Step-by-Step**: Avanzamento fluido attraverso le categorie (Basi, Proteine, Topping, Salse) con controlli stringenti e validazioni in tempo reale sui limiti massimi inseribili per ciascuno step.
- **Mobile-First UX Optimized**: 
  - **Istruzioni in evidenza**: La dicitura sui limiti massimi di ingredienti è posizionata direttamente sopra le card, saltando subito all'occhio dell'utente su schermi mobile.
  - **Layout Anti-Cutoff**: I filtri della Home usano una disposizione fluida (`flex-wrap`) ed elastica che elimina i vecchi scorrimenti orizzontali e previene il taglio dei testi su smartphone.
- **Carrello Dinamico**: Riepilogo grafico in tempo reale della composizione geometrica della bowl con calcolo automatico del prezzo e pulsanti di rimozione rapida.
- **Checkout con Animazione Lottie**: All'invio dell'ordine, un overlay blocca temporaneamente l'interfaccia con una sfocatura dello sfondo e riproduce un'animazione vettoriale fluida tramite **Lottie Files** per confermare visivamente il successo dell'operazione.
- **Dashboard Admin & Persistenza**: Uno storico ordini locale salvato nel `localStorage` del browser, consultabile tramite una dashboard amministratore accessibile da un link discreto nel footer.

---

## Struttura del Progetto

La base di codice è strutturata in modo modulare per separare nettamente i dati statici, gli stili grafici e la logica comportamentale:

```
├── .gitignore                  # File di configurazione per escludere file dal tracciamento Git
├── index.html                  # Struttura scheletrica della SPA (Pagine, Drawer e Modali)
├── script.js                   # Motore logico (SPA routing, DOM cache, Event Listeners e Render)
├── style.css                   # Animazioni custom, transizioni di pagina e scrollbar geometriche
└── assets/
    ├── img/
    │   └── riso.jpg            # Asset d'esempio per le copertine delle ricette
    ├── js/
    │   └── constants.js        # Data Store statico (Ingredienti, ricette predefinite e icone SVG)
    └── lottie/
        └── Add_to_cart.json    # File JSON per l'animazione di successo all'invio dell'ordine
```
## Come Avviare il Progetto
Poiché il progetto è scritto in codice nativo puro e non richiede passaggi di compilazione o build step:

- Scarica o clona la cartella del repository.

- Avvia l'applicazione tramite un server locale per garantire il corretto caricamento asincrono di script e file Lottie esterni (ad esempio utilizzando l'estensione Live Server su VS Code).

- Apri l'indirizzo locale fornito dal server all'interno del tuo browser.