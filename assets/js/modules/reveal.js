/**
 * @file Reveal-on-scroll and the counting statistics.
 *
 * Both are pure decoration. Under `prefers-reduced-motion` the content is
 * simply marked visible and the numbers jump straight to their final value.
 */

import { qsa, prefersReducedMotion } from '../lib/dom.js';

const COUNT_DURATION_MS = 1400;

function observeReveals() {
  const targets = qsa('[data-reveal]');
  if (targets.length === 0) return;

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    targets.forEach((node) => node.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  );

  targets.forEach((node) => observer.observe(node));
}

/** @param {HTMLElement} node */
function runCount(node) {
  const target = Number(node.dataset.count ?? '0');
  const suffix = node.dataset.countSuffix ?? '';
  const formatter = new Intl.NumberFormat('en-NG');

  if (prefersReducedMotion()) {
    node.textContent = formatter.format(target) + suffix;
    return;
  }

  const start = performance.now();
  const step = (now) => {
    const progress = Math.min(1, (now - start) / COUNT_DURATION_MS);
    // easeOutCubic — fast then settling, which reads as "counting up".
    const eased = 1 - (1 - progress) ** 3;
    node.textContent = formatter.format(Math.round(target * eased)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = qsa('[data-count]');
  if (counters.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    counters.forEach(runCount);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        runCount(/** @type {HTMLElement} */ (entry.target));
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.6 },
  );

  counters.forEach((node) => observer.observe(node));
}

export function initReveal() {
  observeReveals();
  initCounters();
}
