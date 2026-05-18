# NEN-EN 858-2 Controle Formulier — v3

Inspectietool voor Olie/Benzine Afscheidingsinstallaties (OBAS) volgens NEN-EN 858-2. v3 = v2 + UX-verbeteringen + PWA (offline werken + installeerbaar als app).

**Live:** https://mauricevananraat.github.io/nen-en-858-2-v3/
**v2 (stabiel):** https://mauricevananraat.github.io/nen-en-858-2/

## Wat is nieuw in v3?

- **Toast-meldingen** i.p.v. blokkerende popup-alerts
- **Custom import-modal** met 2 keuze-cards (Vervangen / Samenvoegen) en preview
- **Loading-spinner** tijdens PDF-genereren
- **Offline-werking** via service worker — open de tool op locatie zonder bereik
- **Installeerbaar als app** op je telefoon-startscherm

## Openen op laptop

Open de URL hierboven in Chrome, Edge of Firefox. Hard refresh met `Ctrl+F5` als je net hebt gedeployd.

## Installeren als app (Samsung / Android)

1. Open de URL in Chrome Android.
2. Wacht enkele seconden tot service worker is geregistreerd (geen zichtbare actie nodig).
3. Chrome menu (drie puntjes) → **"Toevoegen aan startscherm"** of **"App installeren"**.
4. Bevestig. Een app-icoon verschijnt op je startscherm.
5. Open vanaf het icoontje — de tool start in standalone-modus zonder browser-balk.

Vanaf nu werkt de tool ook **zonder internet** — handig in een put of kelder zonder bereik.

## Updaten

Push naar `main` → GitHub Pages publiceert binnen ±1 minuut. Bij de eerste keer openen na deploy: toast verschijnt "Nieuwe versie beschikbaar". Herlaad de pagina (`Ctrl+F5` of pull-to-refresh) om te activeren.

Voor cache-invalidation: in `sw.js` bovenaan staat `CACHE_VERSION = 'v3.2.X'`. Bump deze bij elke release (verhoog X).

## Privacy

- Alle data lokaal in `localStorage`
- Geen cloud-sync, analytics of externe API's
- Service worker cachet alleen je eigen assets — niets wordt naar buiten gestuurd

## Lokaal draaien

```bash
py -m http.server 8767
```

Open `http://localhost:8767/NEN-EN-858-2%20controle%20formulier.html`.

## Tests

```bash
npm install   # eenmalig
npm test
```

Verwacht: 277 tests groen + 1 skipped.

## Architectuur

- Vanilla JavaScript ES modules, geen framework
- Vitest + jsdom voor tests
- pdfMake (lokaal gecached) voor PDF-generatie
- Service Worker + Web App Manifest voor PWA

Volledige spec: `docs/superpowers/specs/2026-05-18-v3-ux-polish-pwa-design.md`.
