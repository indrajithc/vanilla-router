import { store } from '/assets/store.js';

function goTo(path) {
  if (window.spaNavigate) window.spaNavigate(path);
  else location.href = path;
}

export function mount(root) {
  const { user } = store.getState();
  if (!user) {
    goTo('/login/?redirect=' + encodeURIComponent('/dashboard/'));
    return;
  }
  root.querySelector('[data-greeting]').textContent = `Welcome back, ${user.name}`;
}

if (!window.__SPA__) mount(document.getElementById('view'));
