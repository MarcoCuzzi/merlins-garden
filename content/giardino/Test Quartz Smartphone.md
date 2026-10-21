# Vedere Quartz dal telefono (Windows, rete locale)

Guida per aprire il sito Quartz in locale dal telefono e vedere le modifiche in tempo reale, senza pubblicare nulla online.

## Prerequisiti

- PC con Windows e Quartz installato
- Telefono e PC collegati **alla stessa rete Wi-Fi**
- Nessuna VPN attiva sul telefono
- Dati mobili del telefono spenti durante il test (consigliato)

## 1. Avviare Quartz

Nella cartella del progetto:

```
npx quartz build --serve
```

Per impostazione predefinita Quartz usa la porta **8080** (e la **3001** per il ricaricamento automatico). Se usi `--port 1234`, sostituisci 8080 con quella porta in tutti i passaggi.

## 2. Verificare che il server sia raggiungibile dalla rete

Con Quartz acceso, in un altro terminale:

```
netstat -an | findstr :8080
```

Va bene se compare `0.0.0.0:8080` oppure `[::]:8080` con stato `LISTENING` (ascolto su tutte le interfacce). Se compare solo `127.0.0.1:8080`, il server accetta soltanto connessioni dal PC stesso.

## 3. Aprire la porta nel firewall di Windows

Serve **PowerShell come amministratore** (tasto Windows, cerca `PowerShell`, clic destro, _Esegui come amministratore_).

```
New-NetFirewallRule -DisplayName "Quartz dev" -Direction Inbound -Protocol TCP -LocalPort 8080,3001 -Action Allow -Profile Private
```

- `-Profile Private` limita la regola alle reti impostate come **Privata**.
- Se vedi "Accesso negato", PowerShell non è stato aperto come amministratore.
- Questo passaggio si fa **una volta sola**: la regola resta attiva.

## 4. Impostare la rete Wi-Fi su "Privata"

Impostazioni, Rete e Internet, Wi-Fi, proprietà della rete: scegli **Privata**. Con una rete "Pubblica" Windows blocca le connessioni in ingresso anche con la regola attiva.

## 5. Trovare l'IP del PC

```
ipconfig
```

Usa l'indirizzo **IPv4** della sezione **"Scheda LAN wireless Wi-Fi"** (di solito `192.168.x.x`). Ignora gli adattatori virtuali (WSL, VirtualBox, Docker, VPN).

> L'IP può cambiare quando ti riconnetti al router. Se smette di funzionare, rifai `ipconfig`.

## 6. Aprire il sito dal telefono

Nel browser del telefono:

```
http://IL_TUO_IPV4:8080
```

Esempio: `http://192.168.1.25:8080`. Usa `http://`, non `https://`.

Quando modifichi una nota sul PC, la pagina sul telefono si aggiorna da sola.

## Se non funziona

|Sintomo|Causa probabile|Cosa fare|
|---|---|---|
|Non si apre nemmeno dal browser del PC con l'IPv4|IP sbagliato|Controlla `ipconfig` e la sezione Wi-Fi|
|Si apre sul PC ma non sul telefono|Firewall o profilo di rete|Rifai i passaggi 3 e 4|
|Sul telefono non si apre ancora|Il router isola i dispositivi (rete ospiti, ripetitore)|Attiva l'hotspot dal telefono, collega il PC a quella rete e usa il nuovo IP|
|Si apre ma non si aggiorna da solo|Porta 3001 bloccata|Verifica che la regola includa anche la 3001|

## Sicurezza

- La porta è raggiungibile solo dai dispositivi della **tua stessa rete**, non da internet (salvo port forwarding sul router).
- Evita questo metodo su reti pubbliche o condivise (bar, hotel, università): chi è collegato potrebbe vedere il contenuto della cartella `content`.
- Finiti i test, ferma Quartz con `Ctrl+C`.

## Rimuovere la regola del firewall

Quando non ti serve più, da PowerShell come amministratore:

```
Remove-NetFirewallRule -DisplayName "Quartz dev"
```