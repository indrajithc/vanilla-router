# vanilla-router

Folder-per-page site. Works as plain multi-page HTML by default; drop in
one script tag and it becomes an SPA. No build step.

## Run it

ES modules must be served over http(s), not opened as a `file://` path.

```bash
npx serve .
# or
python3 -m http.server 5173
```

## Layout

Every page is a folder with three files:

```
/index.html      full HTML document — works standalone, JS off or on
/main.json        { "html": "...", "title": "..." } — same fragment as
                   index.html's #view content, fetched by the SPA router
/main.js           optional. export function mount(root) { ... }
                    return an unmount fn if the page needs cleanup
```

e.g. `/about/index.html`, `/about/main.json`, `/about/main.js`.

`index.html` and `main.json`'s `html` field hold the **same markup**,
duplicated by hand (no build step to keep them in sync — edit both when
you change a page).

## The router

`assets/router.js` is the only file that knows SPA mode exists. It is
completely detachable:

- **Present** (`<script src="/assets/router.js">` in a page): in-app link
  clicks are intercepted, it fetches `<path>/main.json`, swaps `#view`'s
  innerHTML, dynamically imports `<path>/main.js` and calls `mount(root)`.
  Uses the History API — back/forward/refresh/deep-links all work.
- **Absent**: links are plain `<a href>`s, every navigation is a full page
  load of that folder's `index.html`. The page's own `main.js` still runs
  (see the `if (!window.__SPA__) mount(...)` guard at the bottom of each
  `main.js`) so behavior — clocks, buttons, auth checks — works either way.
- **No route table.** The router doesn't know what pages exist — it just
  tries to fetch `main.json` for whatever path was clicked. 404 → shows
  inline "Not found" text in `#view`.

Pages that need to navigate programmatically (e.g. after login) call
`window.spaNavigate(path)` if router.js is present, else fall back to
`location.href` — see `login/main.js` and `dashboard/main.js`.

## Shared code

- `assets/store.js` — tiny pub/sub store (auth user + theme), imported by
  any page's `main.js` that needs it. Not part of the router contract.
- `assets/nav.js` — hydrates the static `#nav-slot` markup duplicated in
  every page (active-link highlight, auth/theme buttons). Lives outside
  `#view`, so the router never touches it across SPA navigations.

## Adding a page

1. Make a folder, e.g. `/settings/`.
2. Add `index.html` (copy an existing one, swap the `#view` content and
   `<title>`) with the same `<script>` tags at the bottom.
3. Add `main.json` with the same fragment as a `{ "html": ..., "title": ... }` string.
4. Add `main.js` if the page needs behavior; export `mount(root)`.
5. Add a link to it in every page's `#nav-slot` if it belongs in the nav.

## Deploying

Because a direct load of `/dashboard/` needs `/dashboard/index.html` to
exist as a real file, there's **no server rewrite needed** — unlike a
single-index-file SPA, every route already has a real file on disk.
