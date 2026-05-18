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
  // [data-picker="klant"] IS de <select> (zie js/dropdown-binding.js).
  // Wacht eerst tot het dropdown bevolkt is met deze klant — kan na seed+reload
  // even duren voor bindKlantDropdown is uitgevoerd.
  await page.waitForFunction((naam) => {
    const sel = document.querySelector('[data-picker="klant"]');
    if (!sel) return false;
    return Array.from(sel.options).some(o => o.textContent && o.textContent.includes(naam));
  }, bedrijfsnaam, { timeout: 8000 });

  await page.evaluate((naam) => {
    const select = document.querySelector('[data-picker="klant"]');
    const opt = Array.from(select.options).find(o => o.textContent.includes(naam));
    select.value = opt.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }, bedrijfsnaam);
  await pause(page, 1200);
}

export async function selectVoorziening(page, naam) {
  // Idem als klant — wacht tot voorziening in dropdown verschijnt
  // (refreshVoorzieningDropdown wordt getriggerd door klant-change-event).
  await page.waitForFunction((n) => {
    const sel = document.querySelector('[data-picker="voorziening"]');
    if (!sel) return false;
    return Array.from(sel.options).some(o => o.textContent && o.textContent.includes(n));
  }, naam, { timeout: 8000 });

  await page.evaluate((n) => {
    const select = document.querySelector('[data-picker="voorziening"]');
    const opt = Array.from(select.options).find(o => o.textContent.includes(n));
    select.value = opt.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }, naam);
  await pause(page, 1500);
}

// ─── Interval-switch ────────────────────────────────────────────────────────

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

export async function fillSection1(page, data) {
  await page.evaluate((fields) => {
    for (const [name, val] of Object.entries(fields)) {
      const el = document.querySelector(`[data-field="inspectie.${name}"]`);
      if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
    }
  }, data);
  await pause(page, 1000);
}

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

  page.once('dialog', async (d) => { await d.accept(); });

  await page.click('#btn-pdf');
  info('Spinner verschijnt — pdfMake bouwt rapport');
  await pause(page, 4500);
  info('PDF download gestart');
}

// ─── Scenario-runner-utility ─────────────────────────────────────────────────

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
