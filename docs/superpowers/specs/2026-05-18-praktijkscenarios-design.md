# Praktijkscenarios — Live Demo Design

**Datum:** 2026-05-18
**Status:** Goedgekeurd door Maurice voor implementatieplanning
**Voorganger:** `scripts/live-demo.mjs` (feature-tour, 1 script, 7 features)
**Live URL:** https://mauricevananraat.github.io/nen-en-858-2-v3/NEN-EN-858-2%20controle%20formulier.html

---

## 1. Doel

Maurice wil de tool kunnen demonstreren met **herkenbare praktijkverhalen** in plaats van een feature-tour. Per scenario:

- Realistische klant + voorziening + interval + meetwaarden
- Volledige inspectie-flow van klant-selectie tot PDF-download
- Eindoordeel dat past bij het verhaal (goedgekeurd / opmerking / afgekeurd)
- Live mee te kijken in een zichtbaar Chrome-venster met slow-motion

Niet in scope: PDF-validatie, test-assertions, video-export, i18n van het menu.

---

## 2. De 6 scenarios

### Scenario 1 — Garage van Dijk B.V. (halfjaarlijks, GOEDGEKEURD)

| Veld | Waarde |
|---|---|
| Klant | Garage van Dijk B.V., Hoofdweg 12, 7011 AB Gaanderen |
| Voorziening | OBAS NS-3, 3 m³, beton, "achter wasplaats" |
| Inspecteur | M. de Vries (Symitech) |
| Interval | halfjaarlijks |
| Olielaag | 35 mm (35% — ruim onder 80%) → adviesblok GROEN |
| Slib | 12 mm |
| Functietest | Alarm hoogwater niet getest (halfjaarlijks) |
| Foto-set | overzicht (blauw "OBAS NS-3 OK") + meting (groen "OLIELAAG 35mm OK") |
| Eindoordeel | GOEDGEKEURD — volgende inspectie over 6 mnd |

### Scenario 2 — Trans-Vechtdal Transport (jaarlijks, OPMERKING)

| Veld | Waarde |
|---|---|
| Klant | Trans-Vechtdal Transport, Industrieweg 45, 7731 KE Ommen |
| Voorziening | OBAS NS-6, 6 m³, kunststof, "tankplaats" |
| Inspecteur | M. de Vries |
| Interval | jaarlijks |
| Olielaag | 76 mm (76% — krap onder 80%) → adviesblok ORANJE |
| Slib | 45 mm |
| Functietest | Alarm hoogwater OK |
| BAL | Niet vereist (geen lediging) |
| Foto-set | overzicht (blauw) + meting (oranje "OLIELAAG 76mm KRAP") |
| Eindoordeel | GOEDGEKEURD MET OPMERKING — preventief plannen lediging |

### Scenario 3 — Metaalbewerking Berken B.V. (jaarlijks, AFGEKEURD)

| Veld | Waarde |
|---|---|
| Klant | Metaalbewerking Berken B.V., Berkenlaan 8, 7202 BL Zutphen |
| Voorziening | OBAS NS-10, 10 m³, beton, "productiehal-buitenzijde" |
| Inspecteur | M. de Vries |
| Interval | jaarlijks |
| Olielaag | 95 mm (95% — boven 80% grens) → adviesblok ROOD |
| Slib | 88 mm |
| Functietest | Alarm hoogwater OK |
| BAL | Afvalstroomformulier ref "BAL-2026-0345" |
| Foto-set | overzicht (blauw) + meting (rood "OLIELAAG 95mm OVER") + afvalstroomformulier |
| Eindoordeel | AFGEKEURD — directe lediging + hercontrole binnen 4 weken |

### Scenario 4 — Esso Tankstation A50 (5-jaarlijks, GOEDGEKEURD)

