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
  }

  authenticatedMiddleware(req, res, next) {
    const token = Auth.extractTokenFromRequest(req);

    if (this.authenticate(token)) {
      return next();
    }

    const err = new Error('Not authorized');
    err.status = 400;
    return next(err);
  }

  getRouter() {
    const authRouter = express.Router();

    authRouter.post('/login', async (req, res, next) => {
      const { username = '', password } = req.body;

      const user = await this.UserModel.findOne({
        where: {
          user_id: username.toLocaleLowerCase(),
        },
      });

      if (user) {
        const passwordVerified = await argon2.verify(user.password_hash, password);

        if (!passwordVerified) {
          const err = new Error('Wrong username or password');
          err.status = 401;
          return next(err);
        }

        const token = await this.generateToken();

        await this.UserTokenModel.create({
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          user_id: user.user_id,
          token,
        });

        return res.send({
          ok: true,
          user: {
            id: user.id,
            name: user.name,
            token,
          },
        });
      }

      const err = new Error('Wrong username or password');
      err.status = 401;
      return next(err);
    });

    authRouter.post('/logout', async (req, res, next) => {
      const token = Auth.extractTokenFromRequest(req);

      // Remove from DB
      if (await this.UserTokenModel.destroy({
        where: { token },
      })) {
        return res.send({ ok: true });
      }

      const err = new Error('Token was not found');
      err.status = 401;
      return next(err);
    });

    return authRouter;
  }

  /**
   * @param req
   * @returns {string|boolean}
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

    return false;
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
   * @returns {Promise<Model<any, any>|null>}
   */
  authenticate(token) {
    return this.UserTokenModel.findOne({ where: { token } });
  }

  /**
   * @param {Object} data
   * @returns {Promise<Model<any, any> | void>}
   */
  async createUser(data) {
    const hash = await argon2.hash(data.password);

    const modelData = { ...data };
    delete modelData.password;

    return await this.UserModel.create({
      ...modelData,
      password_hash: hash,
    });
  }
}

module.exports = (core) => new Auth(core);