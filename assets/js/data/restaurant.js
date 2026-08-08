/** @file Single source of truth for the restaurant's contact details and hours. */

export const RESTAURANT = {
  name: 'Iya Bashirat Restaurant',
  tagline: 'Home cooking from a Lagos kitchen that never closed.',
  street: '56 Ajayi Crowther Street',
  area: 'Victoria Island',
  city: 'Lagos',
  country: 'Nigeria',
  /** E.164, used for tel: links. */
  phone: '+2347051870773',
  /** Digits only, used for wa.me links. */
  whatsapp: '2347051870773',
  email: 'hello@iyabashirat.ng',
  timeZone: 'Africa/Lagos',
  socials: {
    x: { handle: '@IyaBashiratNG', url: 'https://x.com/IyaBashiratNG' },
    tiktok: {
      handle: '@iyabashirat.kitchen',
      url: 'https://www.tiktok.com/@iyabashirat.kitchen',
    },
  },
};

/**
 * Opening hours in minutes from midnight, Africa/Lagos (WAT, UTC+1, no DST).
 * Index matches `Date.prototype.getDay()` — 0 is Sunday.
 * @type {{ label: string, open: number, close: number }[]}
 */
export const HOURS = [
  { label: 'Sunday', open: 12 * 60, close: 21 * 60 },
  { label: 'Monday', open: 10 * 60, close: 22 * 60 },
  { label: 'Tuesday', open: 10 * 60, close: 22 * 60 },
  { label: 'Wednesday', open: 10 * 60, close: 22 * 60 },
  { label: 'Thursday', open: 10 * 60, close: 22 * 60 },
  { label: 'Friday', open: 10 * 60, close: 23 * 60 + 30 },
  { label: 'Saturday', open: 10 * 60, close: 23 * 60 + 30 },
];

/**
 * Build a wa.me deep link with a pre-filled message.
 * @param {string} message
 * @returns {string}
 */
export const whatsappLink = (message) =>
  `https://wa.me/${RESTAURANT.whatsapp}?text=${encodeURIComponent(message)}`;
