/**
 * @file "Open now" status and the opening-hours table.
 *
 * Everything is computed in Africa/Lagos regardless of where the visitor is,
 * because the kitchen does not care what time it is in Berlin.
 */

import { qs } from '../lib/dom.js';
import { clockTime } from '../lib/format.js';
import { HOURS, RESTAURANT } from '../data/restaurant.js';

const REFRESH_MS = 60_000;

/**
 * Current weekday and minutes-past-midnight in the restaurant's timezone.
 * @param {Date} [now]
 * @returns {{ day: number, minutes: number }}
 */
export function lagosNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: RESTAURANT.timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type) => parts.find((part) => part.type === type)?.value ?? '0';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return {
    day: Math.max(0, days.indexOf(get('weekday'))),
    // `hour: '2-digit'` with hour12:false can yield "24" at midnight.
    minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')),
  };
}

/**
 * @typedef {object} OpenState
 * @property {boolean} open
 * @property {string}  label   Short badge text.
 * @property {string}  detail  Sentence-length explanation.
 */

/**
 * @param {Date} [now]
 * @returns {OpenState}
 */
export function openState(now = new Date()) {
  const { day, minutes } = lagosNow(now);
  const today = HOURS[day];

  if (minutes >= today.open && minutes < today.close) {
    const closingSoon = today.close - minutes <= 60;
    return {
      open: true,
      label: closingSoon ? 'Closing soon' : 'Open now',
      detail: closingSoon
        ? `Last orders — the kitchen closes at ${clockTime(today.close)}.`
        : `We are serving until ${clockTime(today.close)} today.`,
    };
  }

  if (minutes < today.open) {
    return {
      open: false,
      label: 'Closed',
      detail: `We open today at ${clockTime(today.open)}.`,
    };
  }

  const tomorrow = HOURS[(day + 1) % 7];
  return {
    open: false,
    label: 'Closed',
    detail: `We open again ${tomorrow.label} at ${clockTime(tomorrow.open)}.`,
  };
}

function renderBadges() {
  const state = openState();

  document.querySelectorAll('[data-open-badge]').forEach((badge) => {
    badge.classList.toggle('is-open', state.open);
    badge.classList.toggle('is-closed', !state.open);
    const dot = badge.querySelector('[data-open-label]');
    if (dot) dot.textContent = state.label;
  });

  document.querySelectorAll('[data-open-detail]').forEach((node) => {
    node.textContent = state.detail;
  });
}

function renderTable() {
  const body = qs('#hours-body');
  if (!body) return;

  const { day } = lagosNow();
  // Present the week Monday-first, the way a Lagos signboard would.
  const order = [1, 2, 3, 4, 5, 6, 0];

  body.innerHTML = order
    .map((index) => {
      const row = HOURS[index];
      const isToday = index === day;
      return `
        <tr${isToday ? ' class="is-today"' : ''}>
          <th scope="row">
            ${row.label}${isToday ? ' <span class="hours__today">Today</span>' : ''}
          </th>
          <td>
            <time datetime="${timeAttr(row.open)}">${clockTime(row.open)}</time>
            <span aria-hidden="true">–</span>
            <span class="visually-hidden">to</span>
            <time datetime="${timeAttr(row.close)}">${clockTime(row.close)}</time>
          </td>
        </tr>`;
    })
    .join('');
}

/**
 * Minutes-past-midnight as an HH:MM `datetime` value.
 * @param {number} minutes
 */
const timeAttr = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

export function initHours() {
  renderTable();
  renderBadges();
  // Silently re-check each minute so a badge never goes stale on an open tab.
  window.setInterval(renderBadges, REFRESH_MS);
}
