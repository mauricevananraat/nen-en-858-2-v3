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
