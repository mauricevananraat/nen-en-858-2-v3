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
