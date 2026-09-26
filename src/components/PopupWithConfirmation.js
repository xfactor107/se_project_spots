/**
 * PopupWithConfirmation: the "Delete this post?" dialog.
 *
 * It doesn't know *what* it's confirming. Whoever opens it passes in an
 * `action` function, and that function runs only if the user clicks
 * "Delete". This keeps the popup reusable for any "Are you sure?" step.
 */
import Popup from "./Popup.js";
import { renderLoading } from "../utils/helpers.js";

export default class PopupWithConfirmation extends Popup {
  constructor(selector, { handleError }) {
    super(selector);
    this._confirmButton = this._popup.querySelector(
      ".modal__button_type_delete"
    );
    this._cancelButton = this._popup.querySelector(
      ".modal__button_type_cancel"
    );
    this._handleError = handleError;
    this._action = null; // set on each open()
  }

  /**
   * @param {() => Promise} action - runs when "Delete" is clicked. It must
   *   return a Promise; the popup closes when that Promise resolves.
   */
  open(action) {
    this._action = action;
    super.open();
  }

  setEventListeners() {
    super.setEventListeners();
    this._cancelButton.addEventListener("click", () => this.close());
    this._confirmButton.addEventListener("click", () => {
      if (!this._action) return;
      renderLoading(this._confirmButton, true, "Deleting...");
      this._action()
        .then(() => this.close())
        .catch(this._handleError)
        .finally(() => renderLoading(this._confirmButton, false));
    });
  }
}
