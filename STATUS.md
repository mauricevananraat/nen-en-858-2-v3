# v3 Status

**Versie:** 0.3.0
**Datum start:** 2026-05-18
**Live URL:** https://mauricevananraat.github.io/nen-en-858-2-v3/
**Voorganger:** v2 (https://mauricevananraat.github.io/nen-en-858-2/, blijft live)

## Fase 0 — v3 opzetten ✓ Afgerond op 2026-05-18

- v2-content gekopieerd als baseline (js, css, tests, html, assets)
- v3-identificatie: name `nen-en-858-2-controle-formulier-v3`, version `0.3.0`, dev-poort 8767
- GitHub-repo aangemaakt: https://github.com/mauricevananraat/nen-en-858-2-v3
- GitHub Pages actief op main branch
- Baseline-tests onveranderd: 255 groen + 1 skipped

## Fase v3.1 — UX-polish ✓ Afgerond op 2026-05-18

- Nieuwe modules: `js/toast.js`, `js/import-mode-modal.js`, `js/spinner.js`
- 16 nieuwe tests (5 toast + 7 import-modal + 4 spinner)
- Alle `alert()`-calls vervangen door `showToast` (main, sync-ui, klant-modal, voorziening-modal)
- `confirm()` in import-flow vervangen door custom modal met 2 cards en preview
- Spinner overlay tijdens PDF-genereren
- DB-structuur-validatie vóór mode-modal (geen misleidende 0/0 stats meer)
- ESC + backdrop-click op mode-modal resolven Promise correct (geen stuck-import-lock)
- Tests-status na fase v3.1: 277 groen + 1 skipped

## Fase v3.2 — PWA ✓ Afgerond op 2026-05-18

- pdfMake lokaal gecached in `vendor/pdfmake/`
- App-iconen 192×192 + 512×512 gegenereerd via `npm run gen-icons` (Sharp)
- `manifest.json` met Symitech blauwe theme, standalone display-mode
- `sw.js` service worker met cache-first strategie en `CACHE_VERSION = v3.2.0`
- SW-registratie + update-toast in main.js
- Tool werkt offline na 1e bezoek
- Installeerbaar als app op startscherm (Android)

## Fase 7 backlog (v3.3+ — afhankelijk van praktijk)

- Inline delete-bevestiging i.p.v. confirm
- Emoji-prefix sync-knoppen
- Custom domain (`inspectie.symitech.nl`)
