/**
 * store.js — minimal observable store. Not Redux, just the useful 10%:
 * get(), set()/update(), subscribe(). Good enough for auth state, theme,
 * cached API data, etc. across independently-mounted views.
 */
export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  return {
    getState: () => state,
    setState(partial) {
      state = { ...state, ...(typeof partial === 'function' ? partial(state) : partial) };
      listeners.forEach((fn) => fn(state));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn); // unsubscribe
    },
  };
}

// App-wide singleton store. In a larger app you'd have several of these
// (auth, cart, ui-prefs...) rather than one giant blob.
export const store = createStore({
  user: null, // { name } | null — drives the auth guard on /dashboard
  theme: localStorage.getItem('theme') || 'dark',
});

store.subscribe((s) => {
  localStorage.setItem('theme', s.theme);
  document.documentElement.dataset.theme = s.theme;
});
