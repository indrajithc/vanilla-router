import { h } from '../utils/dom.js';

export default function Home() {
  const el = h('section.page', {}, [
    h('span.eyebrow', {}, 'Vanilla JS · No framework'),
    h('h1', {}, 'A router that behaves like one'),
    h('p.lead', {}, [
      'This app is a single ',
      h('code', {}, 'index.html'),
      ', a hand-rolled client-side router, and a handful of lazy-loaded page modules — no React, no build step required.',
    ]),
    h('div.grid', {}, [
      h('div.card', {}, [h('h3', {}, 'Real navigation'), h('p', {}, 'Uses the History API, so back/forward, refresh, and deep links all work correctly.')]),
      h('div.card', {}, [h('h3', {}, 'Code-splitting'), h('p', {}, 'Each page is its own ES module, loaded on demand with dynamic import().')]),
      h('div.card', {}, [h('h3', {}, 'Guards'), h('p', {}, 'Visit Dashboard while logged out — the router redirects you to Login.')]),
    ]),
  ]);

  return { el };
}
