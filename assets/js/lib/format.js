/** @file Locale-aware formatting for prices, counts and dates. */

const LOCALE = 'en-NG';

const nairaFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const plainNumberFormatter = new Intl.NumberFormat(LOCALE);

/**
 * Format whole Naira, e.g. 4500 -> "₦4,500".
 * @param {number} amount
 * @returns {string}
 */
export const naira = (amount) => nairaFormatter.format(amount);

/**
 * Format a price for screen readers, which read "₦" unreliably.
 * @param {number} amount
 * @returns {string}
 */
export const nairaSpoken = (amount) =>
  `${plainNumberFormatter.format(amount)} naira`;

/**
 * Pick a singular or plural word based on `count`.
 * @param {number} count
 * @param {string} singular
 * @param {string} [plural]
 * @returns {string}
 */
export const pluralise = (count, singular, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

/**
 * Format minutes-since-midnight as a 12-hour clock time, e.g. 630 -> "10:30 am".
 * @param {number} minutes
 * @returns {string}
 */
export function clockTime(minutes) {
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const suffix = hour24 < 12 ? 'am' : 'pm';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return minute === 0
    ? `${hour12} ${suffix}`
    : `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}
