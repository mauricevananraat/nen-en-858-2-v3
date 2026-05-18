# Praktijkscenarios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bouw 6 realistische Playwright live-demo scenarios met interactief terminal-menu, naast de bestaande feature-tour.

**Architecture:** Modulair — gedeelde helpers in `scripts/scenarios/_shared.mjs`, photo-generator in `_photos.mjs`, één file per scenario, runner-entry `demo-scenarios.mjs` met readline-menu. Geen tool-wijzigingen, alleen scripts erbij. Bestaande `live-demo.mjs` blijft ongewijzigd en wordt bereikbaar via `npm run demo:tour`.

**Tech Stack:** Node.js ES modules, Playwright (chromium, reeds devDep), native `readline` (geen extra deps), pdfMake-tool draait remote op GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-05-18-praktijkscenarios-design.md` (commit 0e3c903)

**No unit tests:** dit zijn demo-scripts. Verificatie per task = `node --check` syntax + import-smoke-test. Eindverificatie = `npm run demo` interactief draaien.

---

## File Structure

```
scripts/
  live-demo.mjs                 # ONGEWIJZIGD
  demo-scenarios.mjs            # NIEUW — menu + runner (Task 5)
  scenarios/
    _shared.mjs                 # NIEUW — gedeelde helpers (Task 3)
    _photos.mjs                 # NIEUW — SVG-photo-generator (Task 2)
    1-garage.mjs                # NIEUW — Task 4
    2-transport.mjs             # NIEUW — Task 6
    3-industrie.mjs             # NIEUW — Task 7
    4-tankstation.mjs           # NIEUW — Task 8
    5-agrarisch.mjs             # NIEUW — Task 9
    6-hercontrole.mjs           # NIEUW — Task 10
package.json                    # MODIFIED — Task 1 (script-namen switchen)
STATUS.md                       # MODIFIED — Task 11 (afronding)
```

---

## Task 1: package.json — npm-scripts switchen

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update scripts-blok**

Open `package.json` en vervang het scripts-blok door:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "gen-icons": "node scripts/gen-icons.mjs",
  "demo": "node scripts/demo-scenarios.mjs",
  "demo:tour": "node scripts/live-demo.mjs"
}
```

- [ ] **Step 2: Verificatie — npm scripts oplijsten**

Run: `npm run`
Expected output bevat:
```
  demo
    node scripts/demo-scenarios.mjs
  demo:tour
    node scripts/live-demo.mjs
```

(`demo` faalt nog bij draaien want `demo-scenarios.mjs` bestaat nog niet — dat is OK, komt in Task 5)

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: switch npm scripts — demo→scenarios, demo:tour→live-demo

Voorbereiding voor scenario-runner. Bestaande feature-tour blijft
beschikbaar via npm run demo:tour."
```

---

## Task 2: scripts/scenarios/_photos.mjs — SVG-photo-generator

**Files:**
- Create: `scripts/scenarios/_photos.mjs`

- [ ] **Step 1: Maak directory + file**

```bash
mkdir -p scripts/scenarios
```

Schrijf `scripts/scenarios/_photos.mjs`:

```js
/**
 * SVG-photo generator voor scenario-foto's.
 * Output: data-URL SVG die in de browser via canvas.toDataURL('image/png')
 * naar PNG wordt geconverteerd (pdfMake accepteert geen SVG-dataURLs in image:).
 */

export const COLORS = {
  ok:        '#22c55e',  // groen — goedgekeurd / OK
  opmerking: '#f59e0b',  // oranje — let op / krap
  defect:    '#dc2626',  // rood — afgekeurd / over grenswaarde
  neutraal:  '#005EB8'   // Symitech blauw — overzicht / context
};

const ICONS = {
  ok:        '✓',
  opmerking: '⚠',
  defect:    '✕',
  neutraal:  '•'
};

/**
 * Genereer een gelabelde SVG voor een scenario-foto.
 * @param {object} opts
 * @param {string} opts.label - Hoofdtekst (bv. "OLIELAAG 95mm")
 * @param {string} [opts.sublabel] - Onderschrift (bv. "OVER GRENSWAARDE")
 * @param {keyof COLORS} opts.status - 'ok' | 'opmerking' | 'defect' | 'neutraal'
 * @returns {{ svg: string, status: string, label: string }}
 */
