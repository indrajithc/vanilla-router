# vanilla-router

A production-shaped single-page app router in plain JavaScript — no React,
no build step. It demonstrates the parts a "real" SPA needs that toy
examples usually skip.

## Run it

ES modules must be served over http(s), not opened as a `file://` path.
Any static server works:

```bash
npx serve .
# or
python3 -m http.server 5173
```

Then open the printed localhost URL.

## What's implemented, and why

| Concern | Where | Notes |
|---|---|---|
| History API navigation | `src/router.js` | `pushState`/`replaceState`/`popstate`, no `#` needed |
| Dynamic params | `src/router.js` `#normalize` | `/users/:id`, `/docs/*rest` |
| Code-splitting | `src/app.js` routes table | each page is `() => import('./pages/X.js')` — a separate network chunk, loaded on demand |
| Route guards | `router.beforeEach`, `route.beforeEnter` | see `/dashboard`'s auth redirect in `src/app.js` |
| 404 handling | `notFound` option + `src/pages/NotFound.js` | any unmatched path falls through here |
| Scroll restoration | `router.js` `_scrollPositions` | back/forward restores scroll; fresh navigations scroll to top |
| Link interception | `router.js` `#onLinkClick` | plain `<a href>` tags just work; ctrl/cmd-click, `target="_blank"`, `download`, and cross-origin links are left alone |
| Race-safe navigation | `router.js` `navId` counter | if you click two links fast, only the last one wins — no flicker from a slow first request resolving late |
| View lifecycle | `mount()` / `unmount()` on each page | `About.js`'s clock interval proves cleanup actually runs; `UserProfile.js` guards against a fetch resolving after navigating away |
| State shared across pages | `src/store.js` | tiny pub/sub store — auth user + theme, both persisted appropriately |
| Active link styling | `Navbar.js` + `router.afterEach` | highlights the current route without a framework's reactivity |

## Deploying (important)

Because routing happens client-side, your **server must serve `index.html`
for every path**, not just `/`. Otherwise a hard refresh on `/users/2` 404s
at the server before your JS ever runs. Example configs:

**Netlify** (`_redirects`):
```
/*  /index.html  200
```

**Nginx**:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Vercel** (`vercel.json`):
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

## Extending this

- Add nested/layout routes by having a page mount its own child `<router>`-like
  outlet, or extend `router.js` to support `children` on a route definition.
- Swap `src/utils/dom.js`'s `h()` for a tiny diffing layer if pages get more
  stateful — right now views just rebuild their own DOM, which is fine at
  this scale but won't scale to a big, deeply interactive page.
- Add a transition API (`router.beforeLeave` returning a Promise tied to a
  CSS animation) if you want page-exit animations instead of instant swap.
