import { createRouter } from './router.js';
import { store } from './store.js';
import { Navbar } from './components/Navbar.js';
import { RouteInspector } from './components/RouteInspector.js';

// Every route's `component` is a () => import('./pages/X.js') — that's what
// makes each page its own lazy-loaded chunk instead of one giant bundle.
const routes = [
  { path: '/', component: () => import('./pages/Home.js') },
  { path: '/about', component: () => import('./pages/About.js') },
  { path: '/users/:id', component: () => import('./pages/UserProfile.js') },
  { path: '/login', component: () => import('./pages/Login.js') },
  {
    path: '/dashboard',
    component: () => import('./pages/Dashboard.js'),
    meta: { title: 'Dashboard' },
    // Per-route guard: redirect to /login (preserving where we came from)
    // when there's no user in the store.
    beforeEnter: (to) => {
      const { user } = store.getState();
      if (!user) return `/login?redirect=${encodeURIComponent(to.path)}`;
      return true;
    },
  },
];

export const router = createRouter({
  routes,
  root: document.getElementById('view'),
  notFound: () => import('./pages/NotFound.js'),
  onError: (err, to) => {
    console.error(`Failed to load route "${to.path}":`, err);
    document.getElementById('view').innerHTML =
      '<section class="page"><h1>Something went wrong</h1><p class="error">This page failed to load. Try refreshing.</p></section>';
  },
});

// Global guard: runs before every navigation, e.g. for analytics or
// closing a mobile menu. Kept separate from the per-route auth guard above
// so route-specific logic doesn't clutter app-wide concerns.
router.beforeEach((to) => {
  console.debug('[nav]', to.path);
  return true;
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · vanilla-router` : 'vanilla-router';
});

document.getElementById('nav-slot').appendChild(Navbar(router).el);
document.getElementById('inspector-slot').appendChild(RouteInspector(router).el);
document.documentElement.dataset.theme = store.getState().theme;

router.start();
