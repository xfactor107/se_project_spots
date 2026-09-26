/**
 * Entry point for the Spots app.
 *
 * Webpack starts bundling from this file (see `entry` in webpack.config.js).
 * Its only job is to *wire things together*: it creates one instance of each
 * UI class from src/components/, tells them what to do when the user acts,
 * and loads the initial data from the API. The actual behavior lives in the
 * classes themselves, so if you're looking for how something works, jump to
 * the matching file in src/components/.
 *
 * Reading order that makes the most sense:
 *   1. Setup (API, toast, user info)
 *   2. Form validation
 *   3. Popups (modals)
 *   4. Cards
 *   5. Button click handlers
 *   6. Init: the first API request when the page loads
 */

// Importing the CSS here lets webpack bundle it (via css-loader +
// MiniCssExtractPlugin) into a single stylesheet in dist/.
import "./index.css";

import Api from "../utils/Api.js";
import Card from "../components/Card.js";
import FormValidator from "../components/FormValidator.js";
import PopupWithConfirmation from "../components/PopupWithConfirmation.js";
import PopupWithForm from "../components/PopupWithForm.js";
import PopupWithImage from "../components/PopupWithImage.js";
import Section from "../components/Section.js";
import Toast from "../components/Toast.js";
import UserInfo from "../components/UserInfo.js";
import {
  apiConfig,
  initialCards,
  validationSettings,
} from "../utils/constants.js";

/* ---------- Setup ---------- */

// One shared API client for every request (base URL + auth headers).
const api = new Api(apiConfig);

// The small pill that slides up from the bottom of the screen with errors.
const toast = new Toast(".toast");

// Owns the profile name/description/avatar on the page, and remembers the
// current user's id (needed to decide which cards the user may delete).
const userInfo = new UserInfo({
  nameSelector: ".profile__name",
  aboutSelector: ".profile__description",
  avatarSelector: ".profile__avatar",
});

// Keep the footer's copyright year current without editing the HTML yearly.
document.querySelector(".footer__year").textContent = new Date().getFullYear();

/**
 * Builds an error handler for a `.catch()`. It logs the real error for
 * developers and shows a friendly message to the user.
 *
 * Usage: `somePromise.catch(handleError("Couldn't save."))`
 * This is a "function that returns a function" so we can choose the message
 * up front and let `.catch()` pass in the error later.
 */
function handleError(message = "Something went wrong. Please try again.") {
  return (err) => {
    console.error(err);
    toast.show(message);
  };
}

/* ---------- Form validation ---------- */

// One FormValidator per <form> on the page, stored by the form's `name`
// attribute so we can look them up later, e.g. formValidators["new-post"].
const formValidators = {};

Array.from(document.forms).forEach((form) => {
  const validator = new FormValidator(validationSettings, form);
  validator.enableValidation();
  // Gotcha: we use getAttribute("name") instead of `form.name`. Forms expose
  // their inputs as properties, so on the edit-profile form (which has an
  // <input name="name">) `form.name` returns that input, not the string.
  formValidators[form.getAttribute("name")] = validator;
});

/* ---------- Popups (modals) ---------- */
// Each popup is tied to one modal element in index.html by its id.
// `handleSubmit` must return a Promise. The popup shows "Saving...", waits
// for it, closes itself on success and calls `handleError` on failure.

const imagePopup = new PopupWithImage("#preview-modal");

const deletePopup = new PopupWithConfirmation("#delete-modal", {
  handleError: handleError("Couldn't delete the post. Please try again."),
});

// `values` is an object built from the form inputs' `name` attributes,
// e.g. { name: "Bessie", about: "Civil Aviator" }. That matches exactly
// what the API expects, so we can pass it straight through.
const profilePopup = new PopupWithForm("#edit-profile-modal", {
  handleSubmit: (values) =>
    api.editUserInfo(values).then((user) => userInfo.setUserInfo(user)),
  handleError: handleError(),
});

const avatarPopup = new PopupWithForm("#edit-avatar-modal", {
  handleSubmit: (values) =>
    api.editAvatarInfo(values).then((user) => userInfo.setUserInfo(user)),
  handleError: handleError(),
});

const newPostPopup = new PopupWithForm("#new-post-modal", {
  handleSubmit: (values) =>
    // The server responds with the saved card (including its new _id),
    // which we render at the top of the list.
    api.addCard(values).then((card) => cardSection.addItem(card)),
  handleError: handleError(),
});

