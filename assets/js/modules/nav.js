/**
 * @file Header behaviour: the mobile drawer, the condensed-on-scroll header,
 * scroll-spy for the primary nav, and the back-to-top control.
 */

import { qs, qsa, prefersReducedMotion } from '../lib/dom.js';

/** Collapse the drawer on desktop widths where the full nav is visible. */
const DESKTOP = window.matchMedia('(min-width: 62rem)');

function initDrawer() {
  const toggle = /** @type {HTMLButtonElement | null} */ (qs('#nav-toggle'));
  const nav = qs('#primary-nav');
  const header = qs('.site-header');
  if (!toggle || !nav || !header) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    header.classList.toggle('is-nav-open', open);
    document.body.classList.toggle('has-open-drawer', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', () => {
    const opening = !isOpen();
    setOpen(opening);
    if (opening) qs('a, button', nav)?.focus();
  });

  // Any nav link closes the drawer and hands focus to the section itself.
  nav.addEventListener('click', (event) => {
    if (/** @type {Element} */ (event.target).closest('a') && isOpen()) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    const target = /** @type {Node} */ (event.target);
    if (isOpen() && !header.contains(target)) setOpen(false);
  });

  DESKTOP.addEventListener('change', (event) => {
    if (event.matches && isOpen()) setOpen(false);
  });
}

function initCondensedHeader() {
  const header = qs('.site-header');
  const sentinel = qs('#header-sentinel');
  if (!header || !sentinel) return;

  const observer = new IntersectionObserver(
    ([entry]) => header.classList.toggle('is-condensed', !entry.isIntersecting),
    { threshold: 0 },
  );
  observer.observe(sentinel);
}

function initScrollSpy() {
  /** @type {HTMLAnchorElement[]} */
  const links = qsa('#primary-nav a[href^="#"]');
  /** @type {Map<string, HTMLAnchorElement>} */
  const byId = new Map();

  const sections = links
    .map((link) => {
      const id = decodeURIComponent(link.hash.slice(1));
      const section = document.getElementById(id);
      if (section) byId.set(id, link);
      return section;
    })
    .filter(Boolean);

  if (sections.length === 0) return;

  /** @type {Set<string>} Ids currently intersecting the spy band. */
  const visible = new Set();

  const paint = () => {
    // When several sections straddle the band, the topmost one wins.
    const active = sections.find((section) => visible.has(section.id));
    for (const [id, link] of byId) {
      const isActive = active?.id === id;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      }
      paint();
    },
    // A band across the upper-middle of the viewport, so "active" tracks what
    // the visitor is actually reading rather than what is merely on screen.
    { rootMargin: '-45% 0px -45% 0px' },
  );

  sections.forEach((section) => observer.observe(section));
}

function initBackToTop() {
  const button = /** @type {HTMLButtonElement | null} */ (qs('#to-top'));
  const sentinel = qs('#header-sentinel');
  if (!button || !sentinel) return;

  const observer = new IntersectionObserver(
    ([entry]) => button.classList.toggle('is-visible', !entry.isIntersecting),
    { threshold: 0 },
  );
  observer.observe(sentinel);

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
    // Scrolling alone does not move focus; send it somewhere sensible.
    qs('.site-header .brand')?.focus();
  });
}

export function initNav() {
  initDrawer();
  initCondensedHeader();
  initScrollSpy();
  initBackToTop();
}
