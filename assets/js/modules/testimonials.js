/**
 * @file Guest-review carousel.
 *
 * Built on a scroll-snap track so touch swiping is native and free. Autoplay
 * exists but obeys WCAG 2.2.2: it never starts under `prefers-reduced-motion`,
 * it pauses on hover and on keyboard focus, and there is always a visible
 * control to stop it.
 */

import { qs, qsa, escapeHtml, prefersReducedMotion } from '../lib/dom.js';
import { TESTIMONIALS } from '../data/testimonials.js';

const INTERVAL_MS = 7000;

/** @param {number} rating */
function starsTemplate(rating) {
  const stars = Array.from(
    { length: 5 },
    (_, index) =>
      `<svg class="stars__star${index < rating ? ' is-filled' : ''}" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 1.6l2.5 5.3 5.7.8-4.1 4.1 1 5.8-5.1-2.8-5.1 2.8 1-5.8L1.8 7.7l5.7-.8z"/></svg>`,
  ).join('');
  return `<p class="stars" role="img" aria-label="Rated ${rating} out of 5">${stars}</p>`;
}

/** @param {Testimonial} item @param {number} index @param {number} total */
function slideTemplate(item, index, total) {
  return `
    <li class="review" id="review-${item.id}" role="group"
        aria-roledescription="slide" aria-label="Review ${index + 1} of ${total}">
      <figure class="review__figure">
        ${starsTemplate(item.rating)}
        <blockquote class="review__quote">
          <p>${escapeHtml(item.quote)}</p>
        </blockquote>
        <figcaption class="review__cite">
          <span class="review__avatar" aria-hidden="true">${escapeHtml(item.name.charAt(0))}</span>
          <span>
            <span class="review__name">${escapeHtml(item.name)}</span>
            <span class="review__role">${escapeHtml(item.role)}</span>
          </span>
        </figcaption>
      </figure>
    </li>`;
}

export function initTestimonials() {
  const track = qs('#review-track');
  const dotsContainer = qs('#review-dots');
  const playToggle = /** @type {HTMLButtonElement | null} */ (qs('#review-play'));
  const region = qs('#reviews-carousel');
  if (!track || !dotsContainer || !region) return;

  const total = TESTIMONIALS.length;
  track.innerHTML = TESTIMONIALS.map((item, index) =>
    slideTemplate(item, index, total),
  ).join('');

  dotsContainer.innerHTML = TESTIMONIALS.map(
    (item, index) => `
      <li>
        <button type="button" class="review-dot" data-slide="${index}"
                aria-label="Show review ${index + 1} of ${total}"
                aria-controls="review-${item.id}">
          <span aria-hidden="true"></span>
        </button>
      </li>`,
  ).join('');

  /** @type {HTMLElement[]} */
  const slides = qsa('.review', track);
  const dots = qsa('.review-dot', dotsContainer);
  let index = 0;
  let timer = 0;
  let playing = false;

  const paint = () => {
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-current', String(i === index));
    });
    slides.forEach((slide, i) => {
      // Off-screen slides stay in the accessibility tree but out of the tab
      // order, so keyboard users are not dragged sideways through hidden text.
      slide.classList.toggle('is-current', i === index);
    });
  };

  /** @param {number} next @param {{ smooth?: boolean }} [options] */
  const goTo = (next, { smooth = true } = {}) => {
    index = (next + total) % total;
    track.scrollTo({
      left: slides[index].offsetLeft - track.offsetLeft,
      behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto',
    });
    paint();
  };

  const stop = () => {
    window.clearInterval(timer);
    timer = 0;
    playing = false;
    playToggle?.setAttribute('aria-pressed', 'false');
    if (playToggle) playToggle.title = 'Play reviews automatically';
  };

  const start = () => {
    if (prefersReducedMotion() || playing) return;
    playing = true;
    playToggle?.setAttribute('aria-pressed', 'true');
    if (playToggle) playToggle.title = 'Pause automatic review rotation';
    timer = window.setInterval(() => goTo(index + 1), INTERVAL_MS);
  };

  qs('#review-prev')?.addEventListener('click', () => {
    stop();
    goTo(index - 1);
  });
  qs('#review-next')?.addEventListener('click', () => {
    stop();
    goTo(index + 1);
  });

  dotsContainer.addEventListener('click', (event) => {
    const dot = /** @type {Element} */ (event.target).closest('[data-slide]');
    if (!dot) return;
    stop();
    goTo(Number(dot.getAttribute('data-slide')));
  });

  playToggle?.addEventListener('click', () => (playing ? stop() : start()));

  // Left/right arrows move between reviews when the carousel has focus.
  region.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    stop();
    goTo(index + (event.key === 'ArrowRight' ? 1 : -1));
  });

  region.addEventListener('mouseenter', stop);
  region.addEventListener('focusin', stop);

  // Keep the dots honest when the visitor swipes the track by hand.
  let scrollTimer = 0;
  track.addEventListener('scroll', () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      const middle = track.scrollLeft + track.clientWidth / 2;
      const nearest = slides.reduce(
        (best, slide, i) => {
          const centre = slide.offsetLeft - track.offsetLeft + slide.clientWidth / 2;
          const distance = Math.abs(centre - middle);
          return distance < best.distance ? { i, distance } : best;
        },
        { i: index, distance: Infinity },
      );
      if (nearest.i !== index) {
        index = nearest.i;
        paint();
      }
    }, 120);
  });

  // Nothing animates in a background tab.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });

  goTo(0, { smooth: false });
  if (playToggle) playToggle.hidden = prefersReducedMotion();
}
