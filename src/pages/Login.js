import { h } from '../utils/dom.js';
import { store } from '../store.js';
import { router } from '../app.js';

export default function Login({ query }) {
  const el = h('section.page', {}, [
    h('span.eyebrow', {}, 'Login required'),
    h('h1', {}, 'Sign in to continue'),
    h('p.lead', {}, 'This is a stand-in form — clicking "Log in" just sets a fake user in the store, the same as the navbar button.'),
    h('button.btn.btn-primary', {
      onclick: () => {
        store.setState({ user: { name: 'Ada' } });
        router.replace(query.redirect || '/');
      },
    }, 'Log in as Ada'),
  ]);
  return { el };
}
