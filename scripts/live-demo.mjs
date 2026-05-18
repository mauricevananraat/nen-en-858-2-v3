/**
 * Live demo van de NEN-EN 858-2 v3-tool met Playwright in een zichtbaar
 * Chrome-venster. Toont alle belangrijke v3-features met uitleg in de terminal
 * + slow-motion zodat je elke actie kunt volgen.
 *
 * Run met:  npm run demo
 *
 * Een zichtbaar Chromium-venster opent (mobile viewport — Samsung S24 grootte).
 * In je terminal verschijnt per stap WAT er gebeurt en WAAROM (gekoppeld aan
 * de v3-features die we hebben gebouwd).
 *
 * De demo eindigt automatisch na ~5 min, of druk Ctrl+C om eerder te stoppen.
 */

import { chromium } from 'playwright';

const URL = 'https://mauricevananraat.github.io/nen-en-858-2-v3/NEN-EN-858-2%20controle%20formulier.html';

// 1x1 testfoto als base64 (geen netwerk-call nodig)
const TEST_FOTO_DATAURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAACAAIDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8H8=';

// ─── Helpers ────────────────────────────────────────────────────────────────

function section(title, emoji = '─') {
  console.log('\n' + '═'.repeat(70));
  console.log(`${emoji}  ${title}`);
  console.log('═'.repeat(70));
}

function step(num, what, why) {
  console.log(`\n  [${num}]  ${what}`);
  console.log(`        Waarom: ${why}`);
}

function info(msg) {
  console.log(`        → ${msg}`);
}

