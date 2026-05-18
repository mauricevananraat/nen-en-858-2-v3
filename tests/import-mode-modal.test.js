import { describe, it, expect, beforeEach } from 'vitest';
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
    expect(text).toMatch(/2/);
    expect(text).toMatch(/1/);
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
