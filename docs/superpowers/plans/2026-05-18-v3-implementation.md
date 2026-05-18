# v3 — UX-polish + PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bouw v3 als nieuwe versie naast v2: drie UX-verbeteringen (toast, import-mode-modal, PDF-spinner) gevolgd door een PWA-laag (offline werken + installeerbaar als app).

**Architecture:** v2-content wordt 1:1 gekopieerd als baseline (255 tests groen + 1 skipped). Fase v3.1 voegt 3 nieuwe JS-modules toe en vervangt `alert()`/`confirm()`-calls. Fase v3.2 voegt service worker + manifest + iconen toe, en cachet pdfMake lokaal zodat offline-PDF werkt.

**Tech Stack:** Vanilla JS ES modules, vitest + jsdom, Cache API + Service Worker, Sharp (npm) voor icoon-generatie, gh-CLI voor GitHub repo.

**Spec:** `docs/superpowers/specs/2026-05-18-v3-ux-polish-pwa-design.md` (commit `6461082`)
**v2-baseline:** commit `4f1d948` op https://github.com/mauricevananraat/nen-en-858-2, 255 tests + 1 skipped

---

## Variabelen

| Placeholder | Waarde | Wanneer bekend |
|-------------|--------|----------------|
| `<V2_PATH>` | `C:/Users/Maurice van Anraat/Documents/.claudeV2/projects/symitech/NEN_EN858_2-v2` | nu |
| `<V3_PATH>` | `C:/Users/Maurice van Anraat/Documents/.claudeV2/projects/symitech/NEN_EN858_2-v3` | nu |
| `<V3_REPO>` | `mauricevananraat/nen-en-858-2-v3` | Task 4 |
| `<V3_URL>` | `https://mauricevananraat.github.io/nen-en-858-2-v3/` | Task 5 |

---

## File Structure

### Nieuw
| Pad | Verantwoordelijkheid |
|-----|----------------------|
| `js/toast.js` | `showToast(msg, type)` — non-blocking notificaties |
| `js/import-mode-modal.js` | `openImportModeModal(currentDb, importedDb)` → `Promise<mode\|null>` |
| `js/spinner.js` | `showSpinner(msg)` + `hideSpinner()` — overlay tijdens PDF |
| `tests/toast.test.js` | Unit-tests voor toast |
| `tests/import-mode-modal.test.js` | Unit-tests voor mode-modal |
| `tests/spinner.test.js` | Unit-tests voor spinner |
| `manifest.json` | PWA-manifest (root) |
| `sw.js` | Service worker (root) |
| `icons/icon-192.png` | App-icoon klein |
| `icons/icon-512.png` | App-icoon groot |
| `vendor/pdfmake/pdfmake.min.js` | pdfMake lokaal voor offline |
| `vendor/pdfmake/vfs_fonts.js` | pdfMake fonts lokaal |
| `scripts/gen-icons.js` | Genereert iconen uit symitech_logo.png |

### Gewijzigd
| Pad | Wijziging |
|-----|-----------|
| `package.json` | name → v3, version 0.3.0, sharp als dev-dependency |
| `Start formulier.bat` | poort 8767 |
| `NEN-EN-858-2 controle formulier.html` | manifest-link, lokale pdfMake-paden |
| `index.html` | manifest-link |
| `js/main.js` | imports toast/spinner, vervang 1 alert door toast, SW-registratie, btn-pdf met spinner |
| `js/sync-ui.js` | vervang 3 alerts door toasts, vervang confirm door openImportModeModal |
| `js/klant-modal.js` | vervang alert door toast |
| `js/voorziening-modal.js` | vervang alert door toast |
| `css/styles.css` | toast/modal/spinner stijlen |
| `README.md` | v3-specifiek, install op startscherm |
| `STATUS.md` | v3-fases bijhouden |

---

## Task 1: v2-content kopiëren als v3-baseline

**Files:** alle v2-bronnen behalve `docs/`, `.git/`, `node_modules/`, `PROMPTS.md`

- [ ] **Step 1.1: Kopieer v2-content (Windows xcopy via Bash)**

```bash
cd "C:/Users/Maurice van Anraat/Documents/.claudeV2/projects/symitech/NEN_EN858_2-v3" && \
for item in "Start formulier.bat" "NEN-EN-858-2 controle formulier.html" "index.html" \
            "package.json" "package-lock.json" "vitest.config.js" "symitech_logo.png" \
            "js" "css" "tests" "assets" "STATUS.md" "README.md"; do
  cp -r "../NEN_EN858_2-v2/$item" "./" 2>&1 | head -3
done
ls -la
```

Expected: alle bestanden zichtbaar in v3-root behalve `docs/` (die houdt onze nieuwe v3-spec en bestaande plans) en `node_modules/`.

- [ ] **Step 1.2: Verifieer dat docs/ niet overschreven is**

```bash
ls docs/superpowers/specs/
```

Expected: alleen `2026-05-18-v3-ux-polish-pwa-design.md`. Géén v2-specs.

- [ ] **Step 1.3: Commit**

```bash
git add Start*.bat NEN-EN*.html index.html package*.json vitest.config.js symitech_logo.png js/ css/ tests/ assets/ STATUS.md README.md
git commit -m "$(cat <<'EOF'
chore(v3): kopieer v2-content als baseline

Volledige v2-content (js, css, tests, html, assets) gekopieerd
als startpunt voor v3. v2-docs niet meegenomen — v3 begint met
eigen docs (alleen v3-spec). Volgende tasks: v3-identificatie
(package.json, poort), GitHub repo, dan fase v3.1.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: v3-identificatie (package.json + Start.bat)

**Files:**
- Modify: `package.json`
- Modify: `Start formulier.bat`

- [ ] **Step 2.1: Update package.json**

Lees de huidige inhoud van `package.json` en wijzig de top-keys:

```json
{
  "name": "nen-en-858-2-controle-formulier-v3",
  "version": "0.3.0",
  "description": "Inspectietool NEN-EN 858-2 v3 — UX-polish + PWA",
  ...
}
```

Alle overige keys (scripts, devDependencies, etc.) ongewijzigd laten.

- [ ] **Step 2.2: Update Start formulier.bat**

Vind in `Start formulier.bat` de regel `py -m http.server 8766` (of `8765` als v2-bat per ongeluk de oude waarde had). Vervang door:

```bat
py -m http.server 8767
```

En de URL in het start-comment naar `http://localhost:8767/NEN-EN-858-2%20controle%20formulier.html`.

- [ ] **Step 2.3: Verifieer tests blijven groen**

```bash
cd "C:/Users/Maurice van Anraat/Documents/.claudeV2/projects/symitech/NEN_EN858_2-v3" && npm install 2>&1 | tail -3 && npm test 2>&1 | tail -5
```

Expected: 255 passed | 1 skipped.

