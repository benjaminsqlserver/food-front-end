/**
 * @file A localStorage wrapper that never throws.
 * Private browsing, disabled storage and quota errors all degrade to in-memory
 * state so the page keeps working instead of dying on a write.
 */

const PREFIX = 'iyabashirat:';

/** @type {Map<string, unknown>} Fallback when localStorage is unavailable. */
const memory = new Map();

/** @type {boolean} */
const available = (() => {
  try {
    const probe = `${PREFIX}__probe__`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
})();

/**
 * Read a JSON value, falling back to `fallback` on any failure.
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function read(key, fallback) {
  if (!available) return /** @type {T} */ (memory.get(PREFIX + key) ?? fallback);
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Persist a JSON-serialisable value.
 * @param {string} key
 * @param {unknown} value
 */
export function write(key, value) {
  if (!available) {
    memory.set(PREFIX + key, value);
    return;
  }
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    memory.set(PREFIX + key, value);
  }
}
