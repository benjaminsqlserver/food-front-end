/**
 * @file The order tray — a persistent basket that hands the finished order to
 * WhatsApp, which is how a Lagos restaurant actually takes orders.
 *
 * No payment is taken here. The tray composes a readable message, opens
 * WhatsApp with it pre-filled, and lets a human confirm on the other end.
 */

import { qs, qsa, delegate, escapeHtml } from '../lib/dom.js';
import { naira, nairaSpoken, pluralise } from '../lib/format.js';
import { read, write } from '../lib/storage.js';
import { createModal } from '../lib/modal.js';
import { DISHES } from '../data/menu.js';
import { RESTAURANT, whatsappLink } from '../data/restaurant.js';
import { toast } from './toast.js';

const STORAGE_KEY = 'tray';
const DELIVERY_FEE = 1500;
const MAX_PER_ITEM = 20;

/** @type {Map<string, number>} dish id -> quantity */
let items = new Map();

/** @type {ReturnType<typeof createModal> | null} */
let modal = null;

const dishById = new Map(DISHES.map((dish) => [dish.id, dish]));

/* ------------------------------------------------------------------ state */

function load() {
  const stored = read(STORAGE_KEY, []);
  if (!Array.isArray(stored)) return;
  for (const entry of stored) {
    // Drop anything that no longer matches the live menu, e.g. after a rename.
    if (!Array.isArray(entry) || !dishById.has(entry[0])) continue;
    const quantity = Math.min(MAX_PER_ITEM, Math.max(1, Math.trunc(Number(entry[1]))));
    if (Number.isFinite(quantity)) items.set(entry[0], quantity);
  }
}

const persist = () => write(STORAGE_KEY, [...items]);

/** @returns {{ count: number, subtotal: number }} */
function totals() {
  let count = 0;
  let subtotal = 0;
  for (const [id, quantity] of items) {
    count += quantity;
    subtotal += (dishById.get(id)?.price ?? 0) * quantity;
  }
  return { count, subtotal };
}

const isDelivery = () =>
  /** @type {HTMLInputElement | null} */ (qs('input[name="fulfilment"]:checked'))
    ?.value === 'delivery';

/* --------------------------------------------------------------- rendering */

function renderBadge() {
  const { count } = totals();
  const badge = qs('#tray-count');
  const button = qs('#tray-toggle');
  if (badge) {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }
  button?.setAttribute(
    'aria-label',
    count === 0
      ? 'Order tray, empty'
      : `Order tray, ${pluralise(count, 'item')}`,
  );
}

/** @param {Dish} dish @param {number} quantity */
function lineTemplate(dish, quantity) {
  const lineTotal = dish.price * quantity;
  return `
    <li class="tray-line" data-line="${dish.id}">
      <svg class="tray-line__art" viewBox="0 0 120 120" role="img" aria-label="${escapeHtml(dish.name)}">
        <use href="#${dish.art}"></use>
      </svg>
      <div class="tray-line__body">
        <p class="tray-line__name">${escapeHtml(dish.name)}</p>
        <p class="tray-line__meta">${naira(dish.price)} each</p>
      </div>
      <div class="tray-line__qty">
        <button type="button" class="qty-btn" data-tray-action="decrement" data-id="${dish.id}"
                aria-label="Remove one ${escapeHtml(dish.name)}">
          <span aria-hidden="true">&minus;</span>
        </button>
        <span class="qty-btn__value" aria-hidden="true">${quantity}</span>
        <button type="button" class="qty-btn" data-tray-action="increment" data-id="${dish.id}"
                aria-label="Add one ${escapeHtml(dish.name)}"${quantity >= MAX_PER_ITEM ? ' disabled' : ''}>
          <span aria-hidden="true">+</span>
        </button>
      </div>
      <p class="tray-line__total">
        <span class="visually-hidden">${quantity} × ${escapeHtml(dish.name)}, ${nairaSpoken(lineTotal)}</span>
        <span aria-hidden="true">${naira(lineTotal)}</span>
      </p>
      <button type="button" class="tray-line__remove" data-tray-action="remove" data-id="${dish.id}"
              aria-label="Remove ${escapeHtml(dish.name)} from the tray">
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path d="M6 6l8 8M14 6l-8 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </li>`;
}

