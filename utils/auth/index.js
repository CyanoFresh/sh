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

    this.checkUsers();

    this.authenticatedMiddleware = async (req, res, next) => {
      try {
        const token = Auth.extractTokenFromRequest(req);
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        if (await this.authenticate(token, ip)) {
          return next();
        }

        const err = new Error('Unauthorized');
        err.status = 400;
        return next(err);
      } catch (e) {
        return next(e);
      }
    };

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
        password: 'root',
      });

      if (rootModel) {
        console.log('Root user with password \'root\' was created');
      }
    }
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
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      const userTokenModel = await this.UserTokenModel.create({
        user_id: user.user_id,
        token,
        ip,
      });

      if (!userTokenModel) {
        return next(new Error('Cannot save token'));
      }

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

      const tokenRemoved = await this.UserTokenModel.destroy({
        where: { token },
      });

      if (tokenRemoved) {
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
   * @param {string} [ip]
   * @returns {Promise<boolean>}
   */
  async authenticate(token, ip) {
    const userTokenModel = await this.UserTokenModel.findOne({ where: { token } });

    if (!userTokenModel) {
      return false;
    }

    if (ip && ip !== userTokenModel.ip) {
      return false;
    }

    return true;
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