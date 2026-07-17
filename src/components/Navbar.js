import { h } from '../utils/dom.js';
import { store } from '../store.js';

export function Navbar(router) {
  const links = [
    ['/', 'Home'],
    ['/about', 'About'],
    ['/users/1', 'User #1'],
    ['/dashboard', 'Dashboard'],
  ];

  const linkEls = links.map(([path, label]) =>
    h('a', { href: path, class: 'nav-link' }, label)
  );

  const authBtn = h('button', { class: 'btn btn-ghost' }, '');
  const themeBtn = h('button', { class: 'btn btn-ghost', 'aria-label': 'Toggle theme' }, '');

  function syncAuth(state) {
    authBtn.textContent = state.user ? `Log out (${state.user.name})` : 'Log in';
  }
  function syncTheme(state) {
    themeBtn.textContent = state.theme === 'dark' ? '☀︎' : '☾';
  }

  authBtn.addEventListener('click', () => {
    const { user } = store.getState();
    store.setState({ user: user ? null : { name: 'Ada' } });
  });
  themeBtn.addEventListener('click', () => {
    store.setState((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' }));
  });

  const unsubscribe = store.subscribe((s) => { syncAuth(s); syncTheme(s); });
  syncAuth(store.getState());
  syncTheme(store.getState());

  function highlight(to) {
    linkEls.forEach((a, i) => {
      a.classList.toggle('is-active', links[i][0] === to.path);
    });
  }
  router.afterEach(highlight);

  const el = h('nav.navbar', {}, [
    h('a.brand', { href: '/' }, [h('span.brand-mark', {}, '◆'), ' vanilla-router']),
    h('div.nav-links', {}, linkEls),
    h('div.nav-actions', {}, [authBtn, themeBtn]),
  ]);

  return { el, unmount: unsubscribe };
}