function render() {
  renderBadge();

  const list = qs('#tray-list');
  const empty = qs('#tray-empty');
  if (!list || !empty) return;

  const { count, subtotal } = totals();
  const hasItems = count > 0;

  empty.hidden = hasItems;
  list.hidden = !hasItems;
  qsa('[data-tray-when-filled]').forEach((node) => {
    node.hidden = !hasItems;
  });

  list.innerHTML = hasItems
    ? [...items]
        .map(([id, quantity]) => lineTemplate(dishById.get(id), quantity))
        .join('')
    : '';

  const delivery = hasItems && isDelivery() ? DELIVERY_FEE : 0;
  const setText = (selector, value) => {
    const node = qs(selector);
    if (node) node.textContent = value;
  };

  setText('#tray-subtotal', naira(subtotal));
  setText('#tray-delivery', delivery === 0 ? 'Free' : naira(delivery));
  setText('#tray-total', naira(subtotal + delivery));
  setText(
    '#tray-summary',
    hasItems
      ? `${pluralise(count, 'item')} · ${naira(subtotal + delivery)}`
      : 'Order on WhatsApp in two taps',
  );
}

/* ------------------------------------------------------------ interactions */

/**
 * Add a dish to the tray.
 * @param {string} id
 * @param {{ silent?: boolean }} [options]
 */
export function addToTray(id, { silent = false } = {}) {
  const dish = dishById.get(id);
  if (!dish) return;

  const next = (items.get(id) ?? 0) + 1;
  if (next > MAX_PER_ITEM) {
    toast(`That is already ${MAX_PER_ITEM} portions of ${dish.name}. Call us for large orders.`, {
      tone: 'warn',
    });
    return;
  }

  items.set(id, next);
  persist();
  render();
  if (!silent) toast(`${dish.name} added to your tray.`, { tone: 'success' });
}

/** @param {string} id */
function decrement(id) {
  const current = items.get(id);
  if (current === undefined) return;
  if (current <= 1) items.delete(id);
  else items.set(id, current - 1);
  persist();
  render();
}

/** @param {string} id */
function remove(id) {
  const dish = dishById.get(id);
  items.delete(id);
  persist();
  render();
  if (dish) toast(`${dish.name} removed.`);
}

/** Compose the WhatsApp message for the current tray. */
function orderMessage() {
  const { subtotal } = totals();
  const delivery = isDelivery() ? DELIVERY_FEE : 0;
  const note = /** @type {HTMLTextAreaElement | null} */ (qs('#tray-note'))?.value.trim();

  const lines = [
    `Hello ${RESTAURANT.name}, I would like to place an order:`,
    '',
    ...[...items].map(([id, quantity]) => {
      const dish = dishById.get(id);
      return `• ${quantity} × ${dish.name} — ${naira(dish.price * quantity)}`;
    }),
    '',
    `Subtotal: ${naira(subtotal)}`,
    isDelivery()
      ? `Delivery (Victoria Island): ${naira(delivery)}`
      : 'Pickup at 56 Ajayi Crowther Street',
    `Total: ${naira(subtotal + delivery)}`,
  ];

  if (note) lines.push('', `Note: ${note}`);
  lines.push('', 'Thank you!');
  return lines.join('\n');
}

function checkout() {
  if (items.size === 0) return;
  window.open(whatsappLink(orderMessage()), '_blank', 'noopener,noreferrer');
  toast('Your order is ready in WhatsApp — send it to confirm.', { tone: 'success' });
}

/* ------------------------------------------------------------------- setup */

export function initTray() {
  const dialog = /** @type {HTMLDialogElement | null} */ (qs('#tray-dialog'));
  const toggle = qs('#tray-toggle');
  if (!dialog || !toggle) return;

  load();

  // Focus returns to whichever control opened the tray, not always the header.
  let opener = /** @type {HTMLElement} */ (toggle);

  modal = createModal(dialog, {
    onClose: () => opener?.focus(),
  });

  qsa('#tray-toggle, [data-open-tray]').forEach((button) =>
    button.addEventListener('click', () => {
      opener = /** @type {HTMLElement} */ (button);
      modal?.open();
    }),
  );
  qsa('[data-tray-close]').forEach((button) =>
    button.addEventListener('click', () => modal?.close()),
  );

  delegate(dialog, 'click', '[data-tray-action]', (_event, target) => {
    const id = target.getAttribute('data-id') ?? '';
    switch (target.getAttribute('data-tray-action')) {
      case 'increment':
        addToTray(id, { silent: true });
        break;
      case 'decrement':
        decrement(id);
        break;
      case 'remove':
        remove(id);
        break;
      case 'checkout':
        checkout();
        break;
      default:
        break;
    }
    // The list was re-rendered under the pointer; keep keyboard users anchored.
    const restored = qs(`[data-tray-action="increment"][data-id="${CSS.escape(id)}"]`, dialog);
    if (restored instanceof HTMLElement && document.activeElement === document.body) {
      restored.focus();
    }
  });

  qsa('input[name="fulfilment"]').forEach((input) =>
    input.addEventListener('change', render),
  );

  render();
}