| Veld | Waarde |
|---|---|
| Klant | Esso Tankstation A50 Oost, Rijksweg A50 7, 6629 HZ Apeldoorn |
| Voorziening | OBAS NS-15, 15 m³, beton + coating, "naast pomp 3" |
| Inspecteur | M. de Vries |
| Interval | 5-jaarlijks |
| OBAS-24 | Alle 24 punten "voldoet" |
| Olielaag | 22 mm (22%, recent geledigd) |
| Inwendig §6 | Wanden / schotten / coalescentie / afsluiter / naden alle OK |
| Lekdichtheid §7 | Hydrologisch, 60 min, waterverlies 2 mm — VOLDOET |
| Coating §8 | Intact, geen blaren of scheuren |
| Foto-set | overzicht + §6 (5x groen OK) + §7 testopstelling + §8 coating OK = 8 foto's groen |
| Eindoordeel | GOEDGEKEURD voor 5 jaar |

### Scenario 5 — Loonwerker Veldhuis V.O.F. (5-jaarlijks, AFGEKEURD)

| Veld | Waarde |
|---|---|
| Klant | Loonwerker Veldhuis V.O.F., Buurserveldweg 14, 7481 PC Haaksbergen |
| Voorziening | OBAS NS-6, 6 m³, kunststof, "machinewasplaats" |
| Inspecteur | M. de Vries |
| Interval | 5-jaarlijks |
| OBAS-24 | 22 punten voldoen, 2 afgekeurd (coalescentiefilter vuil, naden afdichtingsprobleem) |
| Olielaag | 45 mm (45%, geen lediging-aanleiding) |
| Inwendig §6 | Coalescentie vuil + naden lekken licht |
| Lekdichtheid §7 | Hydrologisch, 60 min, waterverlies 35 mm — FAALT |
| Coating §8 | Scheuren in coating tussenwand |
| Foto-set | overzicht (blauw) + 5x rood: "COALESCENTIE VUIL", "NADEN LEK", "WATERVERLIES 35mm", "COATINGSCHEUR", "TUSSENWAND" |
| Eindoordeel | AFGEKEURD — coatingherstel + lekdichtheidsherstel + nieuwe coalescentie, herinspectie 8 weken |

### Scenario 6 — Hercontrole Metaalbewerking Berken (jaarlijks-hercontrole, GOEDGEKEURD)

| Veld | Waarde |
|---|---|
| Klant | Metaalbewerking Berken B.V. (zelfde als scenario 3) |
| Voorziening | OBAS NS-10 (zelfde) |
| Inspecteur | M. de Vries |
| Interval | jaarlijks (hercontrole-flag in opmerkingen) |
| Olielaag | 28 mm (28% — na lediging) → adviesblok GROEN |
| Slib | 8 mm |
| Lediging | "Geledigd 2026-04-22 door TankRein B.V., 9.500 L" + ref naar BAL-2026-0345 |
| Functietest | OK |
| Foto-set | overzicht (blauw) + meting (groen "OLIELAAG 28mm — NA LEDIGING") + afvoerbon TankRein |
| Eindoordeel | GOEDGEKEURD — afkeuring van 2026-04-15 opgeheven |

---

## 3. Architectuur

### Bestandsstructuur

```
scripts/
  live-demo.mjs                 # bestaande feature-tour (blijft werken)
  demo-scenarios.mjs            # NIEUW — menu + runner-entry
  scenarios/
    _shared.mjs                 # gedeelde helpers
    _photos.mjs                 # SVG-photo-generator
    1-garage.mjs
    2-transport.mjs
    3-industrie.mjs
    4-tankstation.mjs
    5-agrarisch.mjs
    6-hercontrole.mjs
```

### npm-scripts

```jsonc
"scripts": {
  "demo":      "node scripts/demo-scenarios.mjs",   // NIEUW — interactief menu
  "demo:tour": "node scripts/live-demo.mjs"         // RENAMED — feature-tour
}
```

### Helpers in `_shared.mjs`

