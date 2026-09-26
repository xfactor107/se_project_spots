/**
 * Card: one post in the grid (photo, title, like button, delete button).
 *
 * How it's used (see createCard in pages/index.js):
 *   const card = new Card(data, "#card-template", { ...handlers });
 *   list.append(card.getView());
 *
 * The Card only builds the element and reports clicks. It never calls the
 * API itself. Instead, index.js passes in handler functions
 * (handleLikeClick, etc.) that do the API work. That keeps this class
 * reusable and easy to follow.
 */
export default class Card {
  /**
   * @param {object} data - a card from the API:
   *   { _id, name, link, isLiked, owner, createdAt }
   * @param {string} templateSelector - the <template> to copy markup from
   * @param {object} options
   * @param {boolean} options.canDelete - show the trash icon?
   * @param {(data: object) => void} options.handleImageClick
   * @param {(card: Card) => void} options.handleLikeClick
   * @param {(card: Card) => void} options.handleDeleteClick
   */
  constructor(
    data,
    templateSelector,
    { canDelete, handleImageClick, handleLikeClick, handleDeleteClick }
  ) {
    this._data = data;
    this._templateSelector = templateSelector;
    this._canDelete = canDelete;
    this._handleImageClick = handleImageClick;
    this._handleLikeClick = handleLikeClick;
    this._handleDeleteClick = handleDeleteClick;
  }

  /**
   * Copies the <li class="card"> out of the <template> in index.html.
   * A <template>'s contents aren't displayed or run until cloned, which
   * makes it a clean way to keep repeatable markup in the HTML file.
   * cloneNode(true) means "deep copy", including all child elements.
   */
  _getTemplate() {
    return document
      .querySelector(this._templateSelector)
      .content.querySelector(".card")
      .cloneNode(true);
  }

  getId() {
    return this._data._id;
  }

  /** The CSS class is the source of truth for whether the heart is filled. */
  isLiked() {
    return this._likeButton.classList.contains("card__like-button_active");
  }

  setLiked(isLiked) {
    // toggle(className, force): adds when force is true, removes when false.
    this._likeButton.classList.toggle("card__like-button_active", isLiked);
    // aria-pressed tells screen readers this is an on/off toggle button.
    this._likeButton.setAttribute("aria-pressed", String(isLiked));
    this._likeButton.setAttribute("aria-label", isLiked ? "Unlike" : "Like");
  }

  /** Removes the card from the page (after the API delete succeeds). */
  remove() {
    this._element.remove();
    this._element = null; // drop the reference so it can be garbage-collected
  }

  _setEventListeners() {
    this._image.addEventListener("click", () =>
      this._handleImageClick(this._data)
    );
    // If the image URL is broken, add a class that shows an
    // "Image unavailable" placeholder instead of a broken-image icon
    // (styled in blocks/card.css).
    this._image.addEventListener("error", () =>
      this._element.classList.add("card_broken")
    );
    // Pass `this` (the whole Card) so the handler can call setLiked(),
    // getId(), remove(), etc.
    this._likeButton.addEventListener("click", () =>
      this._handleLikeClick(this)
    );
    if (this._canDelete) {
      this._deleteButton.addEventListener("click", () =>
        this._handleDeleteClick(this)
      );
    }
  }

  /** Builds and returns the finished <li> element, ready to insert. */
  getView() {
    this._element = this._getTemplate();
    this._image = this._element.querySelector(".card__image");
    this._likeButton = this._element.querySelector(".card__like-button");
    this._deleteButton = this._element.querySelector(".card__delete-button");
    const title = this._element.querySelector(".card__title");

    const { name, link, isLiked } = this._data;
    this._image.src = link;
    this._image.alt = name;
    // textContent (not innerHTML) so user-entered captions can't inject HTML.
    title.textContent = name;
    title.title = name; // full caption on hover when it's cut off with "…"
    this.setLiked(Boolean(isLiked));

    if (!this._canDelete) this._deleteButton.remove();

    this._setEventListeners();
    return this._element;
  }
}
