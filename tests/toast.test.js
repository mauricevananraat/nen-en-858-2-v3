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
