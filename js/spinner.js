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
