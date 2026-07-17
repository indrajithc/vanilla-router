/**
 * h() — a tiny hyperscript-style helper. Not a virtual DOM, no diffing —
 * it just builds real elements directly. Fine for this app's scale;
 * a bigger app would reach for a real render layer here instead.
 *
 * h('div.card', { onclick: fn }, ['hello ', h('b', {}, 'world')])
 */
export function h(tag, props = {}, children = []) {
  const [tagName, ...classes] = tag.split('.');
  const el = document.createElement(tagName || 'div');
  if (classes.length) el.className = classes.join(' ');

  for (const [key, value] of Object.entries(props || {})) {
    if (key === 'class') el.className = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (value === false || value == null) {
      // skip falsy attrs entirely, e.g. disabled: false
    } else {
      el.setAttribute(key, value === true ? '' : value);
    }
  }

  const kids = Array.isArray(children) ? children : [children];
  for (const child of kids) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

export function qs(root, sel) { return root.querySelector(sel); }
