// Chapter 5: DOM Helpers — vanilla replacements for classnames / jQuery-style helpers
// Note: requires a DOM environment (browser, or Node with jsdom) to actually run.

export function cx(...args) {
  return args
    .flatMap(arg => {
      if (!arg) return [];
      if (typeof arg === 'string') return arg;
      if (Array.isArray(arg)) return cx(...arg);
      return Object.entries(arg)
        .filter(([, condition]) => condition)
        .map(([key]) => key);
    })
    .join(' ');
}

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function on(root, event, selector, handler) {
  root.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) handler(e, target);
  });
}

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'class') node.className = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value);
  });
  children.forEach(child =>
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child)
  );
  return node;
}
