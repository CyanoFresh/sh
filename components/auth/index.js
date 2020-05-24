const crypto = require('crypto');
const express = require('express');
const argon2 = require('argon2');

const UserTokenModel = require('./UserTokenModel');
const UserModel = require('./UserModel');

class Auth {
  constructor(core) {
    /**
     * @type Core
     */
    this.core = core;
    /**
     * @type UserModel
     */
    this.UserModel = UserModel(this.core.sequelize);
    /**
     * @type UserTokenModel
     */
    this.UserTokenModel = UserTokenModel(this.core.sequelize);
    /**
     * user_id => token[]
     * @type {Object.<string, string[]>}
     */
    this.userTokens = {};

    this.authenticatedMiddleware = async (req, res, next) => {
      try {
        const token = Auth.extractTokenFromRequest(req);

        if (await this.authenticate(token)) {
          return next();
        }

        const err = new Error('Unauthorized');
        err.status = 400;
        return next(err);
      } catch (e) {
        return next(e);
      }
    };

    Promise.all([
      this.checkUsers(),
      this.loadTokens(),
    ]);
  }

  async checkUsers() {
    const count = await this.UserModel.count();
    const rootExists = await this.UserModel.count({
      where: {
        user_id: 'root',
      },
    }) > 0;

    if (count === 0 && !rootExists) {
      const rootModel = await this.createUser({
        user_id: 'root',
        name: 'Root',
        password: 'root',
      });

      if (rootModel) {
        console.log('Root user with password \'root\' was created');
      }
    }
  }

  async loadTokens() {
    const userTokenModels = await this.UserTokenModel.findAll();

    userTokenModels.forEach(userTokenModel => {
      if (!this.userTokens[userTokenModel.user_id]) {
        this.userTokens[userTokenModel.user_id] = [];
      }

      this.userTokens[userTokenModel.user_id].push(userTokenModel.token);
    });
  }

  getRouter() {
    const authRouter = express.Router();

    authRouter.post('/login', async (req, res, next) => {
      const { username = '', password } = req.body;

      const user = await this.UserModel.findOne({
        where: {
          user_id: username.toLocaleLowerCase(),
        },
        attributes: ['id', 'user_id', 'password_hash', 'name'],
      });

      if (!user) {
        const err = new Error('Wrong username or password');
        err.status = 401;
        return next(err);
      }

      const passwordVerified = await argon2.verify(user.password_hash, password);

      if (!passwordVerified) {
        const err = new Error('Wrong username or password');
        err.status = 401;
        return next(err);
      }

      const token = await this.generateToken();

      this.UserTokenModel.create({
        user_id: user.user_id,
        token,
      });

      if (!this.userTokens[user.user_id]) {
        this.userTokens[user.user_id] = [];
      }

      this.userTokens[user.user_id].push(token);

      user.update({
        last_login_at: Date.now() / 1000,
      });

      return res.send({
        ok: true,
        user: {
          id: user.user_id,
          name: user.name,
          token,
        },
      });
    });

    authRouter.post('/logout', async (req, res, next) => {
      const token = Auth.extractTokenFromRequest(req);

      const tokenModel = await this.UserTokenModel.findOne({
        where: { token },
      });

      if (!tokenModel) {
        const err = new Error('Token was not found');
        err.status = 401;
        return next(err);
      }

      if (this.userTokens[tokenModel.user_id]) {
        this.userTokens[tokenModel.user_id] = this.userTokens[tokenModel.user_id].filter(token => token !== tokenModel.token)
      }

      const tokenDestroyed = await tokenModel.destroy();

      return res.send({ ok: tokenDestroyed });
    });

    return authRouter;
  }

  /**
   * @param req
   * @returns {string|null}
   */
  static extractTokenFromRequest(req) {
    if (req.headers.authorization) {
      return req.headers.authorization;
    }

    if (req.query.token) {
      return req.query.token;
    }

    if (req.body.token) {
      return req.body.token;
    }

    return null;
  }

  /**
   * @returns {Promise<string>}
   */
  async generateToken() {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(this.core.config.auth.tokenSize, (err, buffer) => {
        if (err) return reject(err);

        const token = buffer.toString('base64');

        return resolve(token);
      });
    });
  }

  /**
   * @param {string} token
   * @returns {boolean}
   */
  async authenticate(token) {
    for (const user_id in this.userTokens) {
      // noinspection JSUnfilteredForInLoop
      if (this.userTokens[user_id].includes(token)) {
        return true;
      }
    }

    const user = await this.UserModel.findOne({
      where: {
        api_key: token,
      },
    });

    return !!user;
  }

  /**
   * Hash password and remove it form object
   * @param data Request data
   * @returns {Promise<Object>}
   */
  async dataPasswordHash(data) {
    const { password, ...restData } = data;

    const hash = await argon2.hash(password);

    return {
      ...restData,
      password_hash: hash,
    };
  }

  /**
   * @param {Object} data
   */
  async createUser(data) {
    const values = await this.dataPasswordHash(data);

    return this.UserModel.create(values);
  }
}

module.exports = (core) => new Auth(core);