- [ ] **Step 2.4: Commit**

```bash
git add package.json package-lock.json "Start formulier.bat"
git commit -m "$(cat <<'EOF'
chore(v3): bump naar v3 — name, version, dev-poort

package.json: name → nen-en-858-2-controle-formulier-v3,
version → 0.3.0. Start.bat: poort 8766 → 8767 (v1=8765, v2=8766).
Baseline-tests 255 + 1 skipped onveranderd.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: GitHub repo aanmaken + initial push

**Files:** geen lokale wijzigingen.

- [ ] **Step 3.1: Repo aanmaken via gh-CLI**

```bash
cd "C:/Users/Maurice van Anraat/Documents/.claudeV2/projects/symitech/NEN_EN858_2-v3" && \
gh repo create mauricevananraat/nen-en-858-2-v3 --public --description "v3 Inspectietool NEN-EN 858-2 (UX-polish + PWA) — Symitech B.V."
```

Expected: output bevat `https://github.com/mauricevananraat/nen-en-858-2-v3`.

- [ ] **Step 3.2: Remote toevoegen + push**

```bash
git remote add origin https://github.com/mauricevananraat/nen-en-858-2-v3.git
git remote -v
git push -u origin main
git log --oneline -3
```

Expected: 3 commits zichtbaar (spec-commit + Task 1 + Task 2), branch tracked.

---

## Task 4: GitHub Pages activeren

**Files:** geen lokale wijzigingen.

- [ ] **Step 4.1: Pages activeren via API**

```bash
gh api --method POST repos/mauricevananraat/nen-en-858-2-v3/pages -f "source[branch]=main" -f "source[path]=/"
```

Expected response: JSON met `"status":"queued"` of `"building"`, `"html_url":"https://mauricevananraat.github.io/nen-en-858-2-v3/"`.

- [ ] **Step 4.2: Wacht tot Pages built is**

```bash
gh api repos/mauricevananraat/nen-en-858-2-v3/pages/builds/latest -q '{status, commit}'
```

Poll max 3× met 30 sec pauze tot `status: built` (gebruik `Bash` tool met `run_in_background` voor poll-loop indien nodig).

- [ ] **Step 4.3: Verifieer URL HTTP 200**

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" "https://mauricevananraat.github.io/nen-en-858-2-v3/"
```

Expected: `HTTP 200`.

---

## Task 5: Toast-module — failing tests

**Files:**
- Create: `tests/toast.test.js`

- [ ] **Step 5.1: Schrijf de test-file**

```js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { showToast, _resetToastsForTests } from '../js/toast.js';

describe('showToast', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    _resetToastsForTests();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('toont een toast met message en type', () => {
    showToast('Test message', 'success');
    const toasts = document.querySelectorAll('.toast');
    expect(toasts).toHaveLength(1);
    expect(toasts[0].classList.contains('toast--success')).toBe(true);
    expect(toasts[0].textContent).toContain('Test message');
  });

  it('ondersteunt types success / error / info', () => {
    showToast('s', 'success');
    showToast('e', 'error');
    showToast('i', 'info');
    expect(document.querySelector('.toast--success')).toBeTruthy();
    expect(document.querySelector('.toast--error')).toBeTruthy();
    expect(document.querySelector('.toast--info')).toBeTruthy();
  });

  it('verdwijnt automatisch na 4 seconden', () => {
    showToast('msg', 'info');
    expect(document.querySelectorAll('.toast')).toHaveLength(1);
    vi.advanceTimersByTime(4500);
    expect(document.querySelectorAll('.toast')).toHaveLength(0);
  });

  it('kan handmatig gesloten worden via X-knop', () => {
    showToast('msg', 'info');
    const closeBtn = document.querySelector('.toast__close');
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    expect(document.querySelectorAll('.toast')).toHaveLength(0);
  });

  it('toont maximaal 3 toasts tegelijk', () => {
    showToast('1', 'info');
    showToast('2', 'info');
    showToast('3', 'info');
    showToast('4', 'info');
    expect(document.querySelectorAll('.toast')).toHaveLength(3);
  });
});
```

- [ ] **Step 5.2: Run tests — verify FAIL**

```bash
npm test -- tests/toast.test.js 2>&1 | tail -10
```

Expected: module not found error.

---

## Task 6: Toast-module — implementatie

**Files:**
- Create: `js/toast.js`

- [ ] **Step 6.1: Schrijf de module**

```js
const MAX_VISIBLE = 3;
const AUTO_HIDE_MS = 4000;

let containerEl = null;
function getContainer() {
  if (containerEl && document.body.contains(containerEl)) return containerEl;
  containerEl = document.createElement('div');
  containerEl.className = 'toast-container';
  document.body.appendChild(containerEl);
  return containerEl;
}

export function showToast(message, type = 'info') {
  const container = getContainer();

  while (container.children.length >= MAX_VISIBLE) {
    container.removeChild(container.firstElementChild);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');

  const messageSpan = document.createElement('span');
  messageSpan.className = 'toast__message';
  messageSpan.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast__close';
  closeBtn.setAttribute('aria-label', 'Sluiten');
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => removeToast(toast));

  toast.appendChild(messageSpan);
  toast.appendChild(closeBtn);
  container.appendChild(toast);

  setTimeout(() => removeToast(toast), AUTO_HIDE_MS);
}

function removeToast(toast) {
  if (toast.parentNode) {
    toast.parentNode.removeChild(toast);
  }
}

export function _resetToastsForTests() {
  if (containerEl && containerEl.parentNode) {
    containerEl.parentNode.removeChild(containerEl);
  }
  containerEl = null;
}
```

- [ ] **Step 6.2: Run tests — verify PASS**

```bash
npm test 2>&1 | tail -5
```

Expected: 260 passed | 1 skipped (255 + 5 new).

- [ ] **Step 6.3: Commit**

```bash
git add js/toast.js tests/toast.test.js
git commit -m "$(cat <<'EOF'
feat(toast): non-blocking notification module

Eén export showToast(msg, type) met types success/error/info.
Auto-hide na 4 sec, manueel sluiten via X-knop, max 3 zichtbaar.
Singleton container in document.body. Vervangt alert() in fase 5
en 6 van v2.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Toast CSS

**Files:**
- Modify: `css/styles.css` (append nieuwe regels onderaan)

- [ ] **Step 7.1: Append toast-stijlen**

Open `css/styles.css` en voeg **onderaan** toe:

