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
