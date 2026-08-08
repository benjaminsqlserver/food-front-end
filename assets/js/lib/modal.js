/**
 * @file Animated wrapper around the native <dialog> element.
 *
 * `showModal()` gives us focus trapping, Escape-to-close, background inertness
 * and the top layer for free — all things a hand-rolled modal gets wrong. The
 * only thing it does not give us is an exit animation, because `close()` removes
 * the element from the top layer immediately. So we drive an `.is-open` class
 * and defer the real `close()` until the transition finishes.
 */

import { prefersReducedMotion, nextFrame } from './dom.js';

/**
 * @param {HTMLDialogElement} dialog
 * @param {object} [options]
 * @param {() => void} [options.onOpen]
 * @param {() => void} [options.onClose]
 * @returns {{ open: () => void, close: () => void, isOpen: () => boolean }}
 */
export function createModal(dialog, { onOpen, onClose } = {}) {
  let closing = false;

  const finishClose = () => {
    if (!closing) return;
    closing = false;
    dialog.close();
  };

  const open = () => {
    if (dialog.open) return;
    closing = false;
    dialog.showModal();
    nextFrame(() => dialog.classList.add('is-open'));
    onOpen?.();
  };

  const close = () => {
    if (!dialog.open || closing) return;
    closing = true;
    dialog.classList.remove('is-open');
    if (prefersReducedMotion()) {
      finishClose();
    } else {
      // Belt and braces: transitionend may not fire if the dialog is hidden.
      window.setTimeout(finishClose, 400);
    }
  };

  dialog.addEventListener('transitionend', (event) => {
    if (event.target === dialog && event.propertyName === 'opacity') finishClose();
  });

  // Escape triggers the browser's own close; intercept it so the exit animation runs.
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  dialog.addEventListener('close', () => {
    dialog.classList.remove('is-open');
    closing = false;
    onClose?.();
  });

  // Clicking the backdrop closes. The dialog's own box is a child element, so a
  // click landing directly on <dialog> means it landed outside the panel.
  dialog.addEventListener('mousedown', (event) => {
    if (event.target === dialog) close();
  });

  return { open, close, isOpen: () => dialog.open && !closing };
}
