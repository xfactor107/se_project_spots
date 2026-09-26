/**
 * Popup: the base class for every modal in the app.
 *
 * Handles everything all modals have in common:
 *   - opening and closing (by toggling the `modal_is-opened` CSS class)
 *   - closing on Escape, on the ✕ button, or by clicking the dark overlay
 *   - accessibility: moving focus into the modal, keeping Tab inside it,
 *     and returning focus to the button that opened it
 *
 * The specialized popups (PopupWithForm, PopupWithImage,
 * PopupWithConfirmation) `extend` this class and add their own behavior.
 * When they override a method they call `super.method()` to keep this
 * shared behavior.
 */

// Anything the keyboard can land on. Used by the focus trap below.
const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export default class Popup {
  /** @param {string} selector - CSS selector of the `.modal` element, e.g. "#new-post-modal" */
  constructor(selector) {
    this._popup = document.querySelector(selector);
    this._closeButton = this._popup.querySelector(".modal__close-button");

    // `bind` locks `this` to this popup instance. Without it, `this` inside
    // _handleKeydown would be `document` when the browser calls it. We also
    // need the *same* function reference to remove the listener later.
    this._handleKeydown = this._handleKeydown.bind(this);

    // The element that had focus before opening, so we can return to it.
    this._lastFocused = null;
  }

  open() {
    this._lastFocused = document.activeElement;
    this._popup.classList.add("modal_is-opened"); // CSS fades it in
    // Listen for Esc/Tab only while open, so closed modals don't react.
    document.addEventListener("keydown", this._handleKeydown);

    // Put the cursor in the first input (or on ✕ if there are no inputs).
    const target =
      this._popup.querySelector(".modal__input") || this._closeButton;
    // Wait one frame: the modal is `visibility: hidden` until the class is
    // applied, and hidden elements can't receive focus.
    requestAnimationFrame(() => target.focus());
  }

  close() {
    this._popup.classList.remove("modal_is-opened");
    document.removeEventListener("keydown", this._handleKeydown);
    // Keyboard users land back where they were instead of at the page top.
    if (this._lastFocused) this._lastFocused.focus();
  }

  _handleKeydown(evt) {
    if (evt.key === "Escape") {
      this.close();
    } else if (evt.key === "Tab") {
      this._trapFocus(evt);
    }
  }

  /**
   * Focus trap: when Tab reaches the last focusable element, wrap to the
   * first one (and Shift+Tab from the first wraps to the last). This stops
   * keyboard users from tabbing "behind" the modal into the hidden page.
   */
  _trapFocus(evt) {
    const focusable = Array.from(this._popup.querySelectorAll(FOCUSABLE));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (evt.shiftKey && document.activeElement === first) {
      evt.preventDefault();
      last.focus();
    } else if (!evt.shiftKey && document.activeElement === last) {
      evt.preventDefault();
      first.focus();
    }
  }

  /** Call once after creating the popup (see pages/index.js). */
  setEventListeners() {
    // The `.modal` element *is* the dark overlay; its content box sits
    // inside it. So `evt.target === this._popup` means the click landed on
    // the overlay itself, not on anything inside the white box.
    // We use mousedown (not click) so that selecting text inside an input
    // and releasing the mouse over the overlay doesn't close the modal.
    this._popup.addEventListener("mousedown", (evt) => {
      if (evt.target === this._popup) this.close();
    });
    this._closeButton.addEventListener("click", () => this.close());
  }
}
