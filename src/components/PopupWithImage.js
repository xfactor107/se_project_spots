/**
 * PopupWithImage: the full-size preview shown when a card's photo is
 * clicked. It just fills in the image and caption, then opens.
 */
import Popup from "./Popup.js";

export default class PopupWithImage extends Popup {
  constructor(selector) {
    super(selector);
    this._image = this._popup.querySelector(".modal__image");
    this._caption = this._popup.querySelector(".modal__caption");
  }

  /** @param {{ name: string, link: string }} card - the clicked card's data */
  open({ name, link }) {
    this._image.src = link;
    this._image.alt = name; // alt text for screen readers
    this._caption.textContent = name;
    super.open();
  }
}
