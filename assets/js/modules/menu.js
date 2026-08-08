/**
 * @file The menu: card rendering, filtering, search, sorting and the
 * dish-detail dialog.
 *
 * Filters are plain radio/checkbox inputs styled as chips, so arrow-key
 * navigation, grouping and announcement all come from the platform rather than
 * from a pile of ARIA that has to be kept honest by hand.
 */

import { qs, qsa, delegate, escapeHtml } from '../lib/dom.js';
import { naira, nairaSpoken, pluralise } from '../lib/format.js';
import { createModal } from '../lib/modal.js';
import { CATEGORIES, DIET_FILTERS, DISHES } from '../data/menu.js';
import { addToTray } from './tray.js';

const SEARCH_DEBOUNCE_MS = 180;

const dishById = new Map(DISHES.map((dish) => [dish.id, dish]));
const categoryLabel = new Map(CATEGORIES.map((category) => [category.id, category.label]));
const dietLabel = new Map(DIET_FILTERS.map((diet) => [diet.id, diet.label]));

/** @type {ReturnType<typeof createModal> | null} */
let detailModal = null;

/** @type {HTMLElement | null} Element to restore focus to when the dialog closes. */
let detailOpener = null;

/* --------------------------------------------------------------- filtering */

/** @returns {{ category: string, diets: string[], query: string, sort: string }} */
function readFilters() {
  const checked = /** @type {HTMLInputElement | null} */ (
    qs('input[name="category"]:checked')
  );
  return {
    category: checked?.value ?? 'all',
    diets: qsa('input[name="diet"]:checked').map((input) => input.value),
    query: (/** @type {HTMLInputElement | null} */ (qs('#menu-search'))?.value ?? '')
      .trim()
      .toLowerCase(),
    sort: /** @type {HTMLSelectElement | null} */ (qs('#menu-sort'))?.value ?? 'default',
  };
}

/**
 * @param {ReturnType<typeof readFilters>} filters
 * @returns {Dish[]}
 */
function applyFilters({ category, diets, query, sort }) {
  const results = DISHES.filter((dish) => {
    if (category !== 'all' && dish.category !== category) return false;
    if (!diets.every((diet) => dish.diet.includes(diet))) return false;
    if (!query) return true;

    const haystack = [
      dish.name,
      dish.native,
      dish.description,
      categoryLabel.get(dish.category) ?? '',
      ...dish.allergens,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });

  const sorters = {
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'spice-desc': (a, b) => b.spice - a.spice || a.price - b.price,
    name: (a, b) => a.name.localeCompare(b.name, 'en'),
  };

  return sort in sorters ? [...results].sort(sorters[sort]) : results;
}

/* --------------------------------------------------------------- templates */

/**
 * A five-step heat indicator. Exposed to assistive tech as a single label
 * rather than five decorative glyphs.
 * @param {number} level
 */
function spiceTemplate(level) {
  const label =
    level === 0 ? 'Not spicy' : `Heat ${level} out of 5`;
  const pips = Array.from(
    { length: 5 },
    (_, index) => `<span class="spice__pip${index < level ? ' is-lit' : ''}"></span>`,
  ).join('');
  return `<p class="spice" role="img" aria-label="${label}"><span class="spice__pips" aria-hidden="true">${pips}</span><span class="spice__text" aria-hidden="true">${level === 0 ? 'Mild' : `Heat ${level}/5`}</span></p>`;
}

/** @param {Dish} dish */
function cardTemplate(dish) {
  const tags = dish.diet
    .map((diet) => `<li class="tag tag--diet">${escapeHtml(dietLabel.get(diet) ?? diet)}</li>`)
    .join('');

  return `
    <li class="dish-card" data-dish="${dish.id}">
      <article class="dish-card__inner" aria-labelledby="dish-${dish.id}-title">
        <div class="dish-card__media">
          <svg class="dish-card__art" viewBox="0 0 120 120" role="img"
               aria-label="Illustration of ${escapeHtml(dish.name)}">
            <use href="#${dish.art}"></use>
          </svg>
          ${dish.signature ? '<p class="dish-card__flag">House favourite</p>' : ''}
        </div>

        <div class="dish-card__body">
          <header class="dish-card__head">
            <h3 class="dish-card__title" id="dish-${dish.id}-title">
              <button type="button" class="dish-card__open" data-dish-open="${dish.id}">
                ${escapeHtml(dish.name)}
              </button>
            </h3>
            <p class="dish-card__native" lang="yo">${escapeHtml(dish.native)}</p>
          </header>

          <p class="dish-card__desc">${escapeHtml(dish.description)}</p>

          <div class="dish-card__meta">
            ${spiceTemplate(dish.spice)}
            <ul class="tag-list">${tags}</ul>
          </div>

          <footer class="dish-card__foot">
            <p class="dish-card__price">
              <span class="visually-hidden">Price: ${nairaSpoken(dish.price)}</span>
              <span aria-hidden="true">${naira(dish.price)}</span>
              <span class="dish-card__portion">${escapeHtml(dish.portion)}</span>
            </p>
            <button type="button" class="btn btn--primary btn--sm" data-add="${dish.id}">
              <span aria-hidden="true">Add</span>
              <span class="visually-hidden">Add ${escapeHtml(dish.name)} to your order tray</span>
            </button>
          </footer>
        </div>
      </article>
    </li>`;
}

/* ----------------------------------------------------------------- render */

function render() {
  const grid = qs('#menu-grid');
  const status = qs('#menu-status');
  const empty = qs('#menu-empty');
  if (!grid || !status || !empty) return;

  const filters = readFilters();
  const results = applyFilters(filters);

  grid.innerHTML = results.map(cardTemplate).join('');
  grid.hidden = results.length === 0;
  empty.hidden = results.length > 0;

  const scope =
    filters.category === 'all'
      ? 'the full menu'
      : `${categoryLabel.get(filters.category)}`;
  status.textContent =
    results.length === 0
      ? 'No dishes match those filters.'
      : `Showing ${pluralise(results.length, 'dish', 'dishes')} from ${scope}.`;

  // Keep the section blurb in step with the chosen category.
  const blurb = qs('#menu-blurb');
  if (blurb) {
    blurb.textContent =
      CATEGORIES.find((category) => category.id === filters.category)?.blurb ??
      'Seventeen plates, cooked the way they are cooked at home.';
  }
}

function resetFilters() {
  const all = /** @type {HTMLInputElement | null} */ (qs('#category-all'));
  if (all) all.checked = true;
  qsa('input[name="diet"]').forEach((input) => {
    input.checked = false;
  });
  const search = /** @type {HTMLInputElement | null} */ (qs('#menu-search'));
  if (search) search.value = '';
  const sort = /** @type {HTMLSelectElement | null} */ (qs('#menu-sort'));
  if (sort) sort.value = 'default';
  render();
}

/* ---------------------------------------------------------- detail dialog */

/** @param {string} id */
function openDetail(id) {
  const dish = dishById.get(id);
  const body = qs('#dish-detail-body');
  if (!dish || !body || !detailModal) return;

  qs('#dish-dialog')?.setAttribute('aria-label', `${dish.name} — dish details`);

  const allergens = dish.allergens.length
    ? dish.allergens.map((item) => escapeHtml(item)).join(', ')
    : 'None declared';
  const diets = dish.diet.length
    ? dish.diet.map((diet) => escapeHtml(dietLabel.get(diet) ?? diet)).join(', ')
    : 'Contains meat or fish';

  body.innerHTML = `
    <div class="detail__media">
      <svg viewBox="0 0 120 120" role="img" aria-label="Illustration of ${escapeHtml(dish.name)}">
        <use href="#${dish.art}"></use>
      </svg>
    </div>
    <div class="detail__body">
      <p class="detail__eyebrow">${escapeHtml(categoryLabel.get(dish.category) ?? '')}</p>
      <h2 class="detail__title">${escapeHtml(dish.name)}</h2>
      <p class="detail__native" lang="yo">${escapeHtml(dish.native)}</p>
      <p class="detail__desc">${escapeHtml(dish.description)}</p>
      ${spiceTemplate(dish.spice)}
      <dl class="detail__facts">
        <div><dt>Serving</dt><dd>${escapeHtml(dish.portion)}</dd></div>
        <div><dt>Suitable for</dt><dd>${diets}</dd></div>
        <div><dt>Allergens</dt><dd>${allergens}</dd></div>
      </dl>
      <div class="detail__actions">
        <p class="detail__price"><span class="visually-hidden">Price: ${nairaSpoken(dish.price)}</span><span aria-hidden="true">${naira(dish.price)}</span></p>
        <button type="button" class="btn btn--primary" data-add="${dish.id}">
          Add to tray<span class="visually-hidden"> — ${escapeHtml(dish.name)}</span>
        </button>
      </div>
    </div>`;

  detailModal.open();
}

/* ------------------------------------------------------------------ setup */

/** Build the category chips from data so markup and data cannot drift apart. */
function renderCategoryChips() {
  const container = qs('#category-chips');
  if (!container) return;

  const chips = [{ id: 'all', label: 'Everything' }, ...CATEGORIES];
  container.innerHTML = chips
    .map(
      (chip, index) => `
      <li>
        <input class="chip__input" type="radio" name="category"
               id="category-${chip.id}" value="${chip.id}"${index === 0 ? ' checked' : ''}>
        <label class="chip" for="category-${chip.id}">${escapeHtml(chip.label)}</label>
      </li>`,
    )
    .join('');
}

/** Build the dietary checkboxes from data. */
function renderDietToggles() {
  const container = qs('#diet-toggles');
  if (!container) return;

  container.innerHTML = DIET_FILTERS.map(
    (diet) => `
      <li>
        <input class="chip__input" type="checkbox" name="diet"
               id="diet-${diet.id}" value="${diet.id}">
        <label class="chip chip--check" for="diet-${diet.id}">
          <svg class="chip__tick" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor"
                  stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          ${escapeHtml(diet.label)}
        </label>
      </li>`,
  ).join('');
}

export function initMenu() {
  renderCategoryChips();
  renderDietToggles();

  const form = qs('#menu-filters');
  const dialog = /** @type {HTMLDialogElement | null} */ (qs('#dish-dialog'));

  if (dialog) {
    detailModal = createModal(dialog, {
      onClose: () => {
        detailOpener?.focus();
        detailOpener = null;
      },
    });
    qsa('[data-dish-close]').forEach((button) =>
      button.addEventListener('click', () => detailModal?.close()),
    );
  }

  if (form) {
    // A filter form must never navigate; it only ever re-renders.
    form.addEventListener('submit', (event) => event.preventDefault());
    form.addEventListener('change', render);

    let timer = 0;
    qs('#menu-search')?.addEventListener('input', () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(render, SEARCH_DEBOUNCE_MS);
    });

    qs('#menu-reset')?.addEventListener('click', () => {
      resetFilters();
      qs('#menu-search')?.focus();
    });
  }

  qs('#menu-empty-reset')?.addEventListener('click', () => {
    resetFilters();
    qs('#menu-search')?.focus();
  });

  // One delegated listener covers the grid and the detail dialog alike.
  delegate(document, 'click', '[data-add]', (_event, target) => {
    addToTray(target.getAttribute('data-add') ?? '');
  });

  delegate(document, 'click', '[data-dish-open]', (_event, target) => {
    detailOpener = /** @type {HTMLElement} */ (target);
    openDetail(target.getAttribute('data-dish-open') ?? '');
  });

  render();
}

/**
 * Jump to the menu with a category preselected — used by the hero and the
 * category tiles.
 * @param {string} categoryId
 */
export function focusCategory(categoryId) {
  const input = /** @type {HTMLInputElement | null} */ (
    document.getElementById(`category-${categoryId}`)
  );
  if (!input) return;
  input.checked = true;
  render();
  qs('#menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  input.focus({ preventScroll: true });
}
