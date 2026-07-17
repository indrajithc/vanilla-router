/**
 * store.js — minimal observable store. get(), set()/update(), subscribe().
 * Shared across pages via a plain ES module import — not part of the
 * router contract, just app code any main.js is free to use or ignore.
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
      return () => listeners.delete(fn);
    },
  };
}

export const store = createStore({
  user: null, // { name } | null
  theme: localStorage.getItem('theme') || 'dark',
});

store.subscribe((s) => {
  localStorage.setItem('theme', s.theme);
  document.documentElement.dataset.theme = s.theme;
});
