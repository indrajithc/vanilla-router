export function mount(root) {
  const clock = root.querySelector('[data-clock]');
  function tick() { clock.textContent = new Date().toLocaleTimeString(); }
  tick();
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // unmount: called by router before next page mounts
}

if (!window.__SPA__) mount(document.getElementById('view'));
