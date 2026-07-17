import { store } from '/assets/store.js';

function goTo(path) {
  // works with or without router.js: SPA nav if present, hard nav if not
  if (window.spaNavigate) window.spaNavigate(path);
  else location.href = path;
}

export function mount(root) {
  const params = new URLSearchParams(location.search);
  root.querySelector('[data-login]').addEventListener('click', () => {
    store.setState({ user: { name: 'Ada' } });
    goTo(params.get('redirect') || '/');
  });
}

if (!window.__SPA__) mount(document.getElementById('view'));