```css
/* ============================================================
   Toast notifications
   ============================================================ */
.toast-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: calc(100vw - 32px);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: #fff;
  border-left: 4px solid #888;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  min-width: 280px;
  max-width: 420px;
  pointer-events: auto;
  animation: toast-in 0.18s ease-out;
}

.toast--success { border-left-color: #2e7d32; background: #f1f8e9; }
.toast--error   { border-left-color: #c62828; background: #ffebee; }
.toast--info    { border-left-color: #005EB8; background: #e3f2fd; }

.toast__message {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
  color: #222;
}

.toast__close {
  background: transparent;
  border: 0;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  color: #555;
  padding: 0 4px;
}

.toast__close:hover { color: #000; }

@keyframes toast-in {
  from { transform: translateX(20px); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}

@media (max-width: 600px) {
  .toast-container {
    top: 8px;
    right: 8px;
    left: 8px;
    max-width: none;
  }
  .toast {
    min-width: 0;
    max-width: none;
  }
}
```

- [ ] **Step 7.2: Run tests om regressie te voorkomen**

```bash
npm test 2>&1 | tail -5
```

Expected: 260 passed | 1 skipped (geen CSS-tests dus geen verandering).

- [ ] **Step 7.3: Commit**

```bash
git add css/styles.css
git commit -m "$(cat <<'EOF'
style(toast): voeg toast-styling toe (rechtsboven desktop, top mobiel)

Kleuren per type: groen (success), rood (error), Symitech blauw (info).
Slide-in animatie 180ms. Op mobiel uitgerekt over volledige breedte
met 8px gutters.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Vervang alerts door showToast in main.js

**Files:**
- Modify: `js/main.js`

- [ ] **Step 8.1: Voeg import toe bovenaan main.js**

In de import-sectie bovenaan `js/main.js`, voeg toe:

```js
import { showToast } from './toast.js';
```

- [ ] **Step 8.2: Vervang `alert(...)` calls in btn-load handler**

Vind in `js/main.js` de btn-load-handler. Er staat een `alert('Bestand kon niet geladen worden: ...')` call. Vervang door:

```js
showToast('Bestand kon niet geladen worden: ' + err.message, 'error');
```

- [ ] **Step 8.3: Run tests**

```bash
npm test 2>&1 | tail -5
```

Expected: 260 passed | 1 skipped.

- [ ] **Step 8.4: Commit**

```bash
git add js/main.js
git commit -m "$(cat <<'EOF'
refactor(main): vervang alert door showToast in btn-load handler

Concept-load-fouten verschijnen nu als non-blocking toast i.p.v.
modale alert-popup. Past beter bij mobiel gebruik.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Vervang alerts door showToast in sync-ui.js

**Files:**
- Modify: `js/sync-ui.js`

- [ ] **Step 9.1: Voeg import toe**

In de imports bovenaan `js/sync-ui.js`, voeg toe (parallel aan bestaande imports):

```js
import { showToast } from './toast.js';
```

- [ ] **Step 9.2: Vervang `alert(...)` calls in importBtn-handler**

Vind in de importBtn click-handler twee `alert(...)` calls:
- `alert('Importeren mislukt: ' + result.error)` — bij fout
- `alert(`Database geïmporteerd (mode: ${mode}). Pagina wordt vernieuwd.`)` — bij succes

Vervang door:

```js
// Bij fout:
showToast('Importeren mislukt: ' + result.error, 'error');
return;

// Bij succes:
showToast(`Database geïmporteerd (mode: ${mode}). Pagina wordt vernieuwd.`, 'success');
setTimeout(() => location.reload(), 1500);
```

NOTE: Vóór de toast-vervanging deed `location.reload()` direct. Nu geven we de toast 1.5 sec om gelezen te worden vóór de reload.

- [ ] **Step 9.3: Pas bestaande tests aan indien nodig**

In `tests/sync-ui.test.js` kunnen tests staan die `alert` mocken. Lees het file en update mocks naar `showToast`-spies waar relevant. Voorbeeld:

Voor de bindSyncButtons import-flow tests: als ze `window.alert` overrideten, moeten ze nu `showToast` spioneren. Maar omdat de showToast-call DOM-effect heeft (`.toast` element), kan een test dat element gewoon controleren.

Concreet: zoek naar `window.alert =` in `tests/sync-ui.test.js`. Indien aanwezig, vervang de assertie van "alert is called" door "een `.toast` element met klasse `.toast--error` of `.toast--success` bestaat in DOM".

- [ ] **Step 9.4: Run tests**

```bash
npm test 2>&1 | tail -5
```

Expected: 260 passed | 1 skipped.

- [ ] **Step 9.5: Commit**

```bash
git add js/sync-ui.js tests/sync-ui.test.js
git commit -m "$(cat <<'EOF'
refactor(sync-ui): vervang alerts door toasts in import-flow

Twee alert-calls (fout + succes) vervangen door showToast.
Bij succes: 1.5 sec wachten vóór reload zodat gebruiker de
melding kan lezen. Tests bijgewerkt waar alert werd gemockt.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Vervang alerts in klant-modal + voorziening-modal

**Files:**
- Modify: `js/klant-modal.js`
- Modify: `js/voorziening-modal.js`

- [ ] **Step 10.1: klant-modal.js**

Voeg import bovenaan toe: `import { showToast } from './toast.js';`

Vind in `handleSave` de regels:
```js
} catch (e) {
  alert(e.message);
  return;
}
```

En de regel:
```js
if (!data.bedrijfsnaam || !data.bedrijfsnaam.trim()) {
  alert('Bedrijfsnaam is verplicht');
  return;
}
```

Vervang door:
```js
} catch (e) {
  showToast(e.message, 'error');
  return;
}
```

En:
```js
if (!data.bedrijfsnaam || !data.bedrijfsnaam.trim()) {
  showToast('Bedrijfsnaam is verplicht', 'error');
  return;
}
```

- [ ] **Step 10.2: voorziening-modal.js**

Identieke wijziging:

Voeg import toe: `import { showToast } from './toast.js';`

Vervang in `handleSave`:
```js
if (!data.naam || !data.naam.trim()) {
  alert('Naam is verplicht');
  return;
}
```
naar:
```js
if (!data.naam || !data.naam.trim()) {
  showToast('Naam is verplicht', 'error');
  return;
}
```

En:
```js
} catch (e) {
  alert(e.message);
  return;
}
```
naar:
```js
} catch (e) {
  showToast(e.message, 'error');
  return;
}
```

- [ ] **Step 10.3: Update bestaande tests**

In `tests/klant-modal.test.js` en `tests/voorziening-modal.test.js`: zoek naar `window.alert =` overrides. Vervang assertie "alert called with X" door "een `.toast--error` met text X bestaat in DOM".

- [ ] **Step 10.4: Run tests**

```bash
npm test 2>&1 | tail -5
```

Expected: 260 passed | 1 skipped.

- [ ] **Step 10.5: Commit**

```bash
git add js/klant-modal.js js/voorziening-modal.js tests/klant-modal.test.js tests/voorziening-modal.test.js
git commit -m "$(cat <<'EOF'
refactor(modals): vervang alert door toast in validatie-fouten

