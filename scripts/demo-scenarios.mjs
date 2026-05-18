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
