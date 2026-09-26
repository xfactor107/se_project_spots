/**
 * FormValidator: live validation for one <form>.
 *
 * It relies on the browser's built-in HTML validation. The rules live in
 * index.html as attributes (required, minlength, maxlength, type="url"),
 * and the browser writes the error text for us (`input.validationMessage`,
 * e.g. "Please enter a URL."). This class only *displays* those results
 * nicely and keeps the submit button disabled until everything is valid.
 *
 * The forms have `novalidate` in the HTML, which turns off the browser's
 * default error bubbles so we can show our own inline messages instead.
 *
 * Naming convention it depends on: each input's error <span> must have the
 * id `<input id>-error`, e.g. #card-image-input -> #card-image-input-error.
 */
export default class FormValidator {
  /**
   * @param {object} config - selectors and class names (validationSettings
   *   in utils/constants.js)
   * @param {HTMLFormElement} formEl
   */
  constructor(config, formEl) {
    this._config = config;
    this._form = formEl;
    this._inputs = Array.from(formEl.querySelectorAll(config.inputSelector));
    this._submitButton = formEl.querySelector(config.submitButtonSelector);
  }

  _getErrorEl(input) {
    return this._form.querySelector(`#${input.id}-error`);
  }

  _showInputError(input) {
    const errorEl = this._getErrorEl(input);
    errorEl.textContent = input.validationMessage;
    errorEl.classList.add(this._config.errorClass);
    input.classList.add(this._config.inputErrorClass); // red border
    // Screen readers: mark the field invalid and link it to its message
    // so the error is read aloud when the field is focused.
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", errorEl.id);
  }

  _hideInputError(input) {
    const errorEl = this._getErrorEl(input);
    errorEl.textContent = "";
    errorEl.classList.remove(this._config.errorClass);
    input.classList.remove(this._config.inputErrorClass);
    input.removeAttribute("aria-invalid");
  }

  _checkInputValidity(input) {
    // `validity.valid` is computed by the browser from the HTML attributes.
    if (input.validity.valid) {
      this._hideInputError(input);
    } else {
      this._showInputError(input);
    }
  }

  _hasInvalidInput() {
    return this._inputs.some((input) => !input.validity.valid);
  }

  _disableButton() {
    this._submitButton.disabled = true;
    this._submitButton.classList.add(this._config.inactiveButtonClass);
  }

  _toggleButtonState() {
    if (this._hasInvalidInput()) {
      this._disableButton();
    } else {
      this._submitButton.disabled = false;
      this._submitButton.classList.remove(this._config.inactiveButtonClass);
    }
  }

  /**
   * Call right before opening a form's popup. It clears old error messages
   * and sets the button to match the current values: disabled for an empty
   * "New post" form, enabled for a pre-filled "Edit profile" form.
   */
  resetValidation() {
    this._inputs.forEach((input) => this._hideInputError(input));
    this._toggleButtonState();
  }

  /** Call once per form when the page loads. */
  enableValidation() {
    this._toggleButtonState();
    this._inputs.forEach((input) => {
      // "input" fires on every keystroke/paste, so feedback is immediate.
      input.addEventListener("input", () => {
        this._checkInputValidity(input);
        this._toggleButtonState();
      });
    });
  }
}
