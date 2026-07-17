import { h } from '../utils/dom.js';
import { store } from '../store.js';

export default function Dashboard() {
  const { user } = store.getState();
  const el = h('section.page', {}, [
    h('span.eyebrow', {}, 'Protected route'),
    h('h1', {}, `Welcome back, ${user?.name ?? 'friend'}`),
    h('p.lead', {}, 'This route has a beforeEnter guard. Log out using the navbar, then reload this URL directly — you\u2019ll be bounced to /login and returned here after signing back in.'),
    h('div.card', {}, h('p', {}, 'Nothing to see here yet — just a gated page.')),
  ]);
  return { el };
}