async function highlight(page, selector) {
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

async function pause(page, ms = 1500) {
  await page.waitForTimeout(ms);
}

// ─── Main demo flow ─────────────────────────────────────────────────────────

(async () => {
  section('Setup', '🚀');
  console.log('Browser opent in zichtbaar venster met Samsung S24-viewport.');
  console.log('Slow-motion 700ms zodat elke actie volgbaar is.');
  console.log('Knop die op punt staat aangeklikt te worden krijgt oranje highlight.');

  const browser = await chromium.launch({
    headless: false,         // ← zichtbaar venster
    slowMo: 700,             // ← elke actie vertraagd
    args: ['--start-maximized']
  });
  const ctx = await browser.newContext({
    viewport: { width: 412, height: 915 },  // Samsung S24 vertical
    isMobile: true,
    deviceScaleFactor: 3,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'
  });
  const page = await ctx.newPage();

  // Console-logs uit de pagina worden zichtbaar gemaakt in onze terminal
  page.on('console', (msg) => {
    if (msg.type() === 'error') info(`[browser-error] ${msg.text()}`);
  });

  step(1, 'Tool laden op live URL',
    'Dit is wat jij op je Samsung S24 ziet in Chrome — exacte URL ' + URL);
  await page.goto(URL);
  await pause(page, 2500);

  step(2, 'localStorage opschonen voor schone demo-start',
    'Geen oude klanten/voorzieningen uit eerdere sessies');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await pause(page, 2000);

  // ───────────────────────────────────────────────────────────────────────────
  section('Feature 1: Toast i.p.v. alert-popup', '🍞');

  step(3, 'Trigger een import-fout via "Importeer database" met ongeldig bestand',
    'In v2 kreeg je een blokkerende alert-popup. In v3 verschijnt een ' +
    'vriendelijke toast rechtsboven, niet-blokkerend.');

  await highlight(page, '#btn-import-db');
  await page.evaluate(() => {
    const orig = document.createElement.bind(document);
    document.createElement = function (tag) {
      const el = orig(tag);
      if (tag.toLowerCase() === 'input') {
        const origClick = el.click.bind(el);
        el.click = () => {
          if (el.type === 'file') {
            const blob = new Blob(['{niet een geldige database'], { type: 'application/json' });
            const file = new File([blob], 'kapot.json', { type: 'application/json' });
            const dt = new DataTransfer();
            dt.items.add(file);
            el.files = dt.files;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          } else origClick();
        };
      }
      return el;
    };
  });
  await page.click('#btn-import-db');
  await pause(page, 2500);
  info('Toast verschijnt: "Ongeldig JSON-bestand: ..."');
  await pause(page, 2500);

  // ───────────────────────────────────────────────────────────────────────────
  section('Feature 2: Klantenbeheer — éénmalig invoeren', '👤');

  step(4, 'Klik "+" naast Klant',
    'Modal opent voor nieuwe klant — éénmalig invoeren, daarna herbruikbaar ' +
    'in alle volgende inspecties');
  await highlight(page, '[data-action="klant-new"]');
  await page.click('[data-action="klant-new"]');
  await pause(page, 1500);

  step(5, 'Bedrijfsnaam + adres invullen',
    'In v2 moest je dit elke inspectie opnieuw doen; v3 onthoudt dit lokaal');
  await page.fill('#klant-modal input[name="bedrijfsnaam"]', 'Demo Klant BV');
  await page.fill('#klant-modal input[name="adres"]', 'Demostraat 1');
  await page.fill('#klant-modal input[name="postcode_plaats"]', '1234 DD Demoland');
  await pause(page, 1500);

  step(6, 'Opslaan',
    'Modal sluit, klant verschijnt in dropdown en is meteen geselecteerd. ' +
    'Edit + Delete knoppen worden actief.');
  await page.click('#klant-modal-save');
  await pause(page, 2000);

  step(7, 'Toon dat klant in dropdown staat',
    'Dropdown bevat nu "Demo Klant BV" en kan in volgende inspecties weer ' +
    'gekozen worden zonder opnieuw te typen');
  await highlight(page, '[data-picker="klant"]');
  await pause(page, 1500);

  // ───────────────────────────────────────────────────────────────────────────
  section('Feature 3: Voorzieningenbeheer per klant', '⚙️');

  step(8, 'Klik "+" naast Voorziening',
    'Modal toont een badge "Klant: Demo Klant BV" — zo zie je dat de ' +
    'voorziening aan deze klant wordt gekoppeld');
  await highlight(page, '[data-action="voorziening-new"]');
  await page.click('[data-action="voorziening-new"]');
  await pause(page, 1500);

  step(9, 'Vul installatie-specs in',
    'NS-klasse + capaciteit + materiaal — deze gegevens hoeven ook nooit meer opnieuw');
  await page.fill('#voorziening-modal input[name="naam"]', 'OBAS Demo-01');
  await page.fill('#voorziening-modal input[name="merk"]', 'TestMerk');
  await page.fill('#voorziening-modal input[name="capaciteit_l"]', '5000');
  await page.evaluate(() => {
    const r = document.querySelector('#voorziening-modal input[name="ns_klasse"][value="II"]');
    if (r) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  await pause(page, 1500);

  step(10, 'Opslaan',
    'Voorziening verschijnt in dropdown, installatie-specs worden automatisch ' +
    'in sectie 1 van het formulier gezet');
  await page.click('#voorziening-modal-save');
  await pause(page, 2000);

  // ───────────────────────────────────────────────────────────────────────────
  section('Feature 4: Custom import-mode-modal', '📥');

  step(11, 'Exporteer database (om iets te kunnen importeren)',
    'Genereert een JSON-bestand met onze huidige klant + voorziening');
  await highlight(page, '#btn-export-db');
  // We pakken de JSON-content op via spy zodat we het kunnen hergebruiken
  const exportedJson = await page.evaluate(async () => {
    const { exportDb, loadDb } = await import('./js/database.js?v=' + Date.now());
    return exportDb(loadDb());
  });
  info(`Geëxporteerde JSON ${exportedJson.length} bytes — bevat 1 klant + 1 voorziening`);
  await pause(page, 1500);

  step(12, 'Importeer dezelfde JSON — mode-modal verschijnt',
    'In v2 was dit een verwarrende "OK = vervangen, Annuleren = samenvoegen" ' +
    'confirm-popup. In v3 zie je 2 cards met previews van wat er gebeurt.');
  await page.evaluate((json) => {
    const orig = document.createElement.bind(document);
    document.createElement = function (tag) {
      const el = orig(tag);
      if (tag.toLowerCase() === 'input') {
        const origClick = el.click.bind(el);
        el.click = () => {
          if (el.type === 'file') {
            const blob = new Blob([json], { type: 'application/json' });
            const file = new File([blob], 'demo-db.json', { type: 'application/json' });
            const dt = new DataTransfer();
            dt.items.add(file);
            el.files = dt.files;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          } else origClick();
        };
      }
      return el;
    };
  }, exportedJson);
  await page.click('#btn-import-db');
  await pause(page, 2000);
  info('Modal toont: 2 cards (Vervangen oranje, Samenvoegen groen) + preview');
  await pause(page, 2000);

  step(13, 'Demonstreer: ESC sluit de modal én reset de lock',
    'Bug C1 uit code-audit — vroeger bleef de "Importeer"-knop dood na ESC. ' +
    'Nu wordt de Promise correct ge-resolved met null en lock gereset.');
  await page.keyboard.press('Escape');
  await pause(page, 1500);
  info('Modal gesloten; importknop is direct opnieuw klikbaar');
  await pause(page, 1500);

  step(14, 'Open opnieuw — kies "Samenvoegen" en bevestig',
    'Toon dat lock écht gereset is + mode-modal complete flow');
  await page.click('#btn-import-db');
  await pause(page, 2000);
  await highlight(page, '[data-mode-card="samenvoegen"]');
  await page.click('[data-mode-card="samenvoegen"]');
  await pause(page, 1200);
  await highlight(page, '[data-action="mode-confirm"]');
  await page.click('[data-action="mode-confirm"]');
  await pause(page, 2500);
  info('Toast: "Database geïmporteerd (mode: samenvoegen). Pagina wordt vernieuwd."');
  await pause(page, 2000);

  // ───────────────────────────────────────────────────────────────────────────
  section('Feature 5: Formulier-invoer + auto-berekening', '📐');

  step(15, 'Vul sectie 1 — projectgegevens',
    'Inspecteur, datum, weersomstandigheden — standaard formulier-velden');
  await page.evaluate(() => {
    const fields = {
      'inspectie.datum': '2026-05-18',
      'inspectie.inspecteur': 'Maurice van Anraat',
      'inspectie.uitvoerend_bureau': 'Symitech B.V.',
      'inspectie.weersomstandigheden': 'Demo — zonnig'
    };
    for (const [name, val] of Object.entries(fields)) {
      const el = document.querySelector(`[data-field="${name}"]`);
      if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
    }
  });
  await pause(page, 1500);

  step(16, 'Vul sectie 2 metingen — olielaag 90mm bij max 100mm = 90%',
    'Auto-pct berekening + advies-blok verschijnt automatisch boven de 80% ' +
    'NEN-EN 858-2 grenswaarde');
  await page.evaluate(() => {
    document.querySelectorAll('[data-meting-type="olielaag"]').forEach((el, i) => {
      const v = i === 0 ? '90' : '100';
      el.value = v;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });
  await pause(page, 1500);
  info('Pct verschijnt: 90%. Advies-blok: "⚠️ Lediging vereist — meting overschrijdt grenswaarde"');
  // Scroll naar het advies-blok zodat het zichtbaar is
  await page.evaluate(() => {
    const advies = document.querySelector('[data-advies="shown"]');
    if (advies) advies.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  await pause(page, 2500);

  // ───────────────────────────────────────────────────────────────────────────
  section('Feature 6: Interval-switch + OBAS-24 checklist', '🔄');

  step(17, 'Switch naar 5-jaarlijks',
    'Toont automatisch: 24-punts visuele checklist + extra secties 6/7/8 ' +
    '(inwendige controle / lekdichtheidstest / coating)');
  await page.evaluate(() => {
    const r = document.querySelector('input[name="interval"][value="5jaarlijks"]');
    r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  await pause(page, 2000);
  info('Bovenaan: 5-jaarlijks geselecteerd');
  info('In het formulier: CHECKLIST INSPECTIE OBAS + 24 items zichtbaar');
  await pause(page, 3000);

  // ───────────────────────────────────────────────────────────────────────────
  section('Feature 7: PDF-spinner + generatie', '📄');

  step(18, 'Voeg 1 testfoto toe aan slot "overzicht" voor PDF',
    'Snel via direct injectie (geen file-picker nodig voor demo)');
  await page.evaluate((url) => {
    if (!window.__inspectie.fotos.overzicht) window.__inspectie.fotos.overzicht = [];
    window.__inspectie.fotos.overzicht.push({ dataurl: url, bijschrift: 'Demo-foto' });
  }, TEST_FOTO_DATAURL);
  await pause(page, 1000);

  step(19, 'Klik "Genereer PDF rapport" — spinner verschijnt',
    'In v2 wist je niet of de knop werkte. In v3 zie je een full-screen ' +
    'overlay-spinner ("Bezig met genereren van PDF...") tot de download start.');
  // Scroll naar action-bar
  await page.evaluate(() => {
    const btn = document.getElementById('btn-pdf');
    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  await pause(page, 1500);
  await highlight(page, '#btn-pdf');

  // Confirm-dialog (foto-ontbreking-check) accepteren
  page.once('dialog', async (d) => { await d.accept(); });

  // Click triggert PDF + spinner
  await page.click('#btn-pdf');
  info('Spinner overlay verschijnt direct (semi-transparante backdrop + draaiende cirkel)');
  await pause(page, 1500);
  info('PDF wordt gegenereerd... callback verbergt spinner zodra download start');
  await pause(page, 4000);

  // ───────────────────────────────────────────────────────────────────────────
  section('Demo afronden', '✅');
  console.log('Alle 7 belangrijkste v3-features getoond:');
  console.log('  1. Toast i.p.v. alert');
  console.log('  2. Klantenbeheer');
  console.log('  3. Voorzieningenbeheer');
  console.log('  4. Custom import-mode-modal (incl. ESC-fix C1)');
  console.log('  5. Formulier + auto-pct met grenswaarde-trigger');
  console.log('  6. Interval-switch + OBAS-24 checklist');
  console.log('  7. PDF-spinner + downloadflow');
  console.log('\nBrowser blijft 15 seconden open voor laatste inspectie — daarna sluit hij automatisch.');
  console.log('(of druk Ctrl+C om eerder te stoppen)');
  await pause(page, 15000);

  await browser.close();
  console.log('\nDemo klaar. Tot ziens.');
})().catch((err) => {
  console.error('\nDemo gefaald:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});
