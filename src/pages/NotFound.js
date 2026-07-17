import { h } from '../utils/dom.js';

export default function NotFound() {
  const el = h('section.page', {}, [
    h('span.eyebrow', {}, '404'),
    h('h1', {}, 'Nothing matched that route'),
    h('p.lead', {}, 'Check the URL, or head back to a page that exists.'),
    h('a.btn.btn-primary', { href: '/' }, 'Back home'),
  ]);
  return { el };
}
