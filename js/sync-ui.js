import { loadDb, exportDb, saveDb, importDb } from './database.js';
import { showToast } from './toast.js';
import { openImportModeModal } from './import-mode-modal.js';

// Pure logica voor export: lees db, genereer JSON + filename met datum
export function exportToFile() {
  const db = loadDb();
  const json = exportDb(db);
  const datum = new Date().toISOString().slice(0, 10);
  const filename = `nen858-klanten-${datum}.json`;
  return { json, filename };
}

// Import-helper: parse JSON, roept importDb aan, persist met saveDb.
// Returns { success: boolean, error?: string, db?: Db } voor UI feedback.
export function importFromText(jsonText, mode) {
  let newDb;
  try {
    newDb = importDb(loadDb(), jsonText, mode);
  } catch (e) {
    return { success: false, error: e.message };
  }
  try {
    saveDb(newDb);
  } catch (e) {
    return { success: false, error: e.message };
  }
  return { success: true, db: newDb };
}

// Bind de twee action-bar knoppen aan de export/import flow.
// Idempotent via body-dataset marker zodat herhaalde init geen dubbele listeners geeft.
export function bindSyncButtons() {
  const exportBtn = document.getElementById('btn-export-db');
  const importBtn = document.getElementById('btn-import-db');
  if (!exportBtn || !importBtn) return;
  if (document.body.dataset.syncButtonsBound === '1') return;
  document.body.dataset.syncButtonsBound = '1';

  exportBtn.addEventListener('click', () => {
    const { json, filename } = exportToFile();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  let importing = false;
  importBtn.addEventListener('click', () => {
    if (importing) return;
    importing = true;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    // Reset lock wanneer file picker wordt gesloten zonder selectie.
    // Chrome/Edge firen geen 'cancel' event maar wel window-focus retour;
    // korte setTimeout geeft 'change' kans om eerst te firen bij wel-selectie.
    // Aanvullend: visibilitychange voor Samsung file-picker die geen focus-event firet.
    const tryReset = () => {
      setTimeout(() => {
        if (!input.files || !input.files.length) importing = false;
      }, 300);
    };
    const resetOnFocus = () => {
      window.removeEventListener('focus', resetOnFocus);
      tryReset();
    };
    const resetOnVisibility = () => {
      if (!document.hidden) {
        document.removeEventListener('visibilitychange', resetOnVisibility);
        tryReset();
      }
    };
    window.addEventListener('focus', resetOnFocus);
    document.addEventListener('visibilitychange', resetOnVisibility);

    input.onchange = async (e) => {
      window.removeEventListener('focus', resetOnFocus);
      document.removeEventListener('visibilitychange', resetOnVisibility);
      try {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        let importedDb;
        try {
          importedDb = JSON.parse(text);
        } catch (e) {
          showToast('Ongeldig JSON-bestand: ' + e.message, 'error');
          return;
        }
        // Structuur-validatie: alleen database-exports doorlaten
        if (!importedDb.versie || !Array.isArray(importedDb.klanten)) {
          showToast('Dit bestand is geen geldige database-export. Gebruik "Concept laden" als dit een conceptbestand is.', 'error');
          return;
        }
        const currentDb = loadDb();
        const mode = await openImportModeModal(currentDb, importedDb);
        if (!mode) return; // gebruiker annuleerde
        const result = importFromText(text, mode);
        if (!result.success) {
          showToast('Importeren mislukt: ' + result.error, 'error');
          return;
        }
        showToast(`Database geïmporteerd (mode: ${mode}). Pagina wordt vernieuwd.`, 'success');
        setTimeout(() => location.reload(), 1500);
      } finally {
        importing = false;
      }
    };
    input.click();
  });
}