klant-modal en voorziening-modal: validatie-fouten en
saveDb-quota-errors verschijnen nu als toast i.p.v. alert.
Past in de overkoepelende v3.1 UX-polish-richting.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: import-mode-modal — failing tests

**Files:**
- Create: `tests/import-mode-modal.test.js`

- [ ] **Step 11.1: Schrijf testfile**

```js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { openImportModeModal, _resetModeModalForTests } from '../js/import-mode-modal.js';

describe('openImportModeModal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    _resetModeModalForTests();
  });

  it('toont preview-info over huidige en imported db', () => {
    const currentDb = { klanten: [{ id: 'a' }], voorzieningen: [{ id: 'v1' }, { id: 'v2' }] };
    const importedDb = { klanten: [{ id: 'b' }, { id: 'c' }], voorzieningen: [] };
    openImportModeModal(currentDb, importedDb);
    const modal = document.getElementById('import-mode-modal');
    expect(modal).toBeTruthy();
    expect(modal.classList.contains('modal-open')).toBe(true);
    const text = modal.textContent;
    expect(text).toMatch(/2/); // imported klanten count
    expect(text).toMatch(/1/); // current klanten count
  });

  it('resolved met "vervang" wanneer vervangen-card + Importeer wordt geklikt', async () => {
    const promise = openImportModeModal(
      { klanten: [], voorzieningen: [] },
      { klanten: [], voorzieningen: [] }
    );
    document.querySelector('[data-mode-card="vervang"]').click();
    document.querySelector('[data-action="mode-confirm"]').click();
    const result = await promise;
    expect(result).toBe('vervang');
  });

  it('resolved met "samenvoegen" wanneer samenvoegen-card + Importeer wordt geklikt', async () => {
    const promise = openImportModeModal(
      { klanten: [], voorzieningen: [] },
      { klanten: [], voorzieningen: [] }
    );
    document.querySelector('[data-mode-card="samenvoegen"]').click();
    document.querySelector('[data-action="mode-confirm"]').click();
    const result = await promise;
    expect(result).toBe('samenvoegen');
  });

  it('resolved met null bij annuleren-klik', async () => {
    const promise = openImportModeModal(
      { klanten: [], voorzieningen: [] },
      { klanten: [], voorzieningen: [] }
    );
    document.querySelector('[data-action="mode-cancel"]').click();
    const result = await promise;
    expect(result).toBeNull();
  });

  it('Importeer-knop is initieel disabled tot een mode is gekozen', () => {
    openImportModeModal(
      { klanten: [], voorzieningen: [] },
      { klanten: [], voorzieningen: [] }
    );
    const confirmBtn = document.querySelector('[data-action="mode-confirm"]');
    expect(confirmBtn.disabled).toBe(true);
    document.querySelector('[data-mode-card="vervang"]').click();
    expect(confirmBtn.disabled).toBe(false);
  });
});
```

- [ ] **Step 11.2: Run tests — verify FAIL**

```bash
npm test -- tests/import-mode-modal.test.js 2>&1 | tail -10
```

Expected: module not found.

---

## Task 12: import-mode-modal — implementatie

**Files:**
- Create: `js/import-mode-modal.js`

- [ ] **Step 12.1: Schrijf de module**

```js
import { openModal, closeModal, bindModalClose } from './modal.js';

const MODAL_HTML = `
<div class="modal" id="import-mode-modal" aria-hidden="true">
  <div class="modal-backdrop"></div>
  <div class="modal-dialog modal-dialog--wide">
    <header class="modal-header">
      <h2 class="modal-title">Database importeren</h2>
      <button type="button" class="modal-close" data-action="mode-cancel" aria-label="Sluiten">×</button>
    </header>
    <div class="modal-body">
      <p class="mode-summary"></p>
      <div class="mode-cards">
        <button type="button" class="mode-card mode-card--vervang" data-mode-card="vervang">
          <div class="mode-card__title">Vervangen</div>
          <div class="mode-card__detail" data-detail="vervang"></div>
        </button>
        <button type="button" class="mode-card mode-card--samenvoegen" data-mode-card="samenvoegen">
          <div class="mode-card__title">Samenvoegen</div>
          <div class="mode-card__detail" data-detail="samenvoegen"></div>
        </button>
      </div>
    </div>
    <footer class="modal-footer">
      <button type="button" class="btn btn-secondary" data-action="mode-cancel">Annuleren</button>
      <button type="button" class="btn btn-primary" data-action="mode-confirm" disabled>Importeer</button>
    </footer>
  </div>
</div>
`;

let modalEl = null;
let currentResolve = null;
let selectedMode = null;

function ensureModal() {
  if (modalEl && document.body.contains(modalEl)) return modalEl;
  const div = document.createElement('div');
  div.innerHTML = MODAL_HTML.trim();
  modalEl = div.firstElementChild;
  document.body.appendChild(modalEl);
  bindModalClose(modalEl);

  modalEl.querySelectorAll('[data-mode-card]').forEach(card => {
    card.addEventListener('click', () => {
      modalEl.querySelectorAll('[data-mode-card]').forEach(c =>
        c.classList.remove('mode-card--selected'));
      card.classList.add('mode-card--selected');
      selectedMode = card.dataset.modeCard;
      modalEl.querySelector('[data-action="mode-confirm"]').disabled = false;
    });
  });

  modalEl.querySelectorAll('[data-action="mode-cancel"]').forEach(btn => {
    btn.addEventListener('click', () => finish(null));
  });

  modalEl.querySelector('[data-action="mode-confirm"]').addEventListener('click', () => {
    if (selectedMode) finish(selectedMode);
  });

  return modalEl;
}

function finish(result) {
  if (currentResolve) {
    const resolve = currentResolve;
    currentResolve = null;
    closeModal(modalEl);
    resolve(result);
  }
}

export function openImportModeModal(currentDb, importedDb) {
  ensureModal();
  selectedMode = null;
  modalEl.querySelectorAll('[data-mode-card]').forEach(c =>
    c.classList.remove('mode-card--selected'));
  modalEl.querySelector('[data-action="mode-confirm"]').disabled = true;

  const curK = currentDb.klanten?.length || 0;
  const curV = currentDb.voorzieningen?.length || 0;
  const impK = importedDb.klanten?.length || 0;
  const impV = importedDb.voorzieningen?.length || 0;

  modalEl.querySelector('.mode-summary').textContent =
    `Huidig: ${curK} klanten, ${curV} voorzieningen. Bestand: ${impK} klanten, ${impV} voorzieningen.`;
  modalEl.querySelector('[data-detail="vervang"]').textContent =
    `Huidige database wordt volledig vervangen door bestand. Resultaat: ${impK} klanten, ${impV} voorzieningen.`;
  modalEl.querySelector('[data-detail="samenvoegen"]').textContent =
    `Nieuwe items uit bestand worden toegevoegd, bestaande blijven behouden (ID-collisions: bestand verliest).`;

  openModal(modalEl);
  return new Promise(resolve => { currentResolve = resolve; });
}

export function _resetModeModalForTests() {
  if (modalEl && modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
  modalEl = null;
  currentResolve = null;
  selectedMode = null;
}
```

