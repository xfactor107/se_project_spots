/**
 * Api: every request to the backend goes through this class.
 *
 * Backend: TripleTen's practice REST API ("Around"). Endpoints used:
 *   GET    /users/me            -> current user { _id, name, about, avatar }
 *   PATCH  /users/me            -> update name/about
 *   PATCH  /users/me/avatar     -> update avatar URL
 *   GET    /cards               -> all cards, newest first
 *   POST   /cards               -> create a card { name, link }
 *   DELETE /cards/:id           -> delete a card
 *   PUT    /cards/:id/likes     -> like
 *   DELETE /cards/:id/likes     -> unlike
 *
 * Every method returns a Promise that resolves with the parsed JSON, or
 * rejects with an Error if the server responds with a non-2xx status.
 */
class Api {
  /**
   * @param {object} options
   * @param {string} options.baseUrl - e.g. "https://.../v1" (no trailing slash)
   * @param {object} options.headers - sent with every request (auth token etc.)
   */
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  /**
   * Shared helper behind every public method: adds the base URL and
   * headers, then checks the response.
   *
   * Note: fetch() only rejects on *network* failures. A 404 or 500 still
   * "succeeds", so we check `res.ok` (true for 200-299) ourselves and turn
   * error statuses into a rejected Promise that `.catch()` will see.
   */
  _request(endpoint, options = {}) {
    return fetch(`${this._baseUrl}${endpoint}`, {
      headers: this._headers,
      ...options, // lets callers add method, body, etc.
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }
      return Promise.reject(new Error(`Request failed: ${res.status}`));
    });
  }

  /**
   * Loads everything the page needs on startup, *in parallel*.
   * Resolves with [cards, user], in the same order as the array below.
   */
  getAppInfo() {
    return Promise.all([this.getInitialCards(), this.getUserInfo()]);
  }

  getInitialCards() {
    return this._request("/cards");
  }

  getUserInfo() {
    return this._request("/users/me");
  }

  editUserInfo({ name, about }) {
    return this._request("/users/me", {
      method: "PATCH", // PATCH = update some fields of an existing resource
      body: JSON.stringify({ name, about }),
    });
  }

  editAvatarInfo({ avatar }) {
    return this._request("/users/me/avatar", {
      method: "PATCH",
      body: JSON.stringify({ avatar }),
    });
  }

  addCard({ name, link }) {
    return this._request("/cards", {
      method: "POST", // POST = create something new
      body: JSON.stringify({ name, link }),
    });
  }

  deleteCard(id) {
    return this._request(`/cards/${id}`, { method: "DELETE" });
  }

  /**
   * Like and unlike share one URL; only the HTTP method differs
   * (PUT to add the like, DELETE to remove it). Resolves with the updated
   * card, whose `isLiked` is the server's final answer.
   */
  changeLikeStatus(id, shouldLike) {
    return this._request(`/cards/${id}/likes`, {
      method: shouldLike ? "PUT" : "DELETE",
    });
  }
}

export default Api;
