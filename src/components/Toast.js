/**
 * Toast: a small message that slides up from the bottom of the screen and
 * disappears after a few seconds. Used to tell the user when something
 * failed, e.g. "Couldn't delete the post."
 *
 * The element in index.html has role="status" and aria-live="polite", so
 * screen readers announce the message without moving focus.
 */
export default class Toast {
  /**
   * @param {string} selector - the toast element, e.g. ".toast"
   * @param {number} duration - how long it stays visible, in milliseconds
   */
  constructor(selector, duration = 4000) {
    this._el = document.querySelector(selector);
    this._duration = duration;
    this._timer = null;
  }

  show(message) {
    this._el.textContent = message;
    this._el.classList.add("toast_visible"); // CSS handles the animation
    // If a toast is already showing, restart the countdown instead of
    // letting the old timer hide the new message early.
    clearTimeout(this._timer);
    this._timer = setTimeout(
      () => this._el.classList.remove("toast_visible"),
      this._duration
    );
  }
}
