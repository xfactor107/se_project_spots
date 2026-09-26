/**
 * Section: renders a list of items into a container element.
 *
 * It doesn't know what a "card" is. It's given a `renderer` function that
 * turns one data object into a DOM element, which in this app is
 * `createCard` from pages/index.js. It also handles the loading skeletons
 * and the "No posts yet" message.
 */
export default class Section {
  /**
   * @param {object} options
   * @param {(item: object) => HTMLElement} options.renderer
   * @param {string} options.emptySelector - element shown when the list is empty
   * @param {string} containerSelector - the list element, e.g. ".cards__list"
   */
  constructor({ renderer, emptySelector }, containerSelector) {
    this._renderer = renderer;
    this._container = document.querySelector(containerSelector);
    this._emptyEl = document.querySelector(emptySelector);
  }

  /**
   * Fills the list with grey pulsing placeholder cards while data loads
   * (styled by .card_skeleton in blocks/card.css).
   */
  showSkeletons(count = 6) {
    const skeletons = Array.from({ length: count }, () => {
      const li = document.createElement("li");
      li.className = "card card_skeleton";
      li.setAttribute("aria-hidden", "true"); // screen readers skip these
      return li;
    });
    this._container.replaceChildren(...skeletons);
    // aria-busy tells assistive tech the list is still loading.
    this._container.setAttribute("aria-busy", "true");
  }

  /** Replaces everything in the list (including skeletons) with `items`. */
  renderItems(items) {
    this._container.replaceChildren(...items.map(this._renderer));
    this._container.setAttribute("aria-busy", "false");
    this.updateEmptyState();
  }

  /** Adds one new item to the *top* of the list (newest first). */
  addItem(item) {
    this._container.prepend(this._renderer(item));
    this.updateEmptyState();
  }

  /** Shows "No posts yet" only when the list has no children. */
  updateEmptyState() {
    this._emptyEl.hidden = this._container.children.length > 0;
  }
}
