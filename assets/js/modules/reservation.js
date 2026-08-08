/**
 * @file Table reservation form.
 *
 * Validation is progressive: native constraints do the first pass, we add the
 * rules HTML cannot express (a Nigerian phone number, a date the kitchen is
 * actually open), and every error is announced through `aria-invalid` plus a
 * message wired up with `aria-describedby`. Nothing is validated until the
 * field has been left once, so the form does not shout at someone mid-typing.
 */

import { qs, qsa } from '../lib/dom.js';
import { clockTime } from '../lib/format.js';
import { createModal } from '../lib/modal.js';
import { HOURS, RESTAURANT, whatsappLink } from '../data/restaurant.js';
import { lagosNow } from './hours.js';
import { toast } from './toast.js';

/** Accepts +2347051870773, 2347051870773, 07051870773 and spaced variants. */
const NIGERIAN_PHONE = /^(?:\+?234|0)(?:70|71|80|81|90|91|20)\d{8}$/;

/** Bookings open on the half hour, and stop 90 minutes before close. */
const LAST_SEATING_BUFFER = 90;

/** @type {ReturnType<typeof createModal> | null} */
let confirmModal = null;

/**
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} field
 * @returns {string} An empty string when the field is valid.
 */
function validate(field) {
  const value = field.value.trim();

  if (field.hasAttribute('required') && value === '') {
    return field.dataset.errorRequired ?? 'This field is required.';
  }
  if (value === '') return '';

  switch (field.id) {
    case 'res-phone':
      return NIGERIAN_PHONE.test(value.replace(/[\s()-]/g, ''))
        ? ''
        : 'Enter a Nigerian mobile number, for example 0705 187 0773.';

    case 'res-email':
      return field.validity.typeMismatch
        ? 'Enter an email address such as name@example.com.'
        : '';

    case 'res-date': {
      const chosen = new Date(`${value}T00:00:00`);
      if (Number.isNaN(chosen.getTime())) return 'Choose a valid date.';
      const today = new Date(`${todayInLagos()}T00:00:00`);
      if (chosen < today) return 'Please choose today or a later date.';
      const horizon = new Date(today);
      horizon.setDate(horizon.getDate() + 90);
      if (chosen > horizon) return 'We take bookings up to 90 days ahead.';
      return '';
    }

    case 'res-name':
      return value.length < 2 ? 'Please tell us the name for the booking.' : '';

    default:
      return field.validity.valid ? '' : 'Please check this field.';
  }
}

/**
 * Paint or clear the error state for one field.
 * @param {HTMLElement} field
 * @param {string} message
 */
function setFieldError(field, message) {
  const errorNode = document.getElementById(`${field.id}-error`);
  const invalid = message !== '';

  field.setAttribute('aria-invalid', String(invalid));
  field.closest('.field')?.classList.toggle('has-error', invalid);
  if (errorNode) errorNode.textContent = message;
}

/** Today's date in Africa/Lagos as an ISO `YYYY-MM-DD` string. */
function todayInLagos() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: RESTAURANT.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Rebuild the time menu for whichever day is selected, so a visitor can never
 * book a slot when the kitchen is shut.
 * @param {HTMLSelectElement} select
 * @param {string} isoDate
 */
function renderTimeOptions(select, isoDate) {
  const previous = select.value;
  const date = new Date(`${isoDate || todayInLagos()}T00:00:00`);
  const day = Number.isNaN(date.getTime()) ? lagosNow().day : date.getDay();
  const { open, close } = HOURS[day];

  const isToday = isoDate === todayInLagos();
  // Give the kitchen 45 minutes of notice for a same-day booking.
  const earliest = isToday ? Math.max(open, lagosNow().minutes + 45) : open;
  const latest = close - LAST_SEATING_BUFFER;

  /** @type {number[]} */
  const slots = [];
  for (let minutes = Math.ceil(earliest / 30) * 30; minutes <= latest; minutes += 30) {
    slots.push(minutes);
  }

  select.innerHTML =
    slots.length === 0
      ? '<option value="">No seatings left — please choose another date</option>'
      : ['<option value="">Choose a time</option>']
          .concat(
            slots.map(
              (minutes) =>
                `<option value="${minutes}">${clockTime(minutes)}</option>`,
            ),
          )
          .join('');

  // The select stays enabled even with no slots: a disabled control is skipped
  // by validation, and the visitor would get no explanation for the dead end.
  if (slots.some((minutes) => String(minutes) === previous)) select.value = previous;
}

/**
 * @param {FormData} data
 * @returns {{ summary: string, message: string }}
 */
function buildConfirmation(data) {
  const date = new Date(`${data.get('date')}T00:00:00`);
  const prettyDate = new Intl.DateTimeFormat('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  const time = clockTime(Number(data.get('time')));
  const guests = Number(data.get('guests'));
  const occasion = String(data.get('occasion') ?? '').trim();
  const notes = String(data.get('notes') ?? '').trim();

  const summary = `${prettyDate} at ${time}, table for ${guests}.`;

  const message = [
    `Hello ${RESTAURANT.name}, I would like to reserve a table.`,
    '',
    `Name: ${data.get('name')}`,
    `Phone: ${data.get('phone')}`,
    `Date: ${prettyDate}`,
    `Time: ${time}`,
    `Guests: ${guests}`,
    occasion && occasion !== 'none' ? `Occasion: ${occasion}` : '',
    notes ? `Notes: ${notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return { summary, message };
}

export function initReservation() {
  const form = /** @type {HTMLFormElement | null} */ (qs('#reservation-form'));
  const dialog = /** @type {HTMLDialogElement | null} */ (qs('#reservation-dialog'));
  if (!form) return;

  if (dialog) {
    confirmModal = createModal(dialog, {
      onClose: () => qs('#res-name')?.focus(),
    });
    qsa('[data-reservation-close]').forEach((button) =>
      button.addEventListener('click', () => confirmModal?.close()),
    );
  }

  const dateField = /** @type {HTMLInputElement} */ (qs('#res-date'));
  const timeField = /** @type {HTMLSelectElement} */ (qs('#res-time'));

  if (dateField) {
    const today = todayInLagos();
    dateField.min = today;
    if (!dateField.value) dateField.value = today;

    const horizon = new Date(`${today}T00:00:00`);
    horizon.setDate(horizon.getDate() + 90);
    dateField.max = horizon.toISOString().slice(0, 10);
  }

  if (timeField && dateField) {
    renderTimeOptions(timeField, dateField.value);
    dateField.addEventListener('change', () => {
      renderTimeOptions(timeField, dateField.value);
      setFieldError(dateField, validate(dateField));
    });
  }

  /** @type {(HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[]} */
  const fields = qsa('[data-validate]', form);

  fields.forEach((field) => {
    // Validate on blur first, then live once the field is known to be bad.
    field.addEventListener('blur', () => setFieldError(field, validate(field)));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        setFieldError(field, validate(field));
      }
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    /** @type {HTMLElement | null} */
    let firstInvalid = null;
    fields.forEach((field) => {
      const message = validate(field);
      setFieldError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      const summary = qs('#reservation-status');
      if (summary) {
        summary.textContent =
          'Your booking could not be sent. Please correct the highlighted fields.';
      }
      firstInvalid.focus();
      return;
    }

    const status = qs('#reservation-status');
    if (status) status.textContent = '';

    const { summary, message } = buildConfirmation(new FormData(form));
    const detail = qs('#reservation-summary');
    const link = /** @type {HTMLAnchorElement | null} */ (qs('#reservation-whatsapp'));

    if (detail) detail.textContent = summary;
    if (link) link.href = whatsappLink(message);

    if (confirmModal) confirmModal.open();
    else toast(`Table requested — ${summary}`, { tone: 'success' });

    form.reset();
    if (dateField) dateField.value = todayInLagos();
    if (timeField && dateField) renderTimeOptions(timeField, dateField.value);
    fields.forEach((field) => setFieldError(field, ''));
  });
}
