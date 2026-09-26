/**
 * PopupWithForm: a modal that contains a <form> (edit profile, new post,
 * change avatar).
 *
 * The page gives it a `handleSubmit(values)` function that returns a
 * Promise (usually an API call). On submit, this class:
 *   1. collects the input values into an object,
 *   2. switches the button to "Saving..." and disables it,
 *   3. waits for the Promise, then
 *   4. closes on success, or calls `handleError` and stays open on failure,
 *   5. restores the button either way.
 */
import Popup from "./Popup.js";
import { renderLoading } from "../utils/helpers.js";

export default class PopupWithForm extends Popup {
  /**
   * @param {string} selector - the modal's CSS selector
   * @param {object} options
   * @param {(values: object) => Promise} options.handleSubmit
   * @param {(err: Error) => void} options.handleError
   */
  constructor(selector, { handleSubmit, handleError }) {
    super(selector); // run Popup's constructor first (sets this._popup)
    this._form = this._popup.querySelector(".modal__form");
    this._inputs = Array.from(this._form.querySelectorAll(".modal__input"));
    this._submitButton = this._form.querySelector("[type=submit]");
    this._handleSubmit = handleSubmit;
    this._handleError = handleError;
  }

  /**
   * Returns the form's values keyed by each input's `name` attribute,
   * e.g. <input name="link"> and <input name="name"> give
   * { link: "https://...", name: "Mountain house" }.
   * The names in index.html match the API's field names on purpose.
   */
  _getInputValues() {
    return this._inputs.reduce((values, input) => {
      values[input.name] = input.value.trim();
      return values;
    }, {});
  }

  /** Pre-fills inputs whose `name` matches a key in `data`. */
  setInputValues(data) {
    this._inputs.forEach((input) => {
      if (input.name in data) input.value = data[input.name];
    });
  }

  /** Same as Popup.close(), plus clearing the inputs for next time. */
  close() {
    super.close();
    this._form.reset();
  }

  setEventListeners() {
    super.setEventListeners(); // keep the Esc / ✕ / overlay behavior
    this._form.addEventListener("submit", (evt) => {
      evt.preventDefault(); // stop the browser from reloading the page
      renderLoading(this._submitButton, true);
      this._handleSubmit(this._getInputValues())
        .then(() => this.close())
        .catch(this._handleError)
        .finally(() => renderLoading(this._submitButton, false));
    });
  }
}
