import { h } from '../utils/dom.js';

// Demonstrates lifecycle cleanup: this page runs a live timer while mounted,
// and the router calls unmount() on navigation-away so it doesn't leak.
export default function About() {
  const clock = h('div.clock', {}, '00:00:00');
  let intervalId = null;

  function tick() {
    clock.textContent = new Date().toLocaleTimeString();
  }

  const el = h('section.page', {}, [
    h('span.eyebrow', {}, 'About'),
    h('h1', {}, 'How the pieces fit together'),
    h('p.lead', {}, 'router.js matches the URL, imports the right page module, mounts it, and calls unmount() on the previous one — this clock proves that cleanup actually runs.'),
    h('div.card', {}, [h('h3', {}, 'Live since this page mounted'), clock]),
    h('ul.list', {}, [
      h('li', {}, [h('code', {}, 'router.push(path)'), ' — navigate programmatically']),
      h('li', {}, [h('code', {}, 'router.beforeEach(fn)'), ' — global navigation guard']),
      h('li', {}, [h('code', {}, 'route.beforeEnter'), ' — per-route guard, e.g. auth']),
      h('li', {}, [h('code', {}, 'view.unmount()'), ' — cleanup hook called on route change']),
    ]),
  ]);

  return {
    el,
    mount() { intervalId = setInterval(tick, 1000); tick(); },
    unmount() { clearInterval(intervalId); },
  };
}
