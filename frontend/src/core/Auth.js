import UserData from './UserData';

class Auth {
  static storageKey = 'user';

  /**
   * @type WebCore
   */
  core;

  /**
   * @type Storage
   */
  storage;

  /**
   * @type {UserData}
   */
  userData;

  /**
   * @param {WebCore} core
   */
  constructor(core) {
    this.core = core;

    this.loadFromStorage();
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return Boolean(this.userData);
  }

  /**
   * Returns auth token
   * @returns {string}
   */
  getToken() {
    return this.userData && this.userData.token;
  }

  loadFromStorage() {
    let userDataStr;

    if ((userDataStr = localStorage.getItem(Auth.storageKey))) {
      this.storage = localStorage;
    } else if ((userDataStr = sessionStorage.getItem(Auth.storageKey))) {
      this.storage = sessionStorage;
    }

    try {
      const userData = JSON.parse(userDataStr);

      if (userData) {
        this.userData = UserData.createFromData(userData);
      }
    } catch (e) {
      this.userData = null;
    }
  }

  /**
   * @param {string} username
   * @param {string} password
   * @param {boolean} remember
   * @returns {Promise<UserData|null>}
   */
  async login(username, password, remember) {
    const { data } = await this.core.axios.request({
      url: '/auth/login',
      method: 'post',
      data: { username, password, remember },
      responseType: 'json',
    });

    if (data.ok && data.user) {
      this.storage = remember ? localStorage : sessionStorage;
      this.userData = UserData.createFromData(data.user);

      this.storage.setItem(Auth.storageKey, JSON.stringify(this.userData));

      this.core.emit('authenticated', this.userData);

      return this.userData;
    }

    return null;
  }

  /**
   * @param {boolean} revokeToken
   * @returns {Promise<boolean>}
   */
  async signOut(revokeToken = true) {
    const { token } = this.userData;

    this.storage.removeItem(Auth.storageKey);

    this.userData = null;

    try {
      const { data } = await this.core.authenticatedRequest({
        url: 'auth/logout',
        method: 'post',
        responseType: 'json',
      }, token);

      return data.ok;
    } catch (e) {
      return false;
    }
  }
}

export default Auth;