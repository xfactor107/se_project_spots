/**
 * App-wide settings, kept in one place so they're easy to find and change.
 */

/**
 * Selectors and class names used by FormValidator. Keeping these here (not
 * hard-coded in the class) means the validator could work with different
 * markup just by passing a different config.
 */
export const validationSettings = {
  formSelector: ".modal__form",
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__button",
  inactiveButtonClass: "modal__button_disabled", // greyed-out submit button
  inputErrorClass: "modal__input_type_error", // red input border
  errorClass: "modal__error_visible", // added to the error message <span>
};

/**
 * Backend connection settings, passed to `new Api(apiConfig)`.
 */
export const apiConfig = {
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    // Public, course-issued demo token. There is no private backend here,
    // so anything shipped to the browser is visible to users anyway.
    // (See "Design notes & limitations" in the README.)
    authorization: "73b45784-19b2-4053-852d-56fa72f710be",
    // Tells the server our request bodies are JSON.
    "Content-Type": "application/json",
  },
};

// Where the starter photos are hosted (TripleTen's S3 bucket).
const IMAGE_BASE =
  "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots";

/**
 * Starter posts. These are *not* rendered directly. If the API returns no
 * cards, seedInitialCards() in pages/index.js POSTs these to the server so
 * the demo never loads as an empty page. They're displayed in this order.
 */
export const initialCards = [
  {
    name: "Val Thorens",
    link: `${IMAGE_BASE}/1-photo-by-moritz-feldmann-from-pexels.jpg`,
  },
  {
    name: "Restaurant terrace",
    link: `${IMAGE_BASE}/2-photo-by-ceiline-from-pexels.jpg`,
  },
  {
    name: "An outdoor cafe",
    link: `${IMAGE_BASE}/3-photo-by-tubanur-dogan-from-pexels.jpg`,
  },
  {
    name: "A long bridge over the forest",
    link: `${IMAGE_BASE}/4-photo-by-maurice-laschet-from-pexels.jpg`,
  },
  {
    name: "Tunnel with morning light",
    link: `${IMAGE_BASE}/5-photo-by-van-anh-nguyen-from-pexels.jpg`,
  },
  {
    name: "Mountain house",
    link: `${IMAGE_BASE}/6-photo-by-moritz-feldmann-from-pexels.jpg`,
  },
];
