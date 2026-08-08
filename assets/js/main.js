/**
 * @file Application entry point.
 *
 * Each feature lives in its own module and is booted here. Every initialiser is
 * defensive about missing markup, so a section can be removed from index.html
 * without taking the rest of the page down with it.
 */

import { qs, qsa, delegate, prefersReducedMotion } from './lib/dom.js';
import { RESTAURANT, whatsappLink } from './data/restaurant.js';
import { initToasts, toast } from './modules/toast.js';
import { initTheme } from './modules/theme.js';
import { initNav } from './modules/nav.js';
import { initHours } from './modules/hours.js';
import { initMenu, focusCategory } from './modules/menu.js';
import { initTray } from './modules/tray.js';
import { initReservation } from './modules/reservation.js';
import { initTestimonials } from './modules/testimonials.js';
import { initReveal } from './modules/reveal.js';

/** Fill in every element that mirrors a value from the restaurant record. */
function hydrateContactDetails() {
  const links = qsa('[data-whatsapp-message]');
  links.forEach((link) => {
    link.href = whatsappLink(link.dataset.whatsappMessage ?? 'Hello Iya Bashirat!');
  });

  qsa('[data-phone-link]').forEach((link) => {
    link.href = `tel:${RESTAURANT.phone}`;
  });

  const year = qs('#current-year');
  if (year) year.textContent = String(new Date().getFullYear());
}

/**
 * Anchor links move the viewport but not the keyboard. Send focus to the
 * destination so the next Tab continues from where the eye already is.
 */
function initFocusOnAnchor() {
  delegate(document, 'click', 'a[href^="#"]:not([href="#"])', (event, link) => {
    const id = decodeURIComponent(/** @type {HTMLAnchorElement} */ (link).hash.slice(1));
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });

    // Sections are not focusable by default; borrow focus without a tab stop.
    const hadTabIndex = target.hasAttribute('tabindex');
    if (!hadTabIndex) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    if (!hadTabIndex) {
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), {
        once: true,
      });
    }

    if (history.pushState) history.pushState(null, '', `#${id}`);
  });
}

/** Category tiles in the "what we cook" strip jump into the filtered menu. */
function initCategoryShortcuts() {
  delegate(document, 'click', '[data-jump-category]', (event, target) => {
    event.preventDefault();
    focusCategory(target.getAttribute('data-jump-category') ?? 'all');
  });
}

/** Copy the street address to the clipboard, with a graceful fallback. */
function initCopyAddress() {
  const button = qs('#copy-address');
  if (!button) return;

  const address = `${RESTAURANT.name}, ${RESTAURANT.street}, ${RESTAURANT.area}, ${RESTAURANT.city}`;

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast('Address copied to your clipboard.', { tone: 'success' });
    } catch {
      // Clipboard access is denied in some contexts; select it instead so the
      // visitor can copy manually.
      const node = qs('#address-text');
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      toast('Address selected — press Ctrl or Cmd + C to copy.', { tone: 'warn' });
    }
  });
}

/**
 * The newsletter sign-up. There is no backend, so this validates, confirms and
 * says so plainly rather than pretending to have sent anything.
 */
function initNewsletter() {
  const form = /** @type {HTMLFormElement | null} */ (qs('#newsletter-form'));
  if (!form) return;

  const input = /** @type {HTMLInputElement} */ (qs('#newsletter-email'));
  const error = qs('#newsletter-email-error');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const valid = input.value.trim() !== '' && input.checkValidity();
    input.setAttribute('aria-invalid', String(!valid));
    input.closest('.field')?.classList.toggle('has-error', !valid);
    if (error) {
      error.textContent = valid
        ? ''
        : 'Enter an email address such as name@example.com.';
    }

    if (!valid) {
      input.focus();
      return;
    }

    toast('Thank you — we will write when the pot is on.', { tone: 'success' });
    form.reset();
  });
}

/** Show the sticky order bar once the visitor has scrolled past the menu. */
function initOrderBar() {
  const bar = qs('#order-bar');
  const menu = qs('#menu');
  if (!bar || !menu) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      bar.classList.toggle(
        'is-visible',
        entry.isIntersecting || entry.boundingClientRect.top < 0,
      );
    },
    { threshold: 0 },
  );
  observer.observe(menu);
}

function boot() {
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');
  // Watched by the classic script in <head>, which shows a diagnostic banner if
  // this flag never appears (the file:// module-blocking case).
  document.documentElement.dataset.booted = 'true';

  initToasts();
  initTheme();
  initNav();
  initHours();
  initTray();
  initMenu();
  initReservation();
  initTestimonials();
  initReveal();

  hydrateContactDetails();
  initFocusOnAnchor();
  initCategoryShortcuts();
  initCopyAddress();
  initNewsletter();
  initOrderBar();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
