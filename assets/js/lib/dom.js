/** @file Tiny DOM helpers. Deliberately small — no framework, no magic. */

/**
 * Query a single element, scoped to `root`.
 * @template {Element} T
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {T | null}
 */
export const qs = (selector, root = document) =>
  /** @type {T | null} */ (root.querySelector(selector));

/**
 * Query all matching elements as a real array.
 * @template {Element} T
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {T[]}
 */
export const qsa = (selector, root = document) =>
  /** @type {T[]} */ ([...root.querySelectorAll(selector)]);

/**
 * Escape a string for safe interpolation into an HTML template.
 * All user- and data-supplied text passes through here before it touches innerHTML.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

/**
 * Attach a delegated listener. Returns an unsubscribe function.
 * @param {Element | Document} root
 * @param {string} type
 * @param {string} selector
 * @param {(event: Event, target: Element) => void} handler
 * @returns {() => void}
 */
export function delegate(root, type, selector, handler) {
  /** @param {Event} event */
  const listener = (event) => {
    const start = /** @type {Element | null} */ (event.target);
    const match = start?.closest?.(selector);
    if (match && root.contains(match)) handler(event, match);
  };
  root.addEventListener(type, listener);
  return () => root.removeEventListener(type, listener);
}

/**
 * True when the visitor has asked the OS to reduce motion.
 * Read at call time so a mid-session preference change is honoured.
 * @returns {boolean}
 */
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Run a callback on the next animation frame after styles have settled.
 * Two frames is the reliable way to make a freshly-shown element transition.
 * @param {() => void} callback
 */
export function nextFrame(callback) {
  requestAnimationFrame(() => requestAnimationFrame(callback));
}
