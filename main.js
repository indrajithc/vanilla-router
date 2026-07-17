// Home has no interactive elements — mount is a no-op, kept for the
// folder's file contract (index.html / main.json / main.js).
export function mount() {}

if (!window.__SPA__) mount(document.getElementById('view'));
