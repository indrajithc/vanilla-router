/**
 * router.js — a small, production-minded SPA router.
 *
 * Features:
 *  - History API navigation (pushState/replaceState/popstate), no #hash needed
 *  - Dynamic params (/users/:id) and wildcards (/docs/*rest)
 *  - Query string parsing
 *  - Lazy-loaded route modules (real code-splitting via dynamic import())
 *  - Route guards: global beforeEach + per-route beforeEnter, with redirects
 *  - 404 fallback
 *  - Scroll position restoration per URL + scroll-to-top on new navigations
 *  - Link interception (<a data-link> or any in-app <a href>), respects
 *    ctrl/cmd/shift+click, target="_blank", download, and external origins
 *  - Cancels in-flight navigations if a newer one starts (race-safe)
 *  - afterEach hooks for things like analytics / document.title
 */

class Router {
  constructor({ routes, root, notFound, onError }) {
    this.routes = routes.map(this.#normalize);
    this.root = root; // DOM node views get mounted into
    this.notFound = notFound; // lazy loader for 404 view
    this.onError = onError || ((err) => console.error('[router]', err));

    this.beforeEachHooks = [];
    this.afterEachHooks = [];

    this.currentView = null; // currently mounted view module (for unmount/cleanup)
    this.currentPath = null;
    this.navId = 0; // increments per navigation, used to cancel stale ones

    this._scrollPositions = new Map(); // path -> {x, y}
  }

  #normalize(route) {
    // turn "/users/:id" into a regex + param names; supports trailing *wildcard
    const paramNames = [];
    const pattern = route.path
      .replace(/\/+$/, '') // strip trailing slash
      .replace(/:[a-zA-Z_]+/g, (m) => {
        paramNames.push(m.slice(1));
        return '([^/]+)';
      })
      .replace(/\*([a-zA-Z_]*)/g, (m, name) => {
        paramNames.push(name || 'wildcard');
        return '(.*)';
      });
    const regex = new RegExp(`^${pattern || '/'}$`);
    return { ...route, regex, paramNames };
  }

  beforeEach(fn) { this.beforeEachHooks.push(fn); return this; }
  afterEach(fn) { this.afterEachHooks.push(fn); return this; }

  start() {
    document.addEventListener('click', this.#onLinkClick);
    window.addEventListener('popstate', this.#onPopState);
    // capture scroll position of the outgoing page just before it's replaced
    window.addEventListener('scroll', () => {
      if (this.currentPath) this._scrollPositions.set(this.currentPath, { x: scrollX, y: scrollY });
    }, { passive: true });

    this.#navigate(this.#currentLocation(), { replace: true, isPop: false });
    return this;
  }

  push(path) { this.#navigate(path, { replace: false }); }
  replace(path) { this.#navigate(path, { replace: true }); }
  back() { history.back(); }

  #currentLocation() {
    return location.pathname + location.search + location.hash;
  }

  #onPopState = () => {
    this.#navigate(this.#currentLocation(), { replace: false, isPop: true });
  };

  #onLinkClick = (e) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let browser handle new-tab etc.

    const anchor = e.target.closest('a');
    if (!anchor) return;
    if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    if (anchor.hasAttribute('data-external')) return;

    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin) return; // external link, let it navigate normally

    e.preventDefault();
    const path = url.pathname + url.search + url.hash;
    if (path === this.#currentLocation()) return; // no-op nav to same URL
    this.push(path);
  };

  #matchRoute(pathname) {
    for (const route of this.routes) {
      const m = route.regex.exec(pathname);
      if (!m) continue;
      const params = {};
      route.paramNames.forEach((name, i) => { params[name] = m[i + 1]; });
      return { route, params };
    }
    return null;
  }

  async #navigate(rawPath, { replace, isPop }) {
    const myNavId = ++this.navId;
    const url = new URL(rawPath, location.href);
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    const query = Object.fromEntries(url.searchParams.entries());

    const matched = this.#matchRoute(pathname);
    const to = matched
      ? { path: pathname, params: matched.params, query, meta: matched.route.meta || {} }
      : { path: pathname, params: {}, query, meta: {}, notFound: true };

    // run global guards; a guard may return a redirect string/false to cancel
    for (const guard of this.beforeEachHooks) {
      const result = await guard(to);
      if (myNavId !== this.navId) return; // superseded by a newer navigation
      if (result === false) return;
      if (typeof result === 'string') return this.#navigate(result, { replace: true, isPop: false });
    }

    if (matched?.route.beforeEnter) {
      const result = await matched.route.beforeEnter(to);
      if (myNavId !== this.navId) return;
      if (result === false) return;
      if (typeof result === 'string') return this.#navigate(result, { replace: true, isPop: false });
    }

    // update the URL (unless this came from a popstate, which already changed it)
    if (!isPop) {
      const historyState = { path: rawPath };
      if (replace) history.replaceState(historyState, '', rawPath);
      else history.pushState(historyState, '', rawPath);
    }

    this.root.setAttribute('aria-busy', 'true');
    this.root.classList.add('is-loading');

    try {
      const loader = to.notFound ? this.notFound : matched.route.component;
      const mod = await loader(); // dynamic import() — code-split chunk
      if (myNavId !== this.navId) return; // a newer nav started while we awaited

      this.currentView?.unmount?.(); // cleanup previous view's listeners/timers
      this.root.innerHTML = '';

      const view = typeof mod.default === 'function' ? mod.default(to) : mod.default;
      this.currentView = view;
      this.root.appendChild(view.el);
      view.mount?.();

      this.currentPath = this.#currentLocation();

      if (isPop && this._scrollPositions.has(this.currentPath)) {
        const { x, y } = this._scrollPositions.get(this.currentPath);
        scrollTo(x, y);
      } else {
        scrollTo(0, 0);
      }

      for (const hook of this.afterEachHooks) hook(to);
    } catch (err) {
      if (myNavId !== this.navId) return;
      this.onError(err, to);
    } finally {
      if (myNavId === this.navId) {
        this.root.removeAttribute('aria-busy');
        this.root.classList.remove('is-loading');
      }
    }
  }
}

export function createRouter(config) {
  return new Router(config);
}