- [ ] **Step 12.2: Run tests — verify PASS**

```bash
npm test 2>&1 | tail -5
```

Expected: 265 passed | 1 skipped (260 + 5 new).

- [ ] **Step 12.3: CSS toevoegen voor mode-cards**

Append onderaan `css/styles.css`:

```css
/* ============================================================
   Import-mode modal (2 cards)
   ============================================================ */
.modal-dialog--wide { max-width: 720px; }

.mode-summary {
  color: #555;
  margin: 0 0 16px;
  font-size: 14px;
}

.mode-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.mode-card {
  display: block;
  text-align: left;
  padding: 16px;
  border: 2px solid transparent;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.mode-card:hover { background: #eee; }

.mode-card--vervang { border-color: #ff9800; background: #fff3e0; }
.mode-card--vervang:hover { background: #ffe0b2; }
.mode-card--samenvoegen { border-color: #4caf50; background: #e8f5e9; }
.mode-card--samenvoegen:hover { background: #c8e6c9; }

.mode-card--selected {
  border-width: 3px;
  box-shadow: 0 0 0 2px rgba(0, 94, 184, 0.18);
}

.mode-card__title { font-weight: 700; font-size: 16px; margin-bottom: 6px; }
.mode-card__detail { font-size: 13px; line-height: 1.4; color: #444; }

@media (max-width: 600px) {
  .mode-cards { grid-template-columns: 1fr; }
}
```

- [ ] **Step 12.4: Commit**

```bash
git add js/import-mode-modal.js tests/import-mode-modal.test.js css/styles.css
git commit -m "$(cat <<'EOF'
feat(import-modal): custom modal i.p.v. confirm voor import-mode

openImportModeModal(currentDb, importedDb) → Promise<mode|null>.
Toont 2 cards (Vervangen oranje, Samenvoegen groen) + preview
van klant/voorziening-aantallen. Importeer-knop disabled tot
keuze gemaakt is. Vervangt verwarrende OK/Annuleren-confirm
in sync-ui import-flow (Task 13 wire-up).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Wire import-mode-modal in sync-ui.js

**Files:**
- Modify: `js/sync-ui.js`

- [ ] **Step 13.1: Voeg import toe**

In de imports bovenaan, voeg toe:

```js
import { openImportModeModal } from './import-mode-modal.js';
```

- [ ] **Step 13.2: Vervang confirm() in importBtn-handler**

Vind in `bindSyncButtons` de regel met `confirm(...)` voor mode-keuze (rond regels 70-85). Vervang:

```js
const wilVervangen = confirm(
  'Database importeren:\n\n' +
  'Klik OK om de huidige database VOLLEDIG TE VERVANGEN met het bestand.\n\n' +
  'Klik Annuleren om de bestaande klanten te BEHOUDEN en alleen nieuwe items uit het bestand toe te voegen (samenvoegen).'
);
const mode = wilVervangen ? 'vervang' : 'samenvoegen';
const result = importFromText(text, mode);
```

Door:

```js
let importedDb;
try {
  importedDb = JSON.parse(text);
} catch (e) {
  showToast('Ongeldig JSON-bestand: ' + e.message, 'error');
  return;
}
const currentDb = loadDb();
const mode = await openImportModeModal(currentDb, importedDb);
if (!mode) return; // gebruiker annuleerde
const result = importFromText(text, mode);
```

NOTE: `loadDb` was al beschikbaar in de bestaande imports. Als niet: voeg toe aan import-regel.

- [ ] **Step 13.3: Run tests**

```bash
npm test 2>&1 | tail -5
```

Expected: 265 passed | 1 skipped. Mogelijk falen sync-ui tests die `confirm()` mockten — die moeten omgezet worden naar `openImportModeModal`-aanroepen via JS (zie de mode-modal tests als template).

- [ ] **Step 13.4: Fix gefaalde sync-ui tests**

In `tests/sync-ui.test.js`: zoek tests die `confirm` overrideten. Vervang door direct klikken op `.mode-card[data-mode-card="vervang"]` + confirm-knop, OF skip die specifieke tests (`it.skip`) en documenteer dat de import-mode-modal nu z'n eigen tests heeft.

- [ ] **Step 13.5: Run tests**

```bash
npm test 2>&1 | tail -5
```

Expected: alle groen.

- [ ] **Step 13.6: Commit**

```bash
git add js/sync-ui.js tests/sync-ui.test.js
git commit -m "$(cat <<'EOF'
refactor(sync-ui): gebruik openImportModeModal i.p.v. confirm

confirm-dialog vervangen door custom modal met 2 cards en
preview van aantal klanten/voorzieningen. Gebruiker krijgt
duidelijke keuze tussen vervangen (oranje) en samenvoegen
(groen). Sync-ui tests bijgewerkt voor nieuwe flow.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Spinner-module — failing tests + implementatie

**Files:**
- Create: `tests/spinner.test.js`
- Create: `js/spinner.js`

- [ ] **Step 14.1: Schrijf testfile**

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { showSpinner, hideSpinner, _resetSpinnerForTests } from '../js/spinner.js';

describe('spinner', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    _resetSpinnerForTests();
  });

  it('showSpinner mount een overlay met message', () => {
    showSpinner('Even geduld...');
    const overlay = document.querySelector('.spinner-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay.textContent).toContain('Even geduld...');
  });

  it('hideSpinner verwijdert de overlay', () => {
    showSpinner('msg');
    expect(document.querySelector('.spinner-overlay')).toBeTruthy();
    hideSpinner();
    expect(document.querySelector('.spinner-overlay')).toBeNull();
  });

  it('showSpinner opnieuw aanroepen update de message', () => {
    showSpinner('Stap 1');
    showSpinner('Stap 2');
    const overlays = document.querySelectorAll('.spinner-overlay');
    expect(overlays).toHaveLength(1);
    expect(overlays[0].textContent).toContain('Stap 2');
  });

  it('hideSpinner zonder show doet niets (geen error)', () => {
    expect(() => hideSpinner()).not.toThrow();
  });
});
```

- [ ] **Step 14.2: Schrijf de module**

```js
let overlayEl = null;

export function showSpinner(message = 'Even geduld...') {
  if (overlayEl && document.body.contains(overlayEl)) {
    overlayEl.querySelector('.spinner-message').textContent = message;
    return;
  }
  overlayEl = document.createElement('div');
  overlayEl.className = 'spinner-overlay';
  overlayEl.innerHTML = `
    <div class="spinner-content">
      <div class="spinner-circle" aria-hidden="true"></div>
      <div class="spinner-message">${escapeHtml(message)}</div>
    </div>
  `;
  document.body.appendChild(overlayEl);
}

