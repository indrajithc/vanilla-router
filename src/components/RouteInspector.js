import { h } from '../utils/dom.js';

// A small persistent devtools-style panel that shows exactly what the
// router resolved for the current URL — path, params, query, guard result.
// Doubles as a teaching aid: you can *see* the router working.
export function RouteInspector(router) {
  const pathEl = h('span.insp-value', {}, '/');
  const paramsEl = h('span.insp-value', {}, '{}');
  const queryEl = h('span.insp-value', {}, '{}');
  const timeEl = h('span.insp-value', {}, '0ms');

  router.afterEach((to) => {
    const start = performance.now();
    pathEl.textContent = to.path;
    paramsEl.textContent = JSON.stringify(to.params);
    queryEl.textContent = JSON.stringify(to.query);
    requestAnimationFrame(() => {
      timeEl.textContent = `${(performance.now() - start).toFixed(1)}ms`;
    });
  });

  const el = h('details.inspector', { open: false }, [
    h('summary', {}, 'Route inspector'),
    h('div.insp-grid', {}, [
      h('span.insp-key', {}, 'path'), pathEl,
      h('span.insp-key', {}, 'params'), paramsEl,
      h('span.insp-key', {}, 'query'), queryEl,
      h('span.insp-key', {}, 'render'), timeEl,
    ]),
  ]);

  return { el };
}
