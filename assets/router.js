/**
 * router.js — detachable SPA engine. Zero app deps, zero route config.
 *
 * Contract per folder: <path>/index.html (direct load), <path>/main.json
 * ({ html, title? }) and <path>/main.js (optional, exports mount(root)).
 *
 * Drop this <script> tag into a page and in-app links become SPA
 * navigations: fetch main.json, swap #view's innerHTML, import main.js,
 * call mount(). Remove the tag and every folder still works as a plain
 * multi-page site — this file is the only thing that knows "SPA" exists.
 */
(function () {
  const root = document.getElementById('view');
  if (!root) return;

  window.__SPA__ = true;

  let currentUnmount = null;
  let navId = 0;

  function normalize(pathname) {
    let p = pathname.replace(/\/index\.html$/, '/');
    if (!p.endsWith('/')) p += '/';
    return p;
  }

  async function navigate(pathname, { isPop = false } = {}) {
    const myNav = ++navId;
    const path = normalize(pathname);

    root.setAttribute('aria-busy', 'true');
    root.classList.add('is-loading');

    try {
      const res = await fetch(path + 'main.json', { cache: 'no-store' });
      if (myNav !== navId) return;
      if (!res.ok) throw new Error('not-found');
      const data = await res.json();
      if (myNav !== navId) return;

      currentUnmount?.();
      currentUnmount = null;
      root.innerHTML = data.html;
      if (data.title) document.title = data.title;

      let mod = null;
      try { mod = await import(path + 'main.js'); } catch (e) { /* page has no main.js */ }
      if (myNav !== navId) return;
      if (mod?.mount) currentUnmount = (await mod.mount(root)) || null;

      if (!isPop) history.pushState({ path }, '', path);
      scrollTo(0, 0);
      document.dispatchEvent(new CustomEvent('spa:navigated', { detail: { path } }));
    } catch (err) {
      if (myNav !== navId) return;
      currentUnmount?.();
      currentUnmount = null;
      root.innerHTML = '<section class="page"><span class="eyebrow">404</span><h1>Not found</h1><p class="lead">No page at this address.</p></section>';
    } finally {
      if (myNav === navId) {
        root.removeAttribute('aria-busy');
        root.classList.remove('is-loading');
      }
    }
  }

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    if (!a) return;
    if (a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-external')) return;

    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;

    e.preventDefault();
    const path = normalize(url.pathname);
    if (path === normalize(location.pathname)) return;
    navigate(path);
  });

  window.addEventListener('popstate', () => navigate(location.pathname, { isPop: true }));

  // exposed so pages can navigate programmatically (e.g. after login) without
  // caring whether router.js is present — falls back to location.href if not
  window.spaNavigate = navigate;

  // page's HTML is already on screen from the static load — just wire up
  // its main.js instead of re-fetching what's already rendered
  (async function initial() {
    const path = normalize(location.pathname);
    let mod = null;
    try { mod = await import(path + 'main.js'); } catch (e) { /* no main.js */ }
    if (mod?.mount) currentUnmount = (await mod.mount(root)) || null;
    history.replaceState({ path }, '', path);
  })();
})();