export function hideSpinner() {
  if (overlayEl && overlayEl.parentNode) {
    overlayEl.parentNode.removeChild(overlayEl);
  }
  overlayEl = null;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

export function _resetSpinnerForTests() {
  if (overlayEl && overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
  overlayEl = null;
}
```

- [ ] **Step 14.3: CSS toevoegen**

Append onderaan `css/styles.css`:

```css
/* ============================================================
   Spinner overlay (PDF-genereren etc.)
   ============================================================ */
.spinner-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.spinner-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner-circle {
  width: 56px;
  height: 56px;
  border: 5px solid #cfd8dc;
  border-top-color: #005EB8;
  border-radius: 50%;
  animation: spinner-rotate 0.8s linear infinite;
}

.spinner-message {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 14.4: Run tests**

```bash
npm test 2>&1 | tail -5
```

Expected: 269 passed | 1 skipped (265 + 4 new).

- [ ] **Step 14.5: Commit**

```bash
git add js/spinner.js tests/spinner.test.js css/styles.css
git commit -m "$(cat <<'EOF'
feat(spinner): full-screen overlay-spinner

showSpinner(msg) + hideSpinner(). Semi-transparante backdrop met
geanimeerde cirkel + tekst. Idempotent: 2e showSpinner met andere
msg update i.p.v. dubbele overlay. Wire-up in btn-pdf in Task 15.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Wire spinner in btn-pdf handler

**Files:**
- Modify: `js/main.js`

- [ ] **Step 15.1: Voeg spinner-import toe**

In de imports bovenaan `js/main.js`, voeg toe:

```js
import { showSpinner, hideSpinner } from './spinner.js';
```

- [ ] **Step 15.2: Wrap btn-pdf click-handler**

Vind in `js/main.js` de btn-pdf click-handler. Het bevat een aanroep `pdfMake.createPdf(dd).download(naam);`. Vervang het volledige try-blok door:

```js
document.getElementById('btn-pdf').addEventListener('click', () => {
  const fotoSecties = ['installatie', 'metingen', 'controleput'];
  if (state.meta.interval === 'jaarlijks' || state.meta.interval === '5jaarlijks') {
    fotoSecties.push('inwendig_wanden', 'inwendig_schotten', 'inwendig_coalescentie',
                     'inwendig_afsluiter', 'inwendig_naden');
  }
  if (state.meta.interval === '5jaarlijks') {
    fotoSecties.push('lekdichtheid', 'coating');
  }
  const ontbrekend = fotoSecties.filter(k => !state.fotos[k]?.length);
  if (ontbrekend.length) {
    const ok = confirm(`Geen foto's bij: ${ontbrekend.join(', ')}.\n\nDoorgaan met PDF-rapport zonder deze foto's?`);
    if (!ok) return;
  }
  showSpinner('Bezig met genereren van PDF...');
  try {
    const dd = buildDocDefinition(state);
    const naam = `inspectie-${state.meta.projectnummer || 'rapport'}-${state.meta.rapportagedatum}.pdf`;
    pdfMake.createPdf(dd).download(naam, () => hideSpinner());
    // Safety-net: forceer hide na 10 sec voor het geval download-callback niet vuurt
    setTimeout(hideSpinner, 10000);
  } catch (e) {
    hideSpinner();
    showToast('PDF-generatie mislukt: ' + e.message, 'error');
  }
});
```

NOTE: De bestaande handler heeft mogelijk niet exact deze structuur. Pas aan op de gevonden code, maar behoud de `showSpinner`/`hideSpinner` en `showToast`-aanroepen.

- [ ] **Step 15.3: Run tests**

```bash
npm test 2>&1 | tail -5
```

Expected: 269 passed | 1 skipped.

- [ ] **Step 15.4: Commit**

```bash
git add js/main.js
git commit -m "$(cat <<'EOF'
feat(pdf): toon spinner-overlay tijdens PDF-generatie

showSpinner direct na klik, hideSpinner via pdfMake.download
callback (en safety-net setTimeout 10 sec). Geeft gebruiker
visuele feedback bij 3-8 sec wachten met meerdere foto's.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 16: Tussentijdse deploy + acceptance UX-polish

**Files:** geen lokale wijzigingen.

- [ ] **Step 16.1: Push naar GitHub**

```bash
cd "C:/Users/Maurice van Anraat/Documents/.claudeV2/projects/symitech/NEN_EN858_2-v3" && git push
```

- [ ] **Step 16.2: Wacht op Pages-build**

```bash
gh api repos/mauricevananraat/nen-en-858-2-v3/pages/builds/latest -q '{status, commit}'
```

Poll tot status `built`.

- [ ] **Step 16.3: Open in laptop-browser + handmatige spot-check**

```bash
cmd /c start chrome "https://mauricevananraat.github.io/nen-en-858-2-v3/"
```

Manueel checken:
- Toast verschijnt bij invalid concept-load
- Import-mode-modal verschijnt met 2 cards bij Importeer database
- Spinner verschijnt bij Genereer PDF
- Geen JS-errors in console

- [ ] **Step 16.4: Commit een marker**

Geen wijzigingen om te commiten — alleen verifieren.

Volgende: Fase v3.2 PWA.

---

## Task 17: pdfMake lokaal cachen voor offline

**Files:**
- Create: `vendor/pdfmake/pdfmake.min.js`
- Create: `vendor/pdfmake/vfs_fonts.js`
- Modify: `NEN-EN-858-2 controle formulier.html`

- [ ] **Step 17.1: Download pdfMake naar vendor**

```bash
mkdir -p "C:/Users/Maurice van Anraat/Documents/.claudeV2/projects/symitech/NEN_EN858_2-v3/vendor/pdfmake" && \
cd "C:/Users/Maurice van Anraat/Documents/.claudeV2/projects/symitech/NEN_EN858_2-v3/vendor/pdfmake" && \
curl -sL -o pdfmake.min.js "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js" && \
curl -sL -o vfs_fonts.js "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.js" && \
ls -la
```

Expected: beide bestanden aanwezig, samen ~1-2 MB.

NOTE: Versie 0.2.10 is een specifieke geldige release. Als die niet beschikbaar is, gebruik dan de laatste stabiele 0.2.x van https://cdnjs.com/libraries/pdfmake.

- [ ] **Step 17.2: Update HTML om naar lokale pdfMake te wijzen**

Vind in `NEN-EN-858-2 controle formulier.html` de twee `<script src="https://cdnjs..."` regels die pdfMake en vfs_fonts laden. Vervang door:

```html
<script src="vendor/pdfmake/pdfmake.min.js"></script>
<script src="vendor/pdfmake/vfs_fonts.js"></script>
```

- [ ] **Step 17.3: Verifieer dat PDF nog werkt**

```bash
npm test 2>&1 | tail -5
```

Expected: 269 passed | 1 skipped (geen tests raken externe scripts).

Voer **handmatige verificatie** uit door lokaal te openen:
```bash
cd "C:/Users/Maurice van Anraat/Documents/.claudeV2/projects/symitech/NEN_EN858_2-v3" && py -m http.server 8767 &
```
Open http://localhost:8767/NEN-EN-858-2%20controle%20formulier.html, klik Testdata-knop, klik Genereer PDF. Verwacht: PDF download zonder console-error.

Stop de http.server na verificatie met Ctrl+C of `kill` van het background-PID.

- [ ] **Step 17.4: Commit**

```bash
git add vendor/pdfmake "NEN-EN-858-2 controle formulier.html"
git commit -m "$(cat <<'EOF'
feat(pwa): cache pdfMake lokaal in vendor/

pdfmake.min.js + vfs_fonts.js (versie 0.2.10) gedownload van
cdnjs naar vendor/pdfmake/. HTML wijst nu naar lokale paden.
Vereist voor offline PDF-generatie via service worker (Task 21).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 18: Icoon-script + iconen genereren

**Files:**
- Create: `scripts/gen-icons.js`
- Create: `icons/icon-192.png`
- Create: `icons/icon-512.png`
- Modify: `package.json` (sharp als devDep + script)

- [ ] **Step 18.1: Installeer Sharp als dev-dep**

```bash
cd "C:/Users/Maurice van Anraat/Documents/.claudeV2/projects/symitech/NEN_EN858_2-v3" && npm install --save-dev sharp 2>&1 | tail -3
```

Expected: Sharp wordt toegevoegd aan devDependencies in package.json.

- [ ] **Step 18.2: Schrijf gen-icons script**

Maak `scripts/gen-icons.js`:

```js
import sharp from 'sharp';
import { mkdir } from 'fs/promises';

const SOURCE = 'symitech_logo.png';
const OUT_DIR = 'icons';
const SIZES = [192, 512];
const BG = { r: 255, g: 255, b: 255, alpha: 1 };

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const size of SIZES) {
    const padding = Math.round(size * 0.15);
    const inner = size - padding * 2;
    const logo = await sharp(SOURCE).resize(inner, inner, { fit: 'contain', background: BG }).toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: BG }
    })
      .composite([{ input: logo, gravity: 'center' }])
      .png()
      .toFile(`${OUT_DIR}/icon-${size}.png`);
    console.log(`Generated ${OUT_DIR}/icon-${size}.png`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 18.3: Voeg script toe aan package.json**

In `package.json`, voeg in de `scripts`-sectie toe:

```json
"gen-icons": "node scripts/gen-icons.js"
```

- [ ] **Step 18.4: Run script**

```bash
npm run gen-icons
```

Expected: 2 console.log-regels, twee PNG-bestanden aangemaakt in `icons/`.

- [ ] **Step 18.5: Verifieer iconen**

```bash
ls -la icons/
file icons/icon-192.png icons/icon-512.png 2>&1 || ls -l icons/
```

Expected: 2 PNG-bestanden zichtbaar.

- [ ] **Step 18.6: Commit**

```bash
git add package.json package-lock.json scripts/gen-icons.js icons/
git commit -m "$(cat <<'EOF'
feat(pwa): app-iconen 192/512 + Sharp-script

scripts/gen-icons.js genereert iconen uit symitech_logo.png met
15% padding op witte achtergrond. Sharp toegevoegd als devDep.
npm run gen-icons herhaalt de generatie indien logo wijzigt.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 19: manifest.json + linking

**Files:**
- Create: `manifest.json`
- Modify: `NEN-EN-858-2 controle formulier.html`
- Modify: `index.html`

- [ ] **Step 19.1: Maak manifest.json**

```json
{
  "name": "OBAS Inspectie — Symitech",
  "short_name": "OBAS",
  "description": "Inspectietool NEN-EN 858-2 voor olie/benzine afscheiders",
  "start_url": "./NEN-EN-858-2%20controle%20formulier.html",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#005EB8",
  "background_color": "#FFFFFF",
  "icons": [
    {
      "src": "icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 19.2: Link manifest in NEN-EN-858-2 controle formulier.html**

In de `<head>`-sectie, voeg toe (boven andere link-tags):

```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#005EB8">
```

- [ ] **Step 19.3: Link manifest in index.html**

Idem: voeg in de `<head>` van `index.html` toe:

```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#005EB8">
```

- [ ] **Step 19.4: Run tests**

```bash
npm test 2>&1 | tail -5
```

Expected: 269 passed | 1 skipped.

- [ ] **Step 19.5: Commit**

```bash
git add manifest.json "NEN-EN-858-2 controle formulier.html" index.html
git commit -m "$(cat <<'EOF'
feat(pwa): web app manifest + theme-color

manifest.json beschrijft naam, kleuren, iconen en display-mode
standalone. Beide HTML's linken naar manifest. Hierdoor biedt
Chrome Android "Add to Home screen" automatisch aan zodra ook
sw.js geregistreerd is (Task 20).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 20: Service worker

**Files:**
- Create: `sw.js`

- [ ] **Step 20.1: Schrijf sw.js**

```js
const CACHE_VERSION = 'v3.2.0';
const CACHE_NAME = `nen858-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './NEN-EN-858-2%20controle%20formulier.html',
  './manifest.json',
  './symitech_logo.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './css/styles.css',
  './js/main.js',
  './js/state.js',
  './js/database.js',
  './js/dropdown-binding.js',
  './js/form-render.js',
  './js/klant-modal.js',
  './js/voorziening-modal.js',
  './js/modal.js',
  './js/photos.js',
  './js/sync-ui.js',
  './js/pdf-builder.js',
  './js/test-data.js',
  './js/toast.js',
  './js/import-mode-modal.js',
  './js/spinner.js',
  './vendor/pdfmake/pdfmake.min.js',
  './vendor/pdfmake/vfs_fonts.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k.startsWith('nen858-') && k !== CACHE_NAME)
          .map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache nieuwe static-assets bij eerste fetch
        if (response.ok && new URL(event.request.url).origin === location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
```

- [ ] **Step 20.2: Geen tests**

Service workers werken niet in jsdom. Verificatie gebeurt manueel + via DevTools Application-tab.

- [ ] **Step 20.3: Commit**

```bash
git add sw.js
git commit -m "$(cat <<'EOF'
feat(pwa): service worker cache-first met version-bump

CACHE_VERSION = v3.2.0. Whitelist van alle statische assets +
vendor/pdfmake. Install cachet alles, activate verwijdert oude
caches, fetch serveert vanuit cache met netwerk-fallback en
opportunistic caching. Registratie volgt in Task 21.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 21: SW-registratie + update-toast in main.js

**Files:**
- Modify: `js/main.js`

- [ ] **Step 21.1: Voeg SW-registratie toe onderaan main.js**

Aan het einde van `js/main.js` (na alle bestaande event-handlers), voeg toe:

```js
// --- v3.2 Service worker registratie ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        if (!newSW) return;
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            showToast('Nieuwe versie beschikbaar — herlaad de pagina om te activeren.', 'info');
          }
        });
      });
    }).catch(err => {
      console.warn('[v3 PWA] Service worker registratie mislukt:', err);
    });
  });
}
```

- [ ] **Step 21.2: Run tests**

```bash
npm test 2>&1 | tail -5
```

Expected: 269 passed | 1 skipped. Service-worker-code geeft geen test-impact omdat `navigator.serviceWorker` ontbreekt in jsdom (de `if`-check vangt dat af).

- [ ] **Step 21.3: Commit**

```bash
git add js/main.js
git commit -m "$(cat <<'EOF'
feat(pwa): SW-registratie + update-toast