export function svgPhoto({ label, sublabel = '', status }) {
  const color = COLORS[status];
  const icon = ICONS[status];
  if (!color) throw new Error(`svgPhoto: onbekende status "${status}"`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <rect width="600" height="450" fill="${color}"/>
  <rect x="20" y="20" width="560" height="410" fill="none" stroke="#fff" stroke-width="4"/>
  <text x="300" y="180" text-anchor="middle" font-size="80" fill="#fff">${icon}</text>
  <text x="300" y="260" text-anchor="middle" font-size="38" font-weight="bold" fill="#fff">${label}</text>
  <text x="300" y="310" text-anchor="middle" font-size="22" fill="#fff">${sublabel}</text>
  <text x="300" y="400" text-anchor="middle" font-size="16" fill="#fff">testfoto — scenario-demo</text>
</svg>`;

  return { svg, status, label };
}
```

- [ ] **Step 2: Syntax-check**

Run: `node --check scripts/scenarios/_photos.mjs`
Expected: geen output, exit code 0.

- [ ] **Step 3: Import-smoke-test**

Run:
```bash
node -e "import('./scripts/scenarios/_photos.mjs').then(m => { const p = m.svgPhoto({label:'TEST', sublabel:'sub', status:'ok'}); console.log('OK:', p.label, p.status, 'svg-bytes:', p.svg.length); })"
```
Expected: `OK: TEST ok svg-bytes: <getal rond 600>`

- [ ] **Step 4: Commit**

```bash
git add scripts/scenarios/_photos.mjs
git commit -m "feat(demo): add SVG-photo generator for scenarios

_photos.mjs produces gelabelde SVG-fotos met 4 statuskleuren
(ok/opmerking/defect/neutraal). Wordt in browser via canvas->PNG
geconverteerd voordat het naar pdfMake gaat."
```

---

## Task 3: scripts/scenarios/_shared.mjs — gedeelde helpers

**Files:**
- Create: `scripts/scenarios/_shared.mjs`

- [ ] **Step 1: Schrijf _shared.mjs**

```js
/**
 * Gedeelde helpers voor scenario-demos.
 * Importeer in elk scenario-file. Helpers verwachten een Playwright Page.
 */

import { chromium } from 'playwright';

export const LIVE_URL = process.env.DEMO_URL ||
  'https://mauricevananraat.github.io/nen-en-858-2-v3/NEN-EN-858-2%20controle%20formulier.html';

export const SLOW_MO_MS = Number(process.env.DEMO_SLOWMO) || 700;

// ─── Console helpers ────────────────────────────────────────────────────────

export function section(title, emoji = '─') {
  console.log('\n' + '═'.repeat(70));
  console.log(`${emoji}  ${title}`);
  console.log('═'.repeat(70));
}

export function step(num, what, why) {
  console.log(`\n  [${num}]  ${what}`);
  console.log(`        Waarom: ${why}`);
}

export function info(msg) {
  console.log(`        → ${msg}`);
}

// ─── Browser/page setup ─────────────────────────────────────────────────────

export async function launchBrowser() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: SLOW_MO_MS,
    args: ['--start-maximized']
  });
  const ctx = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    deviceScaleFactor: 3,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 ' +
               'Chrome/120.0.0.0 Mobile Safari/537.36'
  });
  const page = await ctx.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') info(`[browser-error] ${msg.text()}`);
  });
  return { browser, ctx, page };
}

export async function gotoTool(page) {
  await page.goto(LIVE_URL);
  await pause(page, 2500);
}

// ─── UI helpers ─────────────────────────────────────────────────────────────

export async function highlight(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const orig = el.style.outline;
    el.style.outline = '3px solid #ff5722';
    el.style.outlineOffset = '2px';
    setTimeout(() => { el.style.outline = orig; }, 1500);
  }, selector);
  await page.waitForTimeout(800);
}

export async function pause(page, ms = 1500) {
  await page.waitForTimeout(ms);
}

// ─── Database seeding via localStorage ──────────────────────────────────────

/**
 * Seed klant + voorziening direct in localStorage en herlaad de pagina.
 * @param {import('playwright').Page} page
 * @param {object} klant   - { id, bedrijfsnaam, adres, postcode_plaats, ... }
 * @param {object} voorz   - { id, klant_id, naam, merk, capaciteit_l, ns_klasse, ... }
 */
export async function seedDatabase(page, klant, voorz) {
  await page.evaluate(({ k, v }) => {
    const today = new Date().toISOString().slice(0, 10);
    const db = {
      versie: 1,
      klanten: [{ ...k, aangemaakt: today }],
      voorzieningen: [{ ...v, klant_id: k.id, aangemaakt: today }]
    };
    localStorage.setItem('nen858-database', JSON.stringify(db));
  }, { k: klant, v: voorz });
  await page.reload();
  await pause(page, 2000);
}

// ─── Dropdowns ──────────────────────────────────────────────────────────────

export async function selectKlant(page, bedrijfsnaam) {
  await page.evaluate((naam) => {
    const select = document.querySelector('[data-picker="klant"] select');
    if (!select) throw new Error('Klant-picker niet gevonden');
    const opt = Array.from(select.options).find(o => o.textContent.includes(naam));
    if (!opt) throw new Error(`Klant "${naam}" niet in dropdown`);
    select.value = opt.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }, bedrijfsnaam);
  await pause(page, 1200);
}

export async function selectVoorziening(page, naam) {
  await page.evaluate((n) => {
    const select = document.querySelector('[data-picker="voorziening"] select');
    if (!select) throw new Error('Voorziening-picker niet gevonden');
    const opt = Array.from(select.options).find(o => o.textContent.includes(n));
    if (!opt) throw new Error(`Voorziening "${n}" niet in dropdown`);
    select.value = opt.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }, naam);
  await pause(page, 1500);
}

// ─── Interval-switch ────────────────────────────────────────────────────────

/**
 * @param {string} interval - 'halfjaarlijks' | 'jaarlijks' | '5jaarlijks'
 */
export async function setInterval(page, interval) {
  await page.evaluate((iv) => {
    const r = document.querySelector(`input[name="interval"][value="${iv}"]`);
    if (!r) throw new Error(`Interval "${iv}" niet gevonden`);
    r.checked = true;
    r.dispatchEvent(new Event('change', { bubbles: true }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, interval);
  await pause(page, 2000);
}

// ─── Veld-invoer ────────────────────────────────────────────────────────────

/**
 * Vul sectie 1 — inspectie meta-velden.
 * @param {object} data - { datum, inspecteur, uitvoerend_bureau, weersomstandigheden }
 */
export async function fillSection1(page, data) {
  await page.evaluate((fields) => {
    for (const [name, val] of Object.entries(fields)) {
      const el = document.querySelector(`[data-field="inspectie.${name}"]`);
      if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
    }
  }, data);
  await pause(page, 1000);
}

/**
 * Vul sectie 2 — metingen (olielaag in mm, slib in mm).
 * Maximumwaardes (kolom 2) zijn defaults uit state.js (80 en 400).
 */
export async function fillMeting(page, { olielaag, slib }) {
  await page.evaluate(({ ol, sl }) => {
    const set = (sel, v) => {
      const el = document.querySelector(sel);
      if (el) { el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); }
    };
    set('[data-field="metingen.olielaagdikte_mm"]', ol);
    set('[data-field="metingen.sliblaagdikte_mm"]', sl);
  }, { ol: olielaag, sl: slib });
  await pause(page, 1500);
}

/**
 * Vul resultaat- en opmerking-velden van een groep (functietesten / inwendig / checklist_obas).
 * @param {string} groupPath - 'functietesten' | 'inwendig' | 'checklist_obas'
 * @param {object} entries - { fieldname: { resultaat: 'voldoet', opmerking: '...' }, ... }
 */
export async function fillResultGroup(page, groupPath, entries) {
  await page.evaluate(({ gp, ents }) => {
    for (const [key, val] of Object.entries(ents)) {
      for (const sub of ['resultaat', 'opmerking']) {
        if (val[sub] == null) continue;
        const sel = `[data-field="${gp}.${key}.${sub}"]`;
        const el = document.querySelector(sel);
        if (el) {
          el.value = val[sub];
          el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
        }
      }
    }
  }, { gp: groupPath, ents: entries });
  await pause(page, 1500);
}

/**
 * Vul lekdichtheidstest (§7) — alleen bij 5-jaarlijks zichtbaar.
 */
export async function fillLekdichtheid(page, data) {
  await page.evaluate((d) => {
    const set = (field, val) => {
      const el = document.querySelector(`[data-field="lekdichtheid.${field}"]`);
      if (el) {
        el.value = String(val);
        el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
      }
    };
    for (const [k, v] of Object.entries(d)) set(k, v);
  }, data);
  await pause(page, 1500);
}

/**
 * Vul coating (§8) — alleen bij 5-jaarlijks zichtbaar.
 */
export async function fillCoating(page, data) {
  await page.evaluate((d) => {
    const set = (field, val) => {
      const el = document.querySelector(`[data-field="coating.${field}"]`);
      if (el) {
        el.value = String(val);
        el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
      }
    };
    for (const [k, v] of Object.entries(d)) set(k, v);
  }, data);
  await pause(page, 1500);
}

/**
 * Vul lediging-blok (§5).
 */
export async function fillLediging(page, data) {
  await page.evaluate((d) => {
    for (const [k, v] of Object.entries(d.lediging || {})) {
      const el = document.querySelector(`[data-field="lediging.${k}"]`);
      if (el) { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    for (const [k, v] of Object.entries(d.bal || {})) {
      const el = document.querySelector(`[data-field="bal.${k}"]`);
      if (el) { el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); }
    }
  }, data);
  await pause(page, 1500);
}

// ─── Foto-injectie ──────────────────────────────────────────────────────────

/**
 * Injecteer een SVG-foto in een fotoslot.
 * Rendert SVG via offscreen canvas naar PNG-dataURL, pusht in window.__inspectie.fotos[slot].
 * @param {string} slot - bv. 'overzicht', 'metingen', 'inwendig_coalescentie'
 * @param {{svg: string, label: string}} photo - resultaat van svgPhoto(...)
 * @param {string} [bijschrift] - optioneel onderschrift voor in PDF
 */
export async function injectFoto(page, slot, photo, bijschrift = '') {
  await page.evaluate(async ({ s, svg, lbl, bij }) => {
    const dataUrl = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 450;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    });
    if (!window.__inspectie) throw new Error('window.__inspectie niet beschikbaar — tool nog niet geladen?');
    if (!window.__inspectie.fotos[s]) window.__inspectie.fotos[s] = [];
    window.__inspectie.fotos[s].push({ dataurl: dataUrl, bijschrift: bij || lbl });
  }, { s: slot, svg: photo.svg, lbl: photo.label, bij: bijschrift });
  await pause(page, 600);
}

// ─── Eindoordeel ─────────────────────────────────────────────────────────────

/**
 * @param {string} oordeel - 'goedgekeurd' | 'goedgekeurd_met_opmerking' | 'afgekeurd'
 */
export async function setEindoordeel(page, oordeel, toelichting, volgendeInspectie) {
  await page.evaluate(({ o, t, vi }) => {
    const oEl = document.querySelector('[data-field="conclusie.eindoordeel"]');
    if (oEl) { oEl.value = o; oEl.dispatchEvent(new Event('change', { bubbles: true })); }
    const tEl = document.querySelector('[data-field="conclusie.toelichting"]');
    if (tEl) { tEl.value = t; tEl.dispatchEvent(new Event('input', { bubbles: true })); }
    const vEl = document.querySelector('[data-field="conclusie.volgende_inspectie_datum"]');
    if (vEl) { vEl.value = vi; vEl.dispatchEvent(new Event('input', { bubbles: true })); }
  }, { o: oordeel, t: toelichting, vi: volgendeInspectie });
  await pause(page, 1500);
}

// ─── PDF generatie ───────────────────────────────────────────────────────────

export async function generatePdf(page) {
  await page.evaluate(() => {
    const btn = document.getElementById('btn-pdf');
    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  await pause(page, 1000);
  await highlight(page, '#btn-pdf');

  // Foto-ontbreking-confirm-dialog accepteren als hij verschijnt
  page.once('dialog', async (d) => { await d.accept(); });

  await page.click('#btn-pdf');
  info('Spinner verschijnt — pdfMake bouwt rapport');
  await pause(page, 4500);
  info('PDF download gestart');
}

// ─── Scenario-runner-utility ─────────────────────────────────────────────────

/**
 * Run helper die alle setup + teardown + Ctrl+C-handling regelt.
 * Gebruik in scenario-files: await runScenario(myScenarioMeta, async (page) => { ... });
 */
export async function runScenario(meta, body) {
  const { browser, page } = await launchBrowser();
  let interrupted = false;
  const onInterrupt = () => { interrupted = true; };
  process.once('SIGINT', onInterrupt);
  try {
    await gotoTool(page);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await pause(page, 1500);
    await body(page);
    if (!interrupted) {
      section('Scenario afgerond', '✅');
      console.log(`Scenario "${meta.label}" klaar.`);
      console.log('Browser blijft 15s open voor inspectie — daarna sluit automatisch.');
      await pause(page, 15000);
    }
  } finally {
    process.off('SIGINT', onInterrupt);
    await browser.close();
  }
}
```

- [ ] **Step 2: Syntax-check**

Run: `node --check scripts/scenarios/_shared.mjs`
Expected: exit code 0.

- [ ] **Step 3: Import-smoke-test**

Run:
```bash
node -e "import('./scripts/scenarios/_shared.mjs').then(m => { console.log('Exports:', Object.keys(m).sort().join(', ')); })"
```
Expected output bevat o.a.: `LIVE_URL, SLOW_MO_MS, fillCoating, fillLediging, fillLekdichtheid, fillMeting, fillResultGroup, fillSection1, generatePdf, gotoTool, highlight, info, injectFoto, launchBrowser, pause, runScenario, section, seedDatabase, selectKlant, selectVoorziening, setEindoordeel, setInterval, step`

- [ ] **Step 4: Commit**

```bash
git add scripts/scenarios/_shared.mjs
git commit -m "feat(demo): add gedeelde helpers voor scenario-runner

_shared.mjs bevat launchBrowser, seedDatabase, fillers per sectie,
injectFoto (SVG->PNG canvas), generatePdf, setEindoordeel, runScenario.
Selectors zijn dezelfde als bestaande live-demo.mjs hergebruikt."
```

---

## Task 4: scripts/scenarios/1-garage.mjs — Scenario 1 (Garage, halfjaarlijks, GOEDGEKEURD)

**Files:**
- Create: `scripts/scenarios/1-garage.mjs`

- [ ] **Step 1: Schrijf scenario 1**

```js
import {
  section, step, info, pause,
  seedDatabase, selectKlant, selectVoorziening, setInterval,
  fillSection1, fillMeting, fillResultGroup,
  injectFoto, setEindoordeel, generatePdf, runScenario
} from './_shared.mjs';
import { svgPhoto } from './_photos.mjs';

export const meta = {
  id: 1,
  label: 'Garage van Dijk — halfjaarlijks — GOEDGEKEURD',
  klant: {
    id: 'garage-van-dijk',
    bedrijfsnaam: 'Garage van Dijk B.V.',
    adres: 'Hoofdweg 12',
    postcode_plaats: '7011 AB Gaanderen',
    contactpersoon: 'H. van Dijk',
    telefoon: '0314-555 123'
  },
  voorziening: {
    id: 'obas-ns3-wasplaats',
    naam: 'OBAS NS-3 wasplaats',
    merk: 'Wavin',
    type_bouwjaar: 'OliePass 3 / 2018',
    ns_klasse: 'I',
    capaciteit_l: 3000,
    mat_opbouw: 'beton',
    inlaat_mm: 110,
    uitlaat_mm: 110
  }
};

export async function run(page) {
  section(`Scenario 1: ${meta.label}`, '🚗');

  step(1, 'Klant + voorziening seeden in localStorage',
       'Inspecteur opent tool op locatie — klantgegevens al bekend uit Symitech-database');
  await seedDatabase(page, meta.klant, meta.voorziening);

  step(2, 'Selecteer Garage van Dijk uit klanten-dropdown',
       'Installatie-specs vullen automatisch in sectie 1');
  await selectKlant(page, meta.klant.bedrijfsnaam);
  await selectVoorziening(page, meta.voorziening.naam);

  step(3, 'Interval = halfjaarlijks',
       'Periodieke controle — geen OBAS-24 checklist, geen lekdichtheidstest');
  await setInterval(page, 'halfjaarlijks');

  step(4, 'Sectie 1 — projectgegevens invoeren',
       'Inspecteur, datum, weersomstandigheden');
  await fillSection1(page, {
    datum: new Date().toISOString().slice(0, 10),
    inspecteur: 'M. de Vries',
    uitvoerend_bureau: 'Symitech B.V.',
    weersomstandigheden: 'Droog, 18°C'
  });

  step(5, 'Sectie 2 — metingen invoeren',
       'Olielaag 35mm (35% van 100mm grens) — ruim onder 80% → GROEN advies');
  await fillMeting(page, { olielaag: 35, slib: 12 });
  info('Adviesblok: groen, geen lediging vereist');

  step(6, 'Foto "OVERZICHT OBAS NS-3" injecteren',
       'Standaard overzicht-foto voor in PDF');
  await injectFoto(page, 'overzicht', svgPhoto({
    label: 'OBAS NS-3', sublabel: 'wasplaats Garage van Dijk', status: 'neutraal'
  }));

  step(7, 'Foto "OLIELAAG 35mm OK" injecteren bij metingen',
       'Bewijs van meting — past bij groene advies-status');
  await injectFoto(page, 'metingen', svgPhoto({
    label: 'OLIELAAG 35mm', sublabel: 'binnen grens 80%', status: 'ok'
  }));

  step(8, 'Eindoordeel = GOEDGEKEURD',
       'Volgende inspectie over 6 maanden');
  const volgende = new Date();
  volgende.setMonth(volgende.getMonth() + 6);
  await setEindoordeel(page, 'goedgekeurd',
    'Olielaagdikte 35 mm — ruim onder grenswaarde. Installatie functioneert correct.',
    volgende.toISOString().slice(0, 10));

  step(9, 'PDF genereren', 'Halfjaarlijks rapport voor klant + dossier');
  await generatePdf(page);

  info('✅ Eindoordeel: GOEDGEKEURD');
}

// Standalone draaibaar: node scripts/scenarios/1-garage.mjs
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runScenario(meta, run).catch(err => { console.error(err); process.exit(1); });
}
```

- [ ] **Step 2: Syntax-check**

Run: `node --check scripts/scenarios/1-garage.mjs`
Expected: exit 0.

- [ ] **Step 3: Standalone smoke-run**

Run: `node scripts/scenarios/1-garage.mjs`
Expected: Chrome opent, scenario draait t/m PDF, browser sluit na 15s pause.
**Maurice verifieert visueel** dat:
- Browser opent op live URL
- Klant + voorziening in dropdowns
- Olielaag 35mm → groen advies
- 2 foto's geïnjecteerd (overzicht + metingen)
- PDF gedownload met "GOEDGEKEURD" eindoordeel

Als iets faalt: fix het scenario-file én/of `_shared.mjs` voordat commit.

- [ ] **Step 4: Commit**

```bash
git add scripts/scenarios/1-garage.mjs
git commit -m "feat(demo): add scenario 1 — Garage van Dijk (halfjaarlijks/OK)

Eerste praktijkscenario. Garage met OBAS NS-3, olielaag 35mm,
GOEDGEKEURD. 2 foto's (overzicht neutraal + meting OK)."
```

---

## Task 5: scripts/demo-scenarios.mjs — menu + runner

**Files:**
- Create: `scripts/demo-scenarios.mjs`

- [ ] **Step 1: Schrijf demo-scenarios.mjs**

```js
/**
 * Interactief menu voor het kiezen + draaien van een praktijkscenario.
 * Run: npm run demo
 *
 * Menu-navigatie: pijltjes ↑/↓, Enter = start, q = stoppen.
 * Fallback voor terminals zonder raw-mode: typ scenario-nummer + Enter.
 */

import readline from 'node:readline';
import { runScenario } from './scenarios/_shared.mjs';

const ENTRIES = [
  { num: 1, file: './scenarios/1-garage.mjs',      label: 'Garage van Dijk        — halfjaarlijks — GOEDGEKEURD' },
  { num: 2, file: './scenarios/2-transport.mjs',   label: 'Trans-Vechtdal         — jaarlijks     — opmerking'    },
  { num: 3, file: './scenarios/3-industrie.mjs',   label: 'Metaalbewerking Berken — jaarlijks     — AFGEKEURD'    },
  { num: 4, file: './scenarios/4-tankstation.mjs', label: 'Esso A50               — 5-jaarlijks   — GOEDGEKEURD'  },
  { num: 5, file: './scenarios/5-agrarisch.mjs',   label: 'Loonwerker Veldhuis    — 5-jaarlijks   — AFGEKEURD'    },
  { num: 6, file: './scenarios/6-hercontrole.mjs', label: 'Berken hercontrole     — jaarlijks     — GOEDGEKEURD'  }
];

function clear() {
  process.stdout.write('\x1Bc');
}

function renderMenu(selected) {
  clear();
  console.log('');
  console.log('  NEN-EN 858-2 — Praktijkscenarios');
  console.log('  Kies welk scenario je live wilt zien:');
  console.log('');
  for (const e of ENTRIES) {
    const prefix = selected === e.num ? '> ' : '  ';
    console.log(`${prefix}${e.num}. ${e.label}`);
  }
  const aPrefix = selected === 'A' ? '> ' : '  ';
  console.log(`${aPrefix}A. Alle 6 achter elkaar (±15 min totaal)`);
  console.log('');
  console.log('  [↑/↓ kiezen, Enter starten, q stoppen]');
  console.log('');
}

async function loadScenario(entry) {
  try {
    const mod = await import(entry.file);
    return mod;
  } catch (err) {
    console.error(`\nScenario ${entry.num} kon niet geladen worden:`, err.message);
    console.log('Druk Enter om terug te keren naar menu...');
    await new Promise(r => process.stdin.once('data', r));
    return null;
  }
}

async function runOne(entry) {
  const mod = await loadScenario(entry);
  if (!mod) return;
  await runScenario(mod.meta, mod.run);
}

async function runAll() {
  for (const entry of ENTRIES) {
    console.log(`\n═══ Scenario ${entry.num} van ${ENTRIES.length} ═══`);
    await runOne(entry);
  }
}

function prompt() {
  return new Promise((resolve) => {
    const items = [...ENTRIES.map(e => e.num), 'A'];
    let idx = 0;

    if (!process.stdin.isTTY) {
      // Fallback: numerieke input via readline
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      renderMenu(items[idx]);
      rl.question('Scenario-nummer (1-6, A, q): ', (answer) => {
        rl.close();
        const v = answer.trim().toUpperCase();
        if (v === 'Q') resolve(null);
        else if (v === 'A') resolve('A');
        else if (/^[1-6]$/.test(v)) resolve(Number(v));
        else resolve(null);
      });
      return;
    }

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    renderMenu(items[idx]);

    const onKey = (str, key) => {
      if (key.name === 'up')   { idx = (idx - 1 + items.length) % items.length; renderMenu(items[idx]); }
      else if (key.name === 'down') { idx = (idx + 1) % items.length;            renderMenu(items[idx]); }
      else if (key.name === 'return') { cleanup(); resolve(items[idx]); }
      else if (key.name === 'q' || (key.ctrl && key.name === 'c')) { cleanup(); resolve(null); }
    };
    const cleanup = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener('keypress', onKey);
    };
    process.stdin.on('keypress', onKey);
  });
}

async function main() {
  while (true) {
    const choice = await prompt();
    if (choice == null) {
      console.log('\nTot ziens.');
      process.exit(0);
    }
    if (choice === 'A') {
      await runAll();
    } else {
      const entry = ENTRIES.find(e => e.num === choice);
      if (entry) await runOne(entry);
    }
  }
}

main().catch(err => { console.error('Fatale fout:', err); process.exit(1); });
```

- [ ] **Step 2: Syntax-check**

Run: `node --check scripts/demo-scenarios.mjs`
Expected: exit 0.

- [ ] **Step 3: Smoke-test (visueel, Maurice verifieert)**

Run: `npm run demo`
Expected:
- Menu verschijnt met 6 scenarios + "A. Alle 6 achter elkaar"
- ↑/↓ verplaatst de `>` cursor
- Kies scenario 1 + Enter → scenario 1 draait (zoals Task 4)
- Na scenario eindigt, menu komt terug
- Scenario 2-6 keuze toont "Scenario X kon niet geladen worden" (verwacht, komt in volgende tasks)
- "q" beëindigt netjes

- [ ] **Step 4: Commit**

```bash
git add scripts/demo-scenarios.mjs
git commit -m "feat(demo): add interactive scenario-runner menu

demo-scenarios.mjs toont readline-menu met 6 scenarios + 'alle 6'-optie.
Pijltjes-navigatie + Enter-start. Dynamische import per scenario zodat
ontbrekende scenarios netjes melden i.p.v. menu te breken.

npm run demo opent dit menu (vervangt oude feature-tour, nu demo:tour)."
```

---

## Task 6: scripts/scenarios/2-transport.mjs — Scenario 2 (Trans-Vechtdal, jaarlijks, OPMERKING)

**Files:**
- Create: `scripts/scenarios/2-transport.mjs`

- [ ] **Step 1: Schrijf scenario 2**

```js
import {
  section, step, info, pause,
  seedDatabase, selectKlant, selectVoorziening, setInterval,
  fillSection1, fillMeting, fillResultGroup,
  injectFoto, setEindoordeel, generatePdf, runScenario
} from './_shared.mjs';
import { svgPhoto } from './_photos.mjs';

export const meta = {
  id: 2,
  label: 'Trans-Vechtdal Transport — jaarlijks — opmerking',
  klant: {
    id: 'trans-vechtdal',
    bedrijfsnaam: 'Trans-Vechtdal Transport B.V.',
    adres: 'Industrieweg 45',
    postcode_plaats: '7731 KE Ommen',
    contactpersoon: 'A. Holtkamp',
    telefoon: '0529-555 678'
  },
  voorziening: {
    id: 'obas-ns6-tankplaats',
    naam: 'OBAS NS-6 tankplaats',
    merk: 'ACO',
    type_bouwjaar: 'Oleopator C / 2015',
    ns_klasse: 'II',
    capaciteit_l: 6000,
    mat_opbouw: 'kunststof',
    inlaat_mm: 160,
    uitlaat_mm: 160
  }
};

export async function run(page) {
  section(`Scenario 2: ${meta.label}`, '🚛');

  step(1, 'Seed klant + voorziening', 'Trans-Vechtdal — bekende relatie, jaarlijkse cyclus');
  await seedDatabase(page, meta.klant, meta.voorziening);

  step(2, 'Selecteer klant + voorziening', 'OBAS NS-6 kunststof, 6m³');
  await selectKlant(page, meta.klant.bedrijfsnaam);
  await selectVoorziening(page, meta.voorziening.naam);

  step(3, 'Interval = jaarlijks', 'Jaarcyclus — functietesten verplicht, geen OBAS-24');
  await setInterval(page, 'jaarlijks');

  step(4, 'Sectie 1 invullen', 'Inspecteur, datum, weersomstandigheden');
  await fillSection1(page, {
    datum: new Date().toISOString().slice(0, 10),
    inspecteur: 'M. de Vries',
    uitvoerend_bureau: 'Symitech B.V.',
    weersomstandigheden: 'Bewolkt, 14°C'
  });

  step(5, 'Olielaag 76mm — krap onder 80% grens',
       'Adviesblok ORANJE — preventief plannen lediging');
  await fillMeting(page, { olielaag: 76, slib: 45 });
  info('Adviesblok: oranje "let op — krap onder grens"');

  step(6, 'Functietesten — auto-afsluiter + alarmen OK',
       'Bij jaarlijks moeten alle 3 functietesten getest');
  await fillResultGroup(page, 'functietesten', {
    auto_afsluiter:  { resultaat: 'voldoet', opmerking: '' },
    alarm_olielaag:  { resultaat: 'voldoet', opmerking: '' },
    alarm_hoogwater: { resultaat: 'voldoet', opmerking: '' }
  });

  step(7, 'Foto overzicht + foto met krappe meting',
       'Visueel bewijs voor in rapport');
  await injectFoto(page, 'overzicht', svgPhoto({
    label: 'OBAS NS-6', sublabel: 'tankplaats Trans-Vechtdal', status: 'neutraal'
  }));
  await injectFoto(page, 'metingen', svgPhoto({
    label: 'OLIELAAG 76mm', sublabel: 'KRAP onder grens 80mm', status: 'opmerking'
  }));

  step(8, 'Eindoordeel = GOEDGEKEURD MET OPMERKING',
       'Klant adviseren lediging binnen 3 maanden in te plannen');
  const volgende = new Date();
  volgende.setFullYear(volgende.getFullYear() + 1);
  await setEindoordeel(page, 'goedgekeurd_met_opmerking',
    'Olielaagdikte 76 mm — krap onder grenswaarde. Lediging binnen 3 maanden inplannen.',
    volgende.toISOString().slice(0, 10));

  step(9, 'PDF genereren', 'Jaarrapport met opmerking voor klant');
  await generatePdf(page);

  info('⚠ Eindoordeel: GOEDGEKEURD MET OPMERKING');
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runScenario(meta, run).catch(err => { console.error(err); process.exit(1); });
}
```

- [ ] **Step 2: Syntax-check + run**

Run: `node --check scripts/scenarios/2-transport.mjs`
Expected: exit 0.

Run: `npm run demo` → kies 2 → Enter
**Maurice verifieert visueel** dat:
- Klant + voorziening laden
- Interval jaarlijks → functietest-blok verschijnt
- Olielaag 76mm → ORANJE advies
- 2 foto's + PDF download met "MET OPMERKING"

- [ ] **Step 3: Commit**

```bash
git add scripts/scenarios/2-transport.mjs
git commit -m "feat(demo): add scenario 2 — Trans-Vechtdal (jaarlijks/opmerking)

Jaarlijks scenario met krappe meting (76mm = 76%), GOEDGEKEURD MET
OPMERKING. Toont jaarlijkse functietest-blok + oranje advies."
```

---

## Task 7: scripts/scenarios/3-industrie.mjs — Scenario 3 (Metaalbewerking Berken, jaarlijks, AFGEKEURD)

**Files:**
- Create: `scripts/scenarios/3-industrie.mjs`

- [ ] **Step 1: Schrijf scenario 3**

```js
import {
  section, step, info, pause,
  seedDatabase, selectKlant, selectVoorziening, setInterval,
  fillSection1, fillMeting, fillResultGroup, fillLediging,
  injectFoto, setEindoordeel, generatePdf, runScenario
} from './_shared.mjs';
import { svgPhoto } from './_photos.mjs';

export const meta = {
  id: 3,
  label: 'Metaalbewerking Berken — jaarlijks — AFGEKEURD',
  klant: {
    id: 'metaalbewerking-berken',
    bedrijfsnaam: 'Metaalbewerking Berken B.V.',
    adres: 'Berkenlaan 8',
    postcode_plaats: '7202 BL Zutphen',
    contactpersoon: 'J. Berken',
    telefoon: '0575-555 901'
  },
  voorziening: {
    id: 'obas-ns10-productiehal',
    naam: 'OBAS NS-10 productiehal-buiten',
    merk: 'Wavin',
    type_bouwjaar: 'OliePass 10 / 2012',
    ns_klasse: 'II',
    capaciteit_l: 10000,
    mat_opbouw: 'beton',
    inlaat_mm: 200,
    uitlaat_mm: 200
  }
};

export async function run(page) {
  section(`Scenario 3: ${meta.label}`, '🏭');

  step(1, 'Seed klant + voorziening',
       'Industriële klant — grote OBAS NS-10 voor metaalbewerking');
  await seedDatabase(page, meta.klant, meta.voorziening);

  step(2, 'Selecteer klant + voorziening', '');
  await selectKlant(page, meta.klant.bedrijfsnaam);
  await selectVoorziening(page, meta.voorziening.naam);

  step(3, 'Interval = jaarlijks', '');
  await setInterval(page, 'jaarlijks');

  step(4, 'Sectie 1 invullen', '');
  await fillSection1(page, {
    datum: new Date().toISOString().slice(0, 10),
    inspecteur: 'M. de Vries',
    uitvoerend_bureau: 'Symitech B.V.',
    weersomstandigheden: 'Regen, 9°C'
  });

  step(5, 'Olielaag 95mm — boven 80% grens',
       'Adviesblok ROOD — directe lediging vereist');
  await fillMeting(page, { olielaag: 95, slib: 88 });
  info('Adviesblok: rood "AFGEKEURD — lediging direct vereist"');

  step(6, 'Functietesten — alarmen werken nog wel', '');
  await fillResultGroup(page, 'functietesten', {
    auto_afsluiter:  { resultaat: 'voldoet', opmerking: '' },
    alarm_olielaag:  { resultaat: 'voldoet', opmerking: 'Alarm geactiveerd door overschrijding' },
    alarm_hoogwater: { resultaat: 'voldoet', opmerking: '' }
  });

  step(7, 'Lediging-blok + BAL-referentie',
       'Wettelijk verplicht bij afkeur — Afvalstroomformulier-referentie meegeven');
  await fillLediging(page, {
    lediging: { obas: 'ja', slibvang: 'ja' },
    bal: {
      verwerker: 'TankRein B.V.',
      afvoerbon: 'BAL-2026-0345',
      euralcode: '13.05.06',
      hoeveelheid_l: 9500
    }
  });

  step(8, 'Foto overzicht + meting "OVER GRENS" + afvalstroomformulier',
       '3 foto\'s — overzicht + rode meting + BAL-formulier');
  await injectFoto(page, 'overzicht', svgPhoto({
    label: 'OBAS NS-10', sublabel: 'productiehal Berken', status: 'neutraal'
  }));
  await injectFoto(page, 'metingen', svgPhoto({
    label: 'OLIELAAG 95mm', sublabel: 'OVER GRENSWAARDE', status: 'defect'
  }));
  await injectFoto(page, 'afvalstroomformulier', svgPhoto({
    label: 'BAL-2026-0345', sublabel: 'TankRein B.V., 9500 L', status: 'neutraal'
  }));

  step(9, 'Eindoordeel = AFGEKEURD',
       'Hercontrole binnen 4 weken — bewijs van lediging vereist');
  const hercontrole = new Date();
  hercontrole.setDate(hercontrole.getDate() + 28);
  await setEindoordeel(page, 'afgekeurd',
    'Olielaagdikte 95 mm — boven grenswaarde. Directe lediging uitgevoerd door TankRein B.V. (afvoerbon BAL-2026-0345). Hercontrole binnen 4 weken.',
    hercontrole.toISOString().slice(0, 10));

  step(10, 'PDF genereren', 'Afkeur-rapport voor klant + dossier');
  await generatePdf(page);

  info('❌ Eindoordeel: AFGEKEURD');
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runScenario(meta, run).catch(err => { console.error(err); process.exit(1); });
}
```

- [ ] **Step 2: Syntax + run**

Run: `node --check scripts/scenarios/3-industrie.mjs` → exit 0
Run: `npm run demo` → 3 → Enter
**Maurice verifieert:** olielaag 95mm = ROOD advies, BAL-formulier gevuld, 3 foto's, PDF "AFGEKEURD".

- [ ] **Step 3: Commit**

```bash
git add scripts/scenarios/3-industrie.mjs
git commit -m "feat(demo): add scenario 3 — Metaalbewerking Berken (jaarlijks/AFGEKEURD)

Industriële klant met olielaag 95mm over grens. AFGEKEURD met
direct-lediging + BAL-referentie + hercontrole-datum 4 weken."
```

---

## Task 8: scripts/scenarios/4-tankstation.mjs — Scenario 4 (Esso A50, 5-jaarlijks, GOEDGEKEURD)

**Files:**
- Create: `scripts/scenarios/4-tankstation.mjs`

- [ ] **Step 1: Schrijf scenario 4**

```js
import {
  section, step, info, pause,
  seedDatabase, selectKlant, selectVoorziening, setInterval,
  fillSection1, fillMeting, fillResultGroup, fillLekdichtheid, fillCoating,
  injectFoto, setEindoordeel, generatePdf, runScenario
} from './_shared.mjs';
import { svgPhoto } from './_photos.mjs';

export const meta = {
  id: 4,
  label: 'Esso A50 — 5-jaarlijks — GOEDGEKEURD',
  klant: {
    id: 'esso-a50-oost',
    bedrijfsnaam: 'Esso Tankstation A50 Oost',
    adres: 'Rijksweg A50 7',
    postcode_plaats: '6629 HZ Apeldoorn',
    contactpersoon: 'R. Velthuis (stationmanager)',
    telefoon: '055-555 234'
  },
  voorziening: {
    id: 'obas-ns15-pomp3',
    naam: 'OBAS NS-15 naast pomp 3',
    merk: 'ACO',
    type_bouwjaar: 'Oleopator K / 2021',
    ns_klasse: 'II',
    capaciteit_l: 15000,
    mat_opbouw: 'beton + coating',
    inlaat_mm: 200,
    uitlaat_mm: 200
  }
};

// Alle 24 OBAS-checklist punten als "voldoet"
const OBAS24_ALLES_OK = Object.fromEntries(
  ['afdekkingen', 'opbouw_obas', 'vlotterbal', 'vlotterbalschotel', 'grofvuilrooster',
   'inlaat_obas', 'uitlaat_obas', 'niveau_obas', 'capaciteit_obas',
   'opbouw_slibvangput', 'inlaat_slibvangput', 'uitlaat_slibvangput',
   'niveau_slibvangput', 'inhoud_slibvangput', 'controleput', 'niveau_controleput',
   'lozing', 'effluent_visueel', 'coalescentiefilter', 'alarm_olielaagdikte',
   'alarm_hoogwater', 'recycleput', 'accumat', 'afvoerkanaal_gereinigd'
  ].map(k => [k, { resultaat: 'voldoet', opmerking: '' }])
);

export async function run(page) {
  section(`Scenario 4: ${meta.label}`, '⛽');

  step(1, 'Seed klant + voorziening', 'Tankstation Esso — 5-jaarlijkse keuring NS-15');
  await seedDatabase(page, meta.klant, meta.voorziening);

  step(2, 'Selecteer klant + voorziening', '');
  await selectKlant(page, meta.klant.bedrijfsnaam);
  await selectVoorziening(page, meta.voorziening.naam);

  step(3, 'Interval = 5-jaarlijks',
       'Toont OBAS-24 checklist + §6 inwendig + §7 lekdichtheidstest + §8 coating');
  await setInterval(page, '5jaarlijks');

  step(4, 'Sectie 1', '');
  await fillSection1(page, {
    datum: new Date().toISOString().slice(0, 10),
    inspecteur: 'M. de Vries',
    uitvoerend_bureau: 'Symitech B.V.',
    weersomstandigheden: 'Helder, 16°C'
  });

  step(5, 'Olielaag 22mm — recent geledigd', 'Ruim onder grens');
  await fillMeting(page, { olielaag: 22, slib: 18 });

  step(6, 'OBAS-24 checklist — alle 24 punten voldoen',
       'Visuele controle door inspecteur — alles in orde');
  await fillResultGroup(page, 'checklist_obas', OBAS24_ALLES_OK);

  step(7, 'Sectie 6 inwendig — alle 5 sub-punten OK',
       'Wanden, schotten, coalescentie, afsluiter, naden visueel OK');
  await fillResultGroup(page, 'inwendig', {
    wanden_bodem:          { resultaat: 'voldoet', opmerking: 'Wanden glad, geen scheuren' },
    schotten_vlotterkoker: { resultaat: 'voldoet', opmerking: 'Schotten intact' },
    coalescentiefilter:    { resultaat: 'voldoet', opmerking: 'Filter schoon, recent vervangen', actie: 'geen' },
    afsluiter_mechanisch:  { resultaat: 'voldoet', opmerking: 'Afsluiter werkt soepel' },
    naden_aansluitingen:   { resultaat: 'voldoet', opmerking: 'Naden droog, geen lekkage' }
  });

  step(8, 'Sectie 7 lekdichtheidstest — hydrologisch 60 min, waterverlies 2mm',
       'Voldoet ruim aan norm (max 5mm/uur)');
  await fillLekdichtheid(page, {
    testmethode: 'Hydrologisch',
    testduur_min: 60,
    beginniveau_mm: 1500,
    eindniveau_mm: 1498,
    gemeten_verlies_mm: 2,
    toegestaan_mm_uur: 5,
    resultaat: 'voldoet',
    opmerking: 'Lekdichtheid binnen norm'
  });

  step(9, 'Sectie 8 coating — intact', '');
  await fillCoating(page, {
    aanwezig: 'ja',
    type: 'epoxy 2-componenten',
    leeftijd_jaar: 5,
    restlevensduur_jaar: 10,
    visuele_staat: 'geen blaren, geen scheuren, kleurvast',
    resultaat: 'voldoet'
  });

  step(10, 'Foto-set: overzicht + 5 §6 OK + lekdichtheid + coating',
        '8 groene OK-foto\'s in PDF');
  await injectFoto(page, 'overzicht', svgPhoto({
    label: 'OBAS NS-15', sublabel: 'Esso A50 pomp 3', status: 'neutraal'
  }));
  for (const slot of ['inwendig_wanden', 'inwendig_schotten', 'inwendig_coalescentie',
                       'inwendig_afsluiter', 'inwendig_naden']) {
    const labels = {
      inwendig_wanden:        { l: 'WANDEN', s: 'geen scheuren' },
      inwendig_schotten:      { l: 'SCHOTTEN', s: 'intact' },
      inwendig_coalescentie:  { l: 'COALESCENTIE', s: 'recent vervangen' },
      inwendig_afsluiter:     { l: 'AFSLUITER', s: 'soepel werkend' },
      inwendig_naden:         { l: 'NADEN', s: 'droog, geen lek' }
    };
    await injectFoto(page, slot, svgPhoto({
      label: labels[slot].l, sublabel: labels[slot].s, status: 'ok'
    }));
  }
  await injectFoto(page, 'lekdichtheid', svgPhoto({
    label: 'LEKDICHTHEID', sublabel: 'verlies 2mm / 60min OK', status: 'ok'
  }));
  await injectFoto(page, 'coating', svgPhoto({
    label: 'COATING', sublabel: 'epoxy intact', status: 'ok'
  }));

  step(11, 'Eindoordeel = GOEDGEKEURD voor 5 jaar', '');
  const volgende = new Date();
  volgende.setFullYear(volgende.getFullYear() + 5);
  await setEindoordeel(page, 'goedgekeurd',
    '5-jaarlijkse keuring uitgevoerd. OBAS-24 checklist: 24/24 voldoen. Lekdichtheidstest: waterverlies 2mm/60min (binnen norm). Coating intact. Volgende 5-jaarlijkse keuring 2031.',
    volgende.toISOString().slice(0, 10));

  step(12, 'PDF genereren', 'Uitgebreid 5-jaarlijks rapport');
  await generatePdf(page);

  info('✅ Eindoordeel: GOEDGEKEURD voor 5 jaar');
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runScenario(meta, run).catch(err => { console.error(err); process.exit(1); });
}
```

- [ ] **Step 2: Syntax + run**

`node --check scripts/scenarios/4-tankstation.mjs` → exit 0
`npm run demo` → 4 → Enter
**Maurice verifieert:** 5-jaarlijks UI verschijnt met OBAS-24 + §6/§7/§8. PDF heeft 8 foto's + GOEDGEKEURD eindoordeel.

- [ ] **Step 3: Commit**

```bash
git add scripts/scenarios/4-tankstation.mjs
git commit -m "feat(demo): add scenario 4 — Esso A50 (5-jaarlijks/GOEDGEKEURD)

5-jaarlijkse keuring met volledige OBAS-24, §6 inwendig, §7
lekdichtheidstest (hydrologisch 60min waterverlies 2mm) en §8 coating.
8 groene OK-foto's, GOEDGEKEURD voor 5 jaar."
```

---

## Task 9: scripts/scenarios/5-agrarisch.mjs — Scenario 5 (Loonwerker Veldhuis, 5-jaarlijks, AFGEKEURD)

**Files:**
- Create: `scripts/scenarios/5-agrarisch.mjs`

- [ ] **Step 1: Schrijf scenario 5**

```js
import {
  section, step, info, pause,
  seedDatabase, selectKlant, selectVoorziening, setInterval,
  fillSection1, fillMeting, fillResultGroup, fillLekdichtheid, fillCoating,
  injectFoto, setEindoordeel, generatePdf, runScenario
} from './_shared.mjs';
import { svgPhoto } from './_photos.mjs';

export const meta = {
  id: 5,
  label: 'Loonwerker Veldhuis — 5-jaarlijks — AFGEKEURD',
  klant: {
    id: 'loonwerker-veldhuis',
    bedrijfsnaam: 'Loonwerker Veldhuis V.O.F.',
    adres: 'Buurserveldweg 14',
    postcode_plaats: '7481 PC Haaksbergen',
    contactpersoon: 'G. Veldhuis',
    telefoon: '053-555 567'
  },
  voorziening: {
    id: 'obas-ns6-machinewasplaats',
    naam: 'OBAS NS-6 machinewasplaats',
    merk: 'Aquafix',
    type_bouwjaar: 'AF-6K / 2010',
    ns_klasse: 'II',
    capaciteit_l: 6000,
    mat_opbouw: 'kunststof',
    inlaat_mm: 160,
    uitlaat_mm: 160
  }
};

// OBAS-24 grotendeels OK, behalve coalescentiefilter + naden
const OBAS24_2_DEFECT = Object.fromEntries(
  ['afdekkingen', 'opbouw_obas', 'vlotterbal', 'vlotterbalschotel', 'grofvuilrooster',
   'inlaat_obas', 'uitlaat_obas', 'niveau_obas', 'capaciteit_obas',
   'opbouw_slibvangput', 'inlaat_slibvangput', 'uitlaat_slibvangput',
   'niveau_slibvangput', 'inhoud_slibvangput', 'controleput', 'niveau_controleput',
   'lozing', 'effluent_visueel', 'alarm_olielaagdikte',
   'alarm_hoogwater', 'recycleput', 'accumat', 'afvoerkanaal_gereinigd'
  ].map(k => [k, { resultaat: 'voldoet', opmerking: '' }])
);
OBAS24_2_DEFECT.coalescentiefilter = { resultaat: 'voldoet_niet', opmerking: 'Filter ernstig vervuild — vervangen vereist' };

export async function run(page) {
  section(`Scenario 5: ${meta.label}`, '🚜');

  step(1, 'Seed klant + voorziening', 'Loonwerker — oudere OBAS uit 2010, 5-jaarlijkse keuring');
  await seedDatabase(page, meta.klant, meta.voorziening);

  step(2, 'Selecteer klant + voorziening', '');
  await selectKlant(page, meta.klant.bedrijfsnaam);
  await selectVoorziening(page, meta.voorziening.naam);

  step(3, 'Interval = 5-jaarlijks', '');
  await setInterval(page, '5jaarlijks');

  step(4, 'Sectie 1', '');
  await fillSection1(page, {
    datum: new Date().toISOString().slice(0, 10),
    inspecteur: 'M. de Vries',
    uitvoerend_bureau: 'Symitech B.V.',
    weersomstandigheden: 'Bewolkt, 11°C'
  });

  step(5, 'Olielaag 45mm — onder grens, geen lediging-aanleiding',
       'Probleem zit in lekdichtheid + coating, niet in olielaag');
  await fillMeting(page, { olielaag: 45, slib: 60 });

  step(6, 'OBAS-24 — 2 punten afgekeurd (coalescentie + naden)', '');
  const checklist = { ...OBAS24_2_DEFECT };
  // naden hoort niet in checklist_obas, dat is in inwendig — laat coalescentie als defect staan
  await fillResultGroup(page, 'checklist_obas', checklist);

  step(7, 'Sectie 6 inwendig — coalescentie vuil + naden lek',
       'Belangrijkste defecten zichtbaar bij inwendige controle');
  await fillResultGroup(page, 'inwendig', {
    wanden_bodem:          { resultaat: 'voldoet', opmerking: '' },
    schotten_vlotterkoker: { resultaat: 'voldoet', opmerking: '' },
    coalescentiefilter:    { resultaat: 'voldoet_niet', opmerking: 'Filter ernstig vervuild', actie: 'vervangen' },
    afsluiter_mechanisch:  { resultaat: 'voldoet', opmerking: '' },
    naden_aansluitingen:   { resultaat: 'voldoet_niet', opmerking: 'Lichte lekkage bij tussenwand-naad' }
  });

  step(8, 'Sectie 7 lekdichtheidstest — FAALT',
       'Waterverlies 35mm in 60min (max 5mm) — duidelijk lek');
  await fillLekdichtheid(page, {
    testmethode: 'Hydrologisch',
    testduur_min: 60,
    beginniveau_mm: 1500,
    eindniveau_mm: 1465,
    gemeten_verlies_mm: 35,
    toegestaan_mm_uur: 5,
    resultaat: 'voldoet_niet',
    opmerking: 'Waterverlies 35mm — ver boven norm. Lekkage waarschijnlijk bij tussenwand-naad.'
  });

  step(9, 'Sectie 8 coating — scheuren tussenwand', '');
  await fillCoating(page, {
    aanwezig: 'ja',
    type: 'PU 1-component',
    leeftijd_jaar: 16,
    restlevensduur_jaar: 0,
    visuele_staat: 'scheuren in coating tussenwand, beginnende blaarvorming bij naden',
    resultaat: 'voldoet_niet'
  });

  step(10, 'Foto-set: overzicht + 5x defect',
        '6 foto\'s — 1 overzicht (blauw) + 5x rood defect-bewijs');
  await injectFoto(page, 'overzicht', svgPhoto({
    label: 'OBAS NS-6', sublabel: 'machinewasplaats Veldhuis', status: 'neutraal'
  }));
  await injectFoto(page, 'inwendig_coalescentie', svgPhoto({
    label: 'COALESCENTIE', sublabel: 'ernstig vervuild', status: 'defect'
  }));
  await injectFoto(page, 'inwendig_naden', svgPhoto({
    label: 'NADEN', sublabel: 'lekkage tussenwand', status: 'defect'
  }));
  await injectFoto(page, 'lekdichtheid', svgPhoto({
    label: 'WATERVERLIES 35mm', sublabel: 'norm: max 5mm/uur', status: 'defect'
  }));
  await injectFoto(page, 'coating', svgPhoto({
    label: 'COATINGSCHEUR', sublabel: 'tussenwand', status: 'defect'
  }));
  await injectFoto(page, 'coating', svgPhoto({
    label: 'BLAARVORMING', sublabel: 'beginnend bij naden', status: 'defect'
  }));

  step(11, 'Eindoordeel = AFGEKEURD',
        'Herstel coating + lekdichtheidsherstel + nieuwe coalescentie. Herinspectie 8 weken.');
  const herinspectie = new Date();
  herinspectie.setDate(herinspectie.getDate() + 56);
  await setEindoordeel(page, 'afgekeurd',
    '5-jaarlijkse keuring AFGEKEURD. Lekdichtheidstest faalt (waterverlies 35mm/60min). Coalescentiefilter ernstig vervuild — vervanging vereist. Coating vertoont scheuren en blaarvorming tussenwand. Herstelwerkzaamheden uitvoeren, daarna herinspectie binnen 8 weken.',
    herinspectie.toISOString().slice(0, 10));

  step(12, 'PDF genereren', '5-jaarlijks afkeur-rapport');
  await generatePdf(page);

  info('❌ Eindoordeel: AFGEKEURD');
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runScenario(meta, run).catch(err => { console.error(err); process.exit(1); });
}
```

- [ ] **Step 2: Syntax + run**

`node --check scripts/scenarios/5-agrarisch.mjs` → exit 0
`npm run demo` → 5 → Enter
**Maurice verifieert:** lekdichtheid faalt, coating defect, 6 foto's (1 blauw + 5 rood), PDF AFGEKEURD.

- [ ] **Step 3: Commit**

```bash
git add scripts/scenarios/5-agrarisch.mjs
git commit -m "feat(demo): add scenario 5 — Loonwerker Veldhuis (5-jaarlijks/AFGEKEURD)

5-jaarlijks scenario waar olielaag OK maar lekdichtheidstest faalt
(waterverlies 35mm/60min) + coating scheuren + coalescentie vuil.
6 foto's met rode defect-bewijzen, AFGEKEURD met herinspectie 8 weken."
```

---

## Task 10: scripts/scenarios/6-hercontrole.mjs — Scenario 6 (Berken hercontrole, jaarlijks, GOEDGEKEURD)

**Files:**
- Create: `scripts/scenarios/6-hercontrole.mjs`

- [ ] **Step 1: Schrijf scenario 6**

```js
import {
  section, step, info, pause,
  seedDatabase, selectKlant, selectVoorziening, setInterval,
  fillSection1, fillMeting, fillResultGroup, fillLediging,
  injectFoto, setEindoordeel, generatePdf, runScenario
} from './_shared.mjs';
import { svgPhoto } from './_photos.mjs';

// Hercontrole van scenario 3 — zelfde klant + voorziening
export const meta = {
  id: 6,
  label: 'Berken HERCONTROLE — jaarlijks — GOEDGEKEURD',
  klant: {
    id: 'metaalbewerking-berken',
    bedrijfsnaam: 'Metaalbewerking Berken B.V.',
    adres: 'Berkenlaan 8',
    postcode_plaats: '7202 BL Zutphen',
    contactpersoon: 'J. Berken',
    telefoon: '0575-555 901'
  },
  voorziening: {
    id: 'obas-ns10-productiehal',
    naam: 'OBAS NS-10 productiehal-buiten',
    merk: 'Wavin',
    type_bouwjaar: 'OliePass 10 / 2012',
    ns_klasse: 'II',
    capaciteit_l: 10000,
    mat_opbouw: 'beton',
    inlaat_mm: 200,
    uitlaat_mm: 200
  }
};

export async function run(page) {
  section(`Scenario 6: ${meta.label}`, '🔁');

  step(1, 'Seed dezelfde klant + voorziening als scenario 3',
       'Hercontrole na afkeuring 4 weken geleden — klant heeft inmiddels gelediget');
  await seedDatabase(page, meta.klant, meta.voorziening);

  step(2, 'Selecteer klant + voorziening', '');
  await selectKlant(page, meta.klant.bedrijfsnaam);
  await selectVoorziening(page, meta.voorziening.naam);

  step(3, 'Interval = jaarlijks (hercontrole-flag in opmerkingen)', '');
  await setInterval(page, 'jaarlijks');

  step(4, 'Sectie 1 — vermelding hercontrole in weersomstandigheden', '');
  await fillSection1(page, {
    datum: new Date().toISOString().slice(0, 10),
    inspecteur: 'M. de Vries',
    uitvoerend_bureau: 'Symitech B.V.',
    weersomstandigheden: 'HERCONTROLE na afkeur 2026-04-15. Droog, 12°C.'
  });

  step(5, 'Olielaag 28mm — fors gedaald na lediging',
       'Adviesblok GROEN — installatie functioneert weer correct');
  await fillMeting(page, { olielaag: 28, slib: 8 });
  info('Adviesblok: groen "binnen grens"');

  step(6, 'Functietesten — opnieuw uitgevoerd', '');
  await fillResultGroup(page, 'functietesten', {
    auto_afsluiter:  { resultaat: 'voldoet', opmerking: '' },
    alarm_olielaag:  { resultaat: 'voldoet', opmerking: 'Alarm gereset, werkt correct' },
    alarm_hoogwater: { resultaat: 'voldoet', opmerking: '' }
  });

  step(7, 'Lediging-blok — referentie naar uitgevoerde lediging',
       'Bewijs van afvoer + BAL-referentie uit scenario 3');
  await fillLediging(page, {
    lediging: { obas: 'ja', slibvang: 'ja' },
    bal: {
      verwerker: 'TankRein B.V.',
      afvoerbon: 'BAL-2026-0345',
      euralcode: '13.05.06',
      hoeveelheid_l: 9500
    }
  });

  step(8, 'Foto overzicht + meting "NA LEDIGING" + afvoerbon',
        '3 foto\'s: overzicht (blauw) + groene meting + afvoerbon (blauw)');
  await injectFoto(page, 'overzicht', svgPhoto({
    label: 'OBAS NS-10', sublabel: 'hercontrole Berken', status: 'neutraal'
  }));
  await injectFoto(page, 'metingen', svgPhoto({
    label: 'OLIELAAG 28mm', sublabel: 'NA LEDIGING — OK', status: 'ok'
  }));
  await injectFoto(page, 'afvalstroomformulier', svgPhoto({
    label: 'AFVOERBON', sublabel: 'BAL-2026-0345 TankRein', status: 'neutraal'
  }));

  step(9, 'Eindoordeel = GOEDGEKEURD — afkeuring opgeheven',
       'Volgende reguliere inspectie over 1 jaar');
  const volgende = new Date();
  volgende.setFullYear(volgende.getFullYear() + 1);
  await setEindoordeel(page, 'goedgekeurd',
    'HERCONTROLE na afkeuring 2026-04-15. Lediging uitgevoerd door TankRein B.V. (BAL-2026-0345, 9.500 L). Olielaag nu 28 mm — ruim onder grens. Afkeuring opgeheven. Volgende reguliere inspectie 2027.',
    volgende.toISOString().slice(0, 10));

  step(10, 'PDF genereren', 'Hercontrole-rapport met opheffing van afkeuring');
  await generatePdf(page);

  info('✅ Eindoordeel: GOEDGEKEURD (afkeuring opgeheven)');
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runScenario(meta, run).catch(err => { console.error(err); process.exit(1); });
}
```

- [ ] **Step 2: Syntax + run**

`node --check scripts/scenarios/6-hercontrole.mjs` → exit 0
`npm run demo` → 6 → Enter
**Maurice verifieert:** zelfde klant als scenario 3, nu olielaag 28mm (na lediging) → GROEN, PDF "GOEDGEKEURD".

- [ ] **Step 3: Commit**

```bash
git add scripts/scenarios/6-hercontrole.mjs
git commit -m "feat(demo): add scenario 6 — Berken hercontrole (jaarlijks/GOEDGEKEURD)

Hercontrole na afkeuring uit scenario 3. Zelfde klant + voorziening,
olielaag nu 28mm na lediging (BAL-2026-0345), afkeuring opgeheven."
```

---

## Task 11: End-to-end verificatie + STATUS.md

**Files:**
- Modify: `STATUS.md`

- [ ] **Step 1: Draai "Alle 6 achter elkaar"**

Run: `npm run demo` → kies A → Enter
**Maurice verifieert:**
- Alle 6 scenarios draaien sequentieel
- Tussen scenarios: `═══ Scenario X van 6 ═══` scheiding zichtbaar
- localStorage wordt tussen scenarios gewist
- Browser blijft 1 instance, geen restart
- Na laatste: 15s pause, dan browser close, terug naar menu
- "q" sluit het menu

- [ ] **Step 2: Test regressie van bestaande feature-tour**

Run: `npm run demo:tour`
Expected: oude live-demo.mjs draait zoals voorheen — 7 features achter elkaar, geen errors.

- [ ] **Step 3: Update STATUS.md**

Open `STATUS.md` en voeg bovenaan toe (na de v3.3-sectie):

```markdown
## v3.4 — Praktijkscenarios (2026-05-18)

Toegevoegd: 6 realistische praktijkscenarios als Playwright live-demo, selecteerbaar via terminal-menu.

**Wijzigingen:**
- `npm run demo` = interactief scenario-menu (nieuw)
- `npm run demo:tour` = oude feature-tour (rename)
- 6 scenario-files in `scripts/scenarios/`
- Gedeelde helpers in `_shared.mjs` (seed/fill/inject/PDF)
- SVG-photo-generator in `_photos.mjs` (4 status-kleuren)

**Scenarios:**
1. Garage van Dijk — halfjaarlijks — GOEDGEKEURD
2. Trans-Vechtdal — jaarlijks — opmerking
3. Metaalbewerking Berken — jaarlijks — AFGEKEURD
4. Esso A50 — 5-jaarlijks — GOEDGEKEURD (OBAS-24)
5. Loonwerker Veldhuis — 5-jaarlijks — AFGEKEURD (lekdicht+coating)
6. Berken hercontrole — jaarlijks — GOEDGEKEURD (opheffing afkeur)

**Spec:** `docs/superpowers/specs/2026-05-18-praktijkscenarios-design.md`
**Plan:** `docs/superpowers/plans/2026-05-18-praktijkscenarios-implementation.md`
```

- [ ] **Step 4: Commit + push**

```bash
git add STATUS.md
git commit -m "docs: STATUS.md v3.4 — praktijkscenarios afgerond"
git push origin main
```

- [ ] **Step 5: Eindverificatie**

Run: `git log --oneline -15`
Expected: laatste ±11 commits zijn de Task 1-11 commits, in volgorde.

Run: `npm test`
Expected: bestaande 277 tests groen (geen regressie).

---

## Definition of Done

- [ ] `npm run demo` toont menu met 6 scenarios + A
- [ ] Elke scenario draait standalone én via menu
- [ ] "Alle 6 achter elkaar" werkt en sluit netjes
- [ ] `npm run demo:tour` werkt nog (regressietest live-demo)
- [ ] STATUS.md heeft v3.4-sectie
- [ ] Bestaande 277 vitest-tests blijven groen
- [ ] Alle 11 commits gepusht naar `main`

---

## Niet in scope

- PDF-validatie / OCR
- Test-assertions
- Video/GIF-recording
- i18n menu
- Binary foto-assets
- Tool-wijzigingen
