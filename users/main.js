function fakeFetchUser() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ name: 'Ada Lovelace', role: 'Mathematician' }), 400);
  });
}

export function mount(root) {
  let cancelled = false;
  const body = root.querySelector('[data-body]');

  fakeFetchUser().then((user) => {
    if (cancelled) return; // navigated away before the fetch resolved
    body.innerHTML = `<h3>${user.name}</h3><p>${user.role}</p>`;
  });

  return () => { cancelled = true; };
}

if (!window.__SPA__) mount(document.getElementById('view'));