Registreert sw.js bij window.load. Bij nieuwe versie (na deploy):
toast "Nieuwe versie beschikbaar — herlaad" zodat gebruiker de
update kan activeren. Faalt stil in jsdom (navigator.serviceWorker
bestaat niet).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 22: README + STATUS bijwerken

**Files:**
- Modify: `README.md`
- Modify: `STATUS.md`

- [ ] **Step 22.1: Update README.md**

Vervang de volledige inhoud door:

```markdown
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

Verwacht: 269 tests groen + 1 skipped (v2-baseline 255 + 14 nieuwe v3.1-tests).

## Architectuur

- Vanilla JavaScript ES modules, geen framework
- Vitest + jsdom voor tests
- pdfMake (lokaal gecached) voor PDF-generatie
- Service Worker + Web App Manifest voor PWA

Volledige spec: `docs/superpowers/specs/2026-05-18-v3-ux-polish-pwa-design.md`.
```

- [ ] **Step 22.2: Update STATUS.md**

Vervang de volledige inhoud door:

```markdown
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
- 14 nieuwe tests (5 toast + 5 import-modal + 4 spinner)
- Alle `alert()`-calls vervangen door `showToast` (main, sync-ui, klant-modal, voorziening-modal)
- `confirm()` in import-flow vervangen door custom modal met 2 cards en preview
- Spinner overlay tijdens PDF-genereren
- Tests-status na fase 1: 269 groen + 1 skipped

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
```