// Attach close/submit listeners once. (Doing this inside open() would stack
// up duplicate listeners every time a modal opened.)
[imagePopup, deletePopup, profilePopup, avatarPopup, newPostPopup].forEach(
  (popup) => popup.setEventListeners()
);

/* ---------- Cards ---------- */

/**
 * Called by a Card when its heart is clicked.
 *
 * Uses an "optimistic update": the heart changes *immediately* so the UI
 * feels instant, then we confirm with the server. If the request fails,
 * we undo the change and tell the user.
 */
function handleLikeClick(card) {
  const shouldLike = !card.isLiked();
  card.setLiked(shouldLike);
  api
    .changeLikeStatus(card.getId(), shouldLike)
    .then((res) => card.setLiked(res.isLiked)) // trust the server's answer
    .catch((err) => {
      card.setLiked(!shouldLike); // roll back
      handleError("Couldn't update like. Please try again.")(err);
    });
}

/**
 * Called by a Card when its trash icon is clicked. Nothing is deleted yet:
 * we open the "Delete this post?" modal and hand it the action to run if
 * the user confirms.
 */
function handleDeleteClick(card) {
  deletePopup.open(() =>
    api.deleteCard(card.getId()).then(() => {
      card.remove();
      cardSection.updateEmptyState(); // show "No posts yet" if it was the last
    })
  );
}

/**
 * Turns one card object from the API into a ready-to-insert <li> element.
 * Section calls this for every card it renders.
 */
function createCard(data) {
  const userId = userInfo.getId();
  const card = new Card(data, "#card-template", {
    // Only show the trash icon on the current user's own posts. (With the
    // shared demo account every post is "ours", but this keeps it correct.)
    canDelete: !data.owner || !userId || data.owner === userId,
    handleImageClick: (cardData) => imagePopup.open(cardData),
    handleLikeClick,
    handleDeleteClick,
  });
  return card.getView();
}

// Manages the <ul class="cards__list">: rendering, loading placeholders,
// and the "No posts yet" message.
const cardSection = new Section(
  { renderer: createCard, emptySelector: ".cards__empty" },
  ".cards__list"
);

/**
 * Re-creates the starter posts when the account has none.
 *
 * Why: every visitor shares one demo account, so anyone can delete all the
 * posts. Without this the live site would load as an empty page.
 *
 * How: the server lists newest posts first, so we post the cards in
 * *reverse* order, one after another (not in parallel), so they end up
 * displayed in the same order as `initialCards`. The `reduce` builds a
 * chain: Promise -> addCard(6th) -> addCard(5th) -> ... and collects the
 * created cards into an array.
 */
function seedInitialCards() {
  return initialCards
    .slice() // copy first, because reverse() mutates the array in place
    .reverse()
    .reduce(
      (chain, card) =>
        chain.then((created) =>
          api.addCard(card).then((res) => [res, ...created])
        ),
      Promise.resolve([])
    );
}

/* ---------- Buttons that open popups ---------- */

document
  .querySelector(".profile__edit-button")
  .addEventListener("click", () => {
    // Pre-fill the form with what's currently on the page.
    profilePopup.setInputValues(userInfo.getUserInfo());
    // Clear any leftover error messages from the last time it was open.
    formValidators["edit-profile"].resetValidation();
    profilePopup.open();
  });

document.querySelector(".profile__add-button").addEventListener("click", () => {
  formValidators["new-post"].resetValidation();
  newPostPopup.open();
});

document
  .querySelector(".profile__avatar-edit-btn")
  .addEventListener("click", () => {
    formValidators["edit-avatar"].resetValidation();
    avatarPopup.open();
  });

/* ---------- Init: runs once when the page loads ---------- */

// Show grey placeholder boxes while we wait for the API.
cardSection.showSkeletons();

// getAppInfo() fetches the cards and the user at the same time
// (Promise.all), then gives us both results as an array: [cards, user].
api
  .getAppInfo()
  .then(([cards, user]) => {
    userInfo.setUserInfo(user);
    // Returning a Promise from .then() makes the next .then() wait for it,
    // so seeding finishes before we render.
    return cards.length ? cards : seedInitialCards();
  })
  .then((cards) => cardSection.renderItems(cards))
  .catch((err) => {
    cardSection.renderItems([]); // replace the skeletons with the empty state
    handleError("Couldn't load posts. Check your connection and refresh.")(err);
  });
