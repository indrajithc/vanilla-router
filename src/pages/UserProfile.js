import { h } from '../utils/dom.js';

const FAKE_USERS = {
  1: { name: 'Ada Lovelace', role: 'Mathematician' },
  2: { name: 'Grace Hopper', role: 'Rear Admiral & Engineer' },
  3: { name: 'Margaret Hamilton', role: 'Software Engineer' },
};

function fakeFetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = FAKE_USERS[id];
      user ? resolve(user) : reject(new Error(`No user with id "${id}"`));
    }, 400);
  });
}

// The router passes the matched `to` object (params, query, meta) into the
// page factory, so dynamic segments like :id are just... arguments.
export default function UserProfile({ params }) {
  const body = h('div.card', {}, h('p', {}, 'Loading…'));
  const el = h('section.page', {}, [
    h('span.eyebrow', {}, `/users/${params.id}`),
    h('h1', {}, 'User profile'),
    h('p.lead', {}, 'Try changing the id in the URL bar — e.g. /users/2 or /users/99 for the error state.'),
    body,
  ]);

  let cancelled = false;

  return {
    el,
    async mount() {
      try {
        const user = await fakeFetchUser(params.id);
        if (cancelled) return; // user navigated away before the fetch resolved
        body.replaceChildren(
          h('h3', {}, user.name),
          h('p', {}, user.role),
        );
      } catch (err) {
        if (cancelled) return;
        body.replaceChildren(h('p.error', {}, err.message));
      }
    },
    unmount() { cancelled = true; },
  };
}
