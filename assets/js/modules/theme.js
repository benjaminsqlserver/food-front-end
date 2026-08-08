/**
 * @file Light / dark theme toggle.
 *
 * The visitor's explicit choice is stored and wins. With no stored choice we
 * leave `data-theme` off entirely so the OS preference (and any later change
 * to it) drives the palette through `prefers-color-scheme`.
 */

import { qs } from '../lib/dom.js';
import { read, write } from '../lib/storage.js';

const KEY = 'theme';

/** @returns {'light' | 'dark'} The palette currently on screen. */
function resolvedTheme() {
  const stored = read(KEY, null);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * @param {'light' | 'dark'} theme
 * @param {HTMLButtonElement} button
 */
function apply(theme, button) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#14100d' : '#fff8ef');

  const goingTo = theme === 'dark' ? 'light' : 'dark';
  button.setAttribute('aria-pressed', String(theme === 'dark'));
  button.setAttribute('aria-label', `Switch to ${goingTo} mode`);
  button.title = `Switch to ${goingTo} mode`;
}

export function initTheme() {
  const button = /** @type {HTMLButtonElement | null} */ (qs('#theme-toggle'));
  if (!button) return;

  apply(resolvedTheme(), button);

  button.addEventListener('click', () => {
    const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
    write(KEY, next);
    apply(next, button);
  });

  // Follow the OS only while the visitor has not made a choice of their own.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (read(KEY, null) === null) apply(resolvedTheme(), button);
  });
}
