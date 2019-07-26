class UserData {
  /**
   * @type {string}
   */
  id;
  /**
   * @type {string}
   */
  name;
  /**
   * @type {string}
   */
  token;

  /**
   * @param {string} id
   * @param {string} name
   * @param {string} token
   */
  constructor(id, name, token) {
    this.id = id;
    this.name = name;
    this.token = token;
  }

  static createFromData({ id, name, token }) {
    return new UserData(id, name, token);
  }
}

export default UserData;