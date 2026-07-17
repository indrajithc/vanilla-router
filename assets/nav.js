/**
 * nav.js — hydrates the static #nav-slot markup present on every page.
 * Lives outside #view, so router.js never touches or reloads it across
 * SPA navigations; it just listens for the "spa:navigated" event to
 * re-highlight the active link.
 */
import { store } from '/assets/store.js';

const nav = document.getElementById('nav-slot');
if (nav) {
  const authBtn = nav.querySelector('[data-auth-btn]');
  const themeBtn = nav.querySelector('[data-theme-btn]');
  const links = [...nav.querySelectorAll('.nav-link')];

  function syncAuth(state) {
    authBtn.textContent = state.user ? `Log out (${state.user.name})` : 'Log in';
  }
  function syncTheme(state) {
    themeBtn.textContent = state.theme === 'dark' ? '☀︎' : '☾';
  }
  function highlight() {
    links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === location.pathname));
  }

  authBtn.addEventListener('click', () => {
    const { user } = store.getState();
    store.setState({ user: user ? null : { name: 'Ada' } });
  });
  themeBtn.addEventListener('click', () => {
    store.setState((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' }));
  });

  store.subscribe((s) => { syncAuth(s); syncTheme(s); });
  syncAuth(store.getState());
  syncTheme(store.getState());
  highlight();
  document.addEventListener('spa:navigated', highlight);
}