| Helper | Doel |
|---|---|
| `launchBrowser()` | Chromium launch, S24-viewport 412×915, slowMo 700ms, console-error-forward |
| `section(title, emoji)` | Visuele scheiding terminal (70 = bovenste/onderste) |
| `step(num, what, why)` | WAT + WAAROM print |
| `info(msg)` | `→` regel |
| `highlight(page, sel)` | Oranje 3px outline 1.5s vóór klik |
| `pause(page, ms = 1500)` | `waitForTimeout` wrapper |
| `seedDatabase(page, klant, voorziening)` | localStorage-key `nen858-database` setten + reload |
| `selectKlant(page, naam)` | klant-dropdown selectie |
| `selectVoorziening(page, naam)` | voorziening-dropdown selectie |
| `setInterval(page, type)` | Interval-switch ("halfjaarlijks" \| "jaarlijks" \| "5jaarlijks") |
| `fillSection1(page, data)` | Inspecteur, datum, weersomstandigheden |
| `fillMeting(page, { olielaag, slib })` | Sectie 2 metingen |
| `fillSection6Inwendig(page, data)` | Wanden / schotten / coalescentie / afsluiter / naden |
| `fillLekdichtheidstest(page, data)` | §7 methode + duur + waterverlies |
| `fillCoating(page, data)` | §8 coatingstatus |
| `injectFoto(page, slotName, photo)` | SVG → PNG-dataURL → tool's foto-API |
| `generatePdf(page)` | Klik btn-pdf, wacht op spinner zichtbaar+onzichtbaar |
| `eindoordeel(page, oordeel, opmerkingen)` | §9 |

### Photo-generator in `_photos.mjs`

```js
export function svgPhoto({ label, sublabel = '', color, icon = '•' }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <rect width="600" height="450" fill="${color}"/>
    <rect x="20" y="20" width="560" height="410" fill="none" stroke="#fff" stroke-width="4"/>
    <text x="300" y="180" text-anchor="middle" font-size="80" fill="#fff">${icon}</text>
    <text x="300" y="260" text-anchor="middle" font-size="38" font-weight="bold" fill="#fff">${label}</text>
    <text x="300" y="310" text-anchor="middle" font-size="22" fill="#fff">${sublabel}</text>
    <text x="300" y="400" text-anchor="middle" font-size="16" fill="#fff">testfoto — scenario-demo</text>
  </svg>`;
  return { svg, label, color, icon };
}

export const COLORS = {
  ok:       '#22c55e',  // groen
  opmerking:'#f59e0b',  // oranje
  defect:   '#dc2626',  // rood
  neutraal: '#005EB8'   // Symitech blauw
};
```

`injectFoto` rendert het svg→png via offscreen canvas in de pagina en geeft de PNG-dataURL aan de tool's foto-API.

### Scenario-module signature

```js
// scenarios/3-industrie.mjs
export const meta = {
  id: 3,
  label: 'Metaalbewerking Berken — jaarlijks — AFGEKEURD',
  klant: { /* ... */ },
  voorziening: { /* ... */ }
};

export async function run(page) {
  // ... stappen voor dit scenario
}
```

---

## 4. Runner-UX

### Menu

Native `readline` raw mode, geen extra deps.

```
$ npm run demo

  NEN-EN 858-2 — Praktijkscenarios
  Kies welk scenario je live wilt zien:

> 1. Garage van Dijk        — halfjaarlijks — GOEDGEKEURD
  2. Trans-Vechtdal         — jaarlijks     — opmerking
  3. Metaalbewerking Berken — jaarlijks     — AFGEKEURD
  4. Esso A50               — 5-jaarlijks   — GOEDGEKEURD
  5. Loonwerker Veldhuis    — 5-jaarlijks   — AFGEKEURD
  6. Berken hercontrole     — jaarlijks     — GOEDGEKEURD
  A. Alle 6 achter elkaar (±15 min totaal)

  [↑/↓ kiezen, Enter starten, q stoppen]