- [ ] **Step 22.3: Commit**

```bash
git add README.md STATUS.md
git commit -m "$(cat <<'EOF'
docs(v3): README + STATUS — markeer v3 als afgerond

README publicatie-klaar met v3-specifieke info: hoe installeren
als app, update-instructies, privacy. STATUS overzicht van alle
3 fases. Verwijst naar v2 als stabiele fallback.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 23: Finale deploy + acceptance v3

**Files:** geen lokale wijzigingen.

- [ ] **Step 23.1: Push alles**

```bash
cd "C:/Users/Maurice van Anraat/Documents/.claudeV2/projects/symitech/NEN_EN858_2-v3" && git push
```

- [ ] **Step 23.2: Wacht op Pages-build**

```bash
gh api repos/mauricevananraat/nen-en-858-2-v3/pages/builds/latest -q '{status, commit}'
```

Poll tot `built`.

- [ ] **Step 23.3: Asset-check**

```bash
BASE="https://mauricevananraat.github.io/nen-en-858-2-v3"
for url in \
  "$BASE/" \
  "$BASE/manifest.json" \
  "$BASE/sw.js" \
  "$BASE/icons/icon-192.png" \
  "$BASE/icons/icon-512.png" \
  "$BASE/vendor/pdfmake/pdfmake.min.js" \
  "$BASE/vendor/pdfmake/vfs_fonts.js" \
  "$BASE/js/toast.js" \
  "$BASE/js/import-mode-modal.js" \
  "$BASE/js/spinner.js" \
; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  echo "$code  $url"
done
```

Expected: alle assets HTTP 200.

- [ ] **Step 23.4: Definition of Done check**

```bash
npm test 2>&1 | tail -5
git log --oneline | head -15
git status
```

Expected:
- 269 passed | 1 skipped
- 18+ v3-commits visible
- Working tree clean

- [ ] **Step 23.5: Maurice doet handmatige acceptance**

Op laptop én Samsung S24:
1. Open `https://mauricevananraat.github.io/nen-en-858-2-v3/`
2. Verifieer dat toast/modal/spinner werken (klein functioneel rondje)
3. **Offline-test:** in Chrome DevTools (laptop) of Airplane-mode (telefoon) → herlaad → tool blijft werken
4. **Install-test:** Chrome menu → "Toevoegen aan startscherm" → app verschijnt op startscherm → open vanaf icoon → tool start in standalone-modus

v3 is gedeployed en geaccepteerd ✓.

---

## Risico's en mitigaties

| Risico | Mitigatie |
|--------|-----------|
| Sharp installatie faalt op Windows door native binding | `npm install sharp@latest --include=optional` voorbereiding; fallback: gebruik Python PIL via `py scripts/gen-icons.py` (alternatief script schrijven) |
| pdfMake CDN-versie 0.2.10 niet beschikbaar | Bij faal: gebruik recentste 0.2.x van cdnjs (lookup via npm view) |
| Service worker cache te groot (>5 MB) op oudere telefoons | Whitelist alleen JS/CSS/HTML/iconen + vendor/pdfmake. Geen testdata, geen docs |
| Test-failures door alert→toast wijziging | Tests die `window.alert =` mockten moeten omgezet naar `.toast--error`-DOM-checks |
| SW cache-invalidation: gebruiker ziet oude versie | Manuele `CACHE_VERSION` bump verplicht voor elke release; update-toast informeert gebruiker |
| `pdfMake.download` callback firet niet altijd | `setTimeout(hideSpinner, 10000)` als safety-net |
| Iconen-resolutie te laag → Chrome accepteert niet | 192 + 512 = Chrome-minimumvereisten; bij faal Sharp-script aanpassen om scherpere upscale te doen |
| location.reload na toast-success komt te snel | 1.5 sec setTimeout geeft de toast 4 sec lees-tijd minus de reload-tijd |

---

## Niet in deze fase

- **Inline delete-bevestiging** (v3.3 als praktijk vraagt)
- **Emoji-prefix sync-knoppen** (v3.3)
- **Custom domain** (later)
- **Push-notificaties**
- **Background sync / cloud-sync**
- **Nieuwe inspectie-secties / datamodel-wijzigingen**
- **v2-migratie** (v2 blijft naast v3 bestaan, geen overgang verplicht)
