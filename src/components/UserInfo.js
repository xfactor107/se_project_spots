/**
 * UserInfo: the single place that reads or writes the profile shown on the
 * page (name, description, avatar), plus the current user's id.
 *
 * Other code never touches those elements directly. It goes through
 * getUserInfo() / setUserInfo(), so the selectors live in one place.
 */
export default class UserInfo {
  constructor({ nameSelector, aboutSelector, avatarSelector }) {
    this._nameEl = document.querySelector(nameSelector);
    this._aboutEl = document.querySelector(aboutSelector);
    this._avatarEl = document.querySelector(avatarSelector);
    this._id = null; // filled in once the API responds
  }

  getId() {
    return this._id;
  }

  /**
   * Returns what's currently displayed. The keys match the edit-profile
   * inputs' `name` attributes, so it can go straight into
   * PopupWithForm.setInputValues().
   */
  getUserInfo() {
    return {
      name: this._nameEl.textContent,
      about: this._aboutEl.textContent,
    };
  }

  /**
   * Accepts a user object from the API. Every field is optional, because
   * some endpoints (e.g. the avatar update) are mainly about one field.
   * Only the fields that are present get updated.
   */
  setUserInfo({ name, about, avatar, _id }) {
    if (_id) this._id = _id;
    if (name) {
      this._nameEl.textContent = name;
      this._nameEl.title = name; // full text on hover if it's truncated
    }
    if (about) {
      this._aboutEl.textContent = about;
      this._aboutEl.title = about;
    }
    if (avatar) this._avatarEl.src = avatar;
  }
}
