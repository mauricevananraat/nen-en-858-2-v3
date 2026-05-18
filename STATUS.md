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

## Fase v3.3 — UX-finish + CI ✓ Afgerond op 2026-05-18

Kleine verbeteringen op basis van grondige test van v3:
- Voorpagina geen footer; sectie-pagina's tellen 1 t/m N-1 i.p.v. inclusief voorpagina
- `photoBlock` krijgt optionele `size`-parameter (default 140); §6 Inwendige controle gebruikt 110px voor 5 sub-foto-blokken zodat sectie compacter wordt (valt nu nog over 2 pagina's met natuurlijke break — sub-blokken radio+opmerking+foto blijven samen vragen om 2 pagina's; backlog v3.4 voor wrapper-block)
- Spinner safety-net 10s → 20s via `PDF_SPINNER_TIMEOUT_MS` constante in main.js
- GitHub Actions workflow `.github/workflows/test.yml` draait `npm ci + npm test` bij elke push naar main en alle pull requests (eerste run groen ✓)
- Obsolete `it.skip` test in `tests/sync-ui.test.js` (uit v2 fase 5, mode-keuze via confirm) verwijderd; describe hernoemd naar 'bindSyncButtons — idempotency'

Tests: 277 groen + **0 skipped** (was 277 + 1 skipped).

## Fase 7 backlog (v3.3+ — afhankelijk van praktijk)

- Inline delete-bevestiging i.p.v. confirm
- Emoji-prefix sync-knoppen
- Custom domain (`inspectie.symitech.nl`)
- §6 Inwendig op 1 pagina via subBlock+photoBlock wrapper (in v3.3 alleen photoBlock kleiner, sub-blokken nog separaat onbreakbaar — voor 1-pagina-garantie wrapper-block nodig)
