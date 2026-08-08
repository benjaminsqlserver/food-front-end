/**
 * @file Transient status messages.
 *
 * The region is `aria-live="polite"` so announcements queue behind whatever the
 * screen reader is already saying, rather than interrupting the user mid-word.
 */

import { qs, prefersReducedMotion } from '../lib/dom.js';

const DURATION = 4000;

/** @type {HTMLElement | null} */
let region = null;

/** Wire up the live region. Called once at boot. */
export function initToasts() {
  region = qs('#toast-region');
}

/**
 * Show a toast.
 * @param {string} message
 * @param {{ tone?: 'info' | 'success' | 'warn' }} [options]
 */
export function toast(message, { tone = 'info' } = {}) {
  if (!region) return;

  // A plain <div>: the parent region already carries role="status", and a
  // nested <output> would give screen readers two live regions to announce.
  const node = document.createElement('div');
  node.className = `toast toast--${tone}`;
  node.textContent = message;
  region.append(node);

  const remove = () => node.remove();

  window.setTimeout(() => {
    if (prefersReducedMotion()) {
      remove();
      return;
    }
    node.classList.add('is-leaving');
    node.addEventListener('animationend', remove, { once: true });
    window.setTimeout(remove, 600);
  }, DURATION);
}
