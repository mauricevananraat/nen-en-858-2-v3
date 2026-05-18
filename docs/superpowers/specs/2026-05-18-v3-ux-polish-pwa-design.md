# v3 — UX-polish + PWA Design

**Datum:** 2026-05-18
**Status:** Goedgekeurd door Maurice voor implementatieplanning
**Voorganger:** v2 (live op https://mauricevananraat.github.io/nen-en-858-2/, commit `4f1d948`, 255 tests groen + 1 skipped)
**Strategie:** v2 blijft naast v3 bestaan. v2 is de "stabiele" versie, v3 is "next". Geen migratie verplicht.

---

## 1. Doel

Twee verbeterlagen toevoegen aan de bestaande v2-functionaliteit zonder feature-uitbreiding:
- **v3.1 UX-polish:** minder blokkerende popups, duidelijker import-keuze, visuele feedback tijdens PDF-genereren
- **v3.2 PWA-laag:** offline-werking op locatie, installeerbaar als app op startscherm

Niet-doel: nieuwe inspectie-functionaliteit, datamodelwijzigingen, custom domain, push-notificaties.

---

## 2. Setup

### 2.1 Lokaal
- Nieuwe folder: `NEN_EN858_2-v3` (naast `NEN_EN858_2` en `NEN_EN858_2-v2`)
- `package.json`: name `nen-en-858-2-controle-formulier-v3`, version `0.3.0`
- Dev-poort: `8767` (v1=8765, v2=8766, v3=8767)
- `Start formulier.bat` aangepast naar poort 8767

### 2.2 GitHub
- Nieuwe public repo: `mauricevananraat/nen-en-858-2-v3`
- GitHub Pages aan op `main` branch, root
- Live URL: `https://mauricevananraat.github.io/nen-en-858-2-v3/`
- v2-repo blijft ongewijzigd live

### 2.3 Baseline
- Volledige v2-content gekopieerd: `js/`, `css/`, `tests/`, HTML's, `package.json`, `vitest.config.js`, `symitech_logo.png`, `Start formulier.bat`
- v2-`docs/` worden NIET meegekopieerd (v3 begint met eigen docs); deze v3-spec staat al op de juiste plek
- v2-`.gitignore` wordt overgenomen (incl. `PROMPTS.md`, `node_modules/`, `.worktrees/`)
- v2-tests (255 + 1 skipped) blijven groen na kopie

---

## 3. Fase v3.1 — UX-polish

### 3.1 Toast-systeem

**Probleem:** v2 gebruikt `alert()` voor 5+ user-meldingen (import success/failure, concept load error, import-database alert, etc.). Op mobiel zijn deze blokkerend en voelen ze gedateerd.

**Oplossing:** `js/toast.js` met één publieke functie:
```
showToast(message, type) — type: 'success' | 'error' | 'info'
```

**Gedrag:**
- Toast verschijnt rechtsboven (desktop) of bovenaan-vol (mobiel) met een gekleurde rand:
  - success → groen
  - error → rood
  - info → blauw
- Auto-hide na 4 seconden
- Manueel sluiten via een X-knop
- Max 3 zichtbaar; nieuwere stacken eronder
- Niet-blokkerend (gebruiker kan doorwerken)

**Vervangingen:**
- `js/sync-ui.js` — alle `alert()` in `bindSyncButtons`
- `js/main.js` — alert in btn-load-handler (concept-load fouten), btn-save (succes notificaties zo ja)
- `js/klant-modal.js` — alert in `handleSave` (quota fouten)
- `js/voorziening-modal.js` — alert in `handleSave` (quota fouten)
- `js/database.js` — geen wijzigingen (gooit Errors, niet alert)

### 3.2 Custom import-mode-modal

**Probleem:** v2 toont een lange `confirm()`-popup waar OK=vervangen en Annuleren=samenvoegen. Verwarrend voor de gebruiker.

**Oplossing:** `js/import-mode-modal.js` met één publieke functie:
```
openImportModeModal(currentDb, importedDb) → Promise<'vervang' | 'samenvoegen' | null>
```

**UI:**
- Modal (volgt bestaand modal-pattern uit `js/modal.js`)
- Titel: "Database importeren"
- Body: 2 cards naast elkaar (op mobiel onder elkaar):
  - **Card "Vervangen"** (oranje-rode accent): "X klanten en Y voorzieningen worden vervangen door Z klanten en W voorzieningen uit het bestand."
  - **Card "Samenvoegen"** (groen-blauwe accent): "X klanten + Y nieuwe = Z totaal. Bestaande items blijven behouden."
- Beide cards zijn klikbaar; geselecteerde krijgt highlight
- Footer-knoppen: "Annuleren" (sluiten zonder import) + "Importeer" (alleen actief als er een keuze is)
- Resolved met de gekozen mode, of `null` bij annuleren

**Integratie:**
- `js/sync-ui.js` `bindSyncButtons` import-handler:
  - Vóór: `const wilVervangen = confirm(...)`
  - Na: `const mode = await openImportModeModal(currentDb, importedDb); if (!mode) return;`

### 3.3 PDF-loading-spinner

**Probleem:** PDF-genereren met meerdere foto's duurt 3-8 sec. Gebruiker krijgt geen feedback en denkt dat de knop niet werkt.

**Oplossing:** Overlay-spinner.

**UI:**
- Full-screen semi-transparante overlay
- Centraal: spinner-animatie + tekst "Bezig met genereren van PDF..."
- Verschijnt direct bij klik op "Genereer PDF rapport"
- Verdwijnt zodra `pdfMake.createPdf(...).download()` resolved (download-trigger)
- Geen interactie mogelijk tijdens overlay (modal style)

**Integratie:**
- `js/main.js` btn-pdf handler:
  ```
  showSpinner('Bezig met genereren van PDF...');
  try {
    const dd = buildDocDefinition(state);
    const naam = `inspectie-${...}.pdf`;
    pdfMake.createPdf(dd).download(naam, () => hideSpinner());
  } catch (e) {
    hideSpinner();
    showToast('PDF-generatie mislukt: ' + e.message, 'error');
  }
  ```
- Nieuwe module `js/spinner.js` met `showSpinner(msg)` + `hideSpinner()`

---

## 4. Fase v3.2 — PWA-laag

### 4.1 Web App Manifest

**Bestand:** `manifest.json` in root

**Inhoud:**
- `name`: "OBAS Inspectie — Symitech"
- `short_name`: "OBAS"
- `description`: "Inspectietool NEN-EN 858-2 voor olie/benzine afscheiders"
- `start_url`: "./NEN-EN-858-2 controle formulier.html"
- `display`: "standalone" (geen browser-balk)
- `theme_color`: "#005EB8" (Symitech blauw)
- `background_color`: "#FFFFFF"
- `orientation`: "portrait"
- `icons`: [192×192, 512×512] verwijzend naar `icons/icon-192.png` en `icons/icon-512.png`

**Integratie:** `<link rel="manifest" href="manifest.json">` in beide HTML-bestanden.

### 4.2 App-iconen

**Aanmaken:**
- `icons/icon-192.png` (192×192) — afgeleid uit `symitech_logo.png`, centraal op witte achtergrond, met 20px padding
- `icons/icon-512.png` (512×512) — zelfde compositie, hogere resolutie

**Tooling:** plan-fase voegt een `scripts/gen-icons.js` of vergelijkbaar script toe dat met één commando beide PNG's genereert uit `symitech_logo.png`. Exacte library (Sharp via npm of Python PIL via py) wordt in plan-fase gekozen op basis van wat al beschikbaar is op het systeem.

### 4.3 Service worker

**Bestand:** `sw.js` in root

**Strategie:** Cache-first met manuele cache-versie. Bij elke release wordt `CACHE_VERSION` handmatig opgehoogd.

**Gedrag:**
- `install`-event: alle assets uit `STATIC_ASSETS` cachen
- `activate`-event: oude caches (andere versies) verwijderen
- `fetch`-event: voor elke request → eerst in cache zoeken, dan netwerk. Bij netwerk-fout en geen cache → fallback (geen, want alles staat in cache)

**Gecachte assets:**
- `index.html`, `NEN-EN-858-2 controle formulier.html`
- Alle JS in `js/` (~15 bestanden)
- Alle CSS in `css/`
- `symitech_logo.png`, app-iconen
- pdfMake (`pdfmake.min.js` + `vfs_fonts.js`): we downloaden deze bij v3-setup naar `vendor/pdfmake/` en updaten de HTML om naar de lokale versie te wijzen. Daardoor werkt PDF-generatie ook offline na 1e bezoek

**Versie-strategie:**
```js
const CACHE_VERSION = 'v3.2.0';
const CACHE_NAME = `nen858-${CACHE_VERSION}`;
```
Bij elke release bumpt de developer (Claude tijdens execution): `v3.2.0` → `v3.2.1` → etc.

### 4.4 SW-registratie en update-detectie

**In** `js/main.js` (helemaal onderaan):
```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const newSW = reg.installing;
      newSW.addEventListener('statechange', () => {
        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
          showToast('Nieuwe versie beschikbaar — herlaad de pagina om te activeren.', 'info');
        }
      });
    });
  });
}
```

**Gedrag:**
- 1e bezoek: SW installeert in achtergrond, geen toast
- Latere bezoeken na deploy: nieuwe SW installeert, toast verschijnt
- Gebruiker herlaadt → nieuwe SW activeert + oude cache wordt opgeruimd

### 4.5 Install-prompt
- Chrome Android biedt automatisch "Add to Home screen" aan als manifest + SW correct zijn
- Geen custom install-knop in v3.2 (YAGNI)
- README documenteert hoe gebruiker de app op startscherm zet

---

## 5. Bestandsoverzicht

### Nieuw in v3.1
| Pad | Verantwoordelijkheid |
|-----|----------------------|
| `js/toast.js` | `showToast(msg, type)` — non-blocking notificaties |
| `js/import-mode-modal.js` | `openImportModeModal(...)` — keuze tussen vervangen/samenvoegen |
| `js/spinner.js` | `showSpinner(msg)` / `hideSpinner()` — full-screen overlay |
| `tests/toast.test.js` | Unit-tests voor toast (DOM-mounting, types, auto-hide) |
| `tests/import-mode-modal.test.js` | Unit-tests voor mode-modal (promise resolution, beide modes) |
| `tests/spinner.test.js` | Unit-tests voor spinner (show/hide, message-update) |

### Nieuw in v3.2
| Pad | Verantwoordelijkheid |
|-----|----------------------|
| `manifest.json` | PWA-manifest |
| `sw.js` | Service worker met cache-first strategie |
| `icons/icon-192.png` | App-icoon klein |
| `icons/icon-512.png` | App-icoon groot |

### Gewijzigd
| Pad | Wijziging |
|-----|-----------|
| `package.json` | name + version 0.3.0 |
| `Start formulier.bat` | poort 8767 |
| `NEN-EN-858-2 controle formulier.html` | `<link rel="manifest">` toegevoegd |
| `index.html` | `<link rel="manifest">` toegevoegd |
| `js/main.js` | imports toast/spinner, vervang alerts, SW-registratie, btn-pdf met spinner |
| `js/sync-ui.js` | vervang alerts door toasts, gebruik openImportModeModal |
| `js/klant-modal.js` | vervang alert door toast |
| `js/voorziening-modal.js` | vervang alert door toast |
| `css/styles.css` | toast-stijling, mode-modal-stijling, spinner-stijling |
| `README.md` | v3-specifiek, hoe installeren op startscherm |
| `STATUS.md` | v3-fases bijhouden |

### Niet gewijzigd
- `js/database.js`, `js/state.js`, `js/form-render.js`, `js/photos.js`, `js/dropdown-binding.js`, `js/modal.js`, `js/pdf-builder.js`
- `tests/` — bestaande tests blijven groen (we voegen alleen toe)
- Datamodel localStorage (klant/voorziening v2-schema blijft compatibel)

---

## 6. Definition of Done

Fase v3.1 is afgerond als:
1. `js/toast.js`, `js/import-mode-modal.js`, `js/spinner.js` bestaan met tests
2. Alle 5+ `alert()`-calls in v2-code zijn vervangen door `showToast`
3. Import-flow gebruikt `openImportModeModal` i.p.v. `confirm()`
4. PDF-knop toont spinner van klik tot download-start
5. Test-baseline van v2 (255 + 1 skipped) blijft groen + nieuwe v3.1-tests groen

Fase v3.2 is afgerond als:
6. `manifest.json`, `sw.js`, beide iconen aanwezig
7. SW registreert zonder console-errors
8. Tool werkt offline na 1e bezoek (handmatig getest op laptop én Samsung S24)
9. "Add to Home screen" werkt op Samsung S24 (handmatig getest)
10. Update-toast verschijnt bij nieuwe deploy (handmatig getest met cache-version bump)

v3 als geheel is afgerond als:
11. Live op `https://mauricevananraat.github.io/nen-en-858-2-v3/`
12. README + STATUS bijgewerkt
13. v2 ongewijzigd online

---

## 7. Niet in scope

- Inline delete-bevestiging (terugkomen als v3.3 als praktijk dit eist)
- Emoji-prefix sync-knoppen (terugkomen als v3.3)
- Push-notificaties
- Background sync / cloud-sync
- Custom domain (Fase 7c uit v2-backlog, voor later)
- Datamodel-wijzigingen
- Nieuwe inspectie-secties

---

## 8. Risico's en mitigaties

| Risico | Mitigatie |
|--------|-----------|
| SW cache-invalidation: gebruiker ziet oude versie na deploy | Manuele `CACHE_VERSION` bump verplicht vóór commit; update-toast informeert gebruiker; oude caches expliciet verwijderd in activate-event |
| SW breekt offline-werking als verkeerd geconfigureerd | Cache-first met **whitelist** van bekende assets; geen catch-all proxy; eerste deploy op laptop testen vóór mobiel |
| Toast-queue overloop bij snelle clicks | Max 3 zichtbaar; nieuwere stacken eronder; oudere auto-hidden |
| Mode-modal en bestaande modals (klant/voorziening) conflicteren op z-index | Z-index uit CSS-variables; mode-modal krijgt hogere z-index (`--z-modal-secondary`) |
| Iconen-generatie tooling onbekend | Plan-fase regelt: Sharp via npm, Python PIL, of handmatig in een grafisch tool. Voorkeur: 1 commando in package.json scripts |
| `pdfMake.download` heeft geen succes-callback in alle versies | Wrappen met `setTimeout(hideSpinner, 5000)` als safety net; ook bij thrown errors |
| Service worker cache vol op oude telefoons | Beperk gecachte assets tot ~5 MB; geen video/grote afbeeldingen |
| v2-tests breken door gewijzigde alert/confirm-calls | Test-mocks bijwerken voor toast/modal; oude alert-tests omschrijven |

---

## 9. Vervolgfases (afhankelijk van praktijk)

- **v3.3:** inline delete-bevestiging + emoji-prefix sync-knoppen
- **v3.4:** custom domain (`inspectie.symitech.nl` of vergelijkbaar)
- **v4:** nieuwe inspectie-modules (BRL 7700, andere normen) — alleen als Maurice in praktijk uitbreiding wenst