```

### Per-scenario gedrag

| Stap | Wat |
|---|---|
| Start | Chrome opent zichtbaar, viewport 412×915, slowMo 700ms |
| Setup | `localStorage.clear()` → seed klant + voorziening |
| Reload | Tool laadt met klant + voorziening reeds in dropdowns |
| Demo | Console: WAT + WAAROM per stap (zelfde stijl als live-demo) |
| Highlight | Element krijgt 3px oranje outline 1.5s vóór klik |
| PDF | Spinner zichtbaar → download in `~/Downloads/` |
| Eind | Console: "✅ Eindoordeel: GOEDGEKEURD" of "❌ AFGEKEURD" |
| Close | Browser 15s open → auto-close → terug naar menu |

### Gedrag "Alle 6 achter elkaar"

- Eén browser-instance, scenarios sequentieel
- Tussen scenarios: `localStorage.clear()` + reload (geen browser-restart)
- Console: `═══ Scenario 3 van 6 ═══` als scheiding
- Na laatste scenario: 15s pauze → auto-close → terug naar menu
- Ctrl+C stopt direct (finally-block sluit browser netjes)

### Fout-afhandeling

| Situatie | Gedrag |
|---|---|
| URL onbereikbaar (404/timeout) | Console toont fout, browser blijft open voor inspectie |
| Selector ontbreekt (UI veranderd) | Catch toont stap-nummer + selector, browser blijft open |
| Ctrl+C tijdens scenario | `finally` sluit browser + restoret terminal raw-mode |

---

## 5. Bestanden die wijzigen

| Pad | Wijziging |
|---|---|
| `scripts/demo-scenarios.mjs` | NIEUW — menu + runner |
| `scripts/scenarios/_shared.mjs` | NIEUW — gedeelde helpers |
| `scripts/scenarios/_photos.mjs` | NIEUW — SVG-photo-generator |
| `scripts/scenarios/1-garage.mjs` | NIEUW |
| `scripts/scenarios/2-transport.mjs` | NIEUW |
| `scripts/scenarios/3-industrie.mjs` | NIEUW |
| `scripts/scenarios/4-tankstation.mjs` | NIEUW |
| `scripts/scenarios/5-agrarisch.mjs` | NIEUW |
| `scripts/scenarios/6-hercontrole.mjs` | NIEUW |
| `package.json` | `demo` → scenarios; `demo:tour` → live-demo |
| `scripts/live-demo.mjs` | ONGEWIJZIGD (alleen npm-script-naam wijzigt) |

---

## 6. Tests

Geen vitest-tests in deze ronde — dit zijn demo-scripts, geen productie-code.

Verificatie gebeurt visueel:
1. `npm run demo` toont het menu
2. Elk scenario kiest → Chrome opent → scenario draait → PDF downloads
3. Maurice opent gegenereerde PDF's en checkt dat eindoordeel + foto's per scenario kloppen
4. `npm run demo:tour` werkt nog steeds (regressietest van live-demo)

---

## 7. Niet in scope

- PDF-validatie / OCR-checks
- Test-assertions (`expect(...)`) — dit is een demo
- Video-export / GIF-recording
- i18n van het menu (NL hardcoded)
- Foto-assets als binary bestanden in repo (we gebruiken SVG → PNG-dataURL)
- Aanpassingen aan de tool zelf (alleen scripts erbij)

---

## 8. Risico's en mitigaties

| Risico | Mitigatie |
|---|---|
| pdfMake accepteert SVG-dataURL niet | Render SVG via offscreen canvas → PNG-dataURL (in pagina-context) |
| Tool's foto-API verandert (foto-beheer.js refactor) | injectFoto-helper gebruikt dezelfde call als live-demo nu doet; bij refactor 1 plek aanpassen |
| readline raw mode werkt niet in Windows-terminal | Test in PowerShell + Git Bash; fallback `process.stdin.setRawMode(true)` met try/catch — als raw mode faalt, val terug op `node:readline.createInterface` met nummer-input |
| Live URL down (GitHub Pages) | Fallback naar localhost via env-var `DEMO_URL` |
| Scenario-tijden lopen uit (>20 min totaal voor "alle 6") | slowMo 700ms is bewust; bij issue tunable in `_shared.launchBrowser({ slowMo })` |
