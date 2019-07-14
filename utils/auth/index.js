const crypto = require('crypto');
const express = require('express');
const argon2 = require('argon2');

const UserTokenModel = require('./UserTokenModel');
const UserModel = require('./UserModel');

class Auth {
  constructor(core) {
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
     * {string} userId => {string[]} tokens
     * @type {Object}
     * @deprecated should be removed in next version
     */
    this.tokens = {};

    this.loadTokens();
    this.loadWeb();
  }

  /**
   * @deprecated
   */
  async loadTokens() {
    // Load tokens to memory form DB
    const userTokens = await this.UserTokenModel.findAll();

    userTokens.forEach(userTokenModel => {
      const { user_id, token } = userTokenModel;

      if (!this.tokens.hasOwnProperty(user_id)) {
        this.tokens[user_id] = [];
      }

      this.tokens[user_id].push(token);
    });
  }

  loadWeb() {
    this.authenticated = (req, res, next) => {
      const token = Auth.extractRequestToken(req);

      if (this.authenticate(token)) {
        return next();
      }

      const err = new Error('Not authorized');
      err.status = 400;
      return next(err);
    };

    const router = express.Router();

    router.post('/login', async (req, res, next) => {
      const { username = '', password } = req.body;

      try {
        const user = await this.UserModel.findOne({
          where: {
            user_id: username.toLocaleLowerCase(),
          },
        });

        if (user) {
          if (!Auth.verifyPassword(user.password_hash, password)) {
            const err = new Error('Wrong username or password');
            err.status = 401;
            return next(err);
          }


          const userTokenModel = await this.UserTokenModel.create({
            user_id: user.user_id,
          });

          // Generate, save and return auth token
          return this.generateToken(user.id).then(token => res.send({
            ok: true,
            user: {
              id: user.id,
              name: user.name,
              token,
            },
          }));
        }

        const err = new Error('Wrong username or password');
        err.status = 401;
        return next(err);
      } catch (e) {
        return next(e);
      }
    });

    router.post('/logout', (req, res, next) => {
      const token = Auth.extractRequestToken(req);
      const user = this.authenticate(token);

      if (user) {
        // Remove from memory
        this.tokens[user.id] = this.tokens[user.id].filter(value => value !== token);

        // Remove from DB
        this.UserTokenModel.destroy({
          where: {
            user_id: user.id,
            token,
          },
        });

        return res.send({
          ok: true,
        });
      }

      const err = new Error('Token was not found');
      err.status = 401;
      return next(err);
    });

    this.core.express.use('/api/auth', router);
  }

  static extractRequestToken(req) {
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

  async generateToken(userId) {
    const userTokenModel = await this.UserTokenModel.create({

    });
    return new Promise((resolve, reject) => {
      crypto.randomBytes(this.core.config.auth.tokenSize, (err, buffer) => {
        if (err) return reject(err);

        const token = buffer.toString('base64');

        if (this.tokens.hasOwnProperty(userId)) {
          if (this.tokens[userId].length >= this.core.config.auth.maxTokens) {
            const token = this.tokens[userId].shift();

            this.UserTokenModel.destroy({
              where: {
                user_id: userId,
                token,
              },
            });
          }

          this.tokens[userId].push(token);
        } else {
          this.tokens[userId] = [token];
        }

        this.UserTokenModel.create({
          user_id: userId,
          token,
        });

        return resolve(token);
      });
    });
  }

  authenticate(token, givenUserId) {
    for (const [userId, tokens] of Object.entries(this.tokens)) {
      if (givenUserId && givenUserId !== userId) {
        continue;
      }

      if (tokens.indexOf(token) !== -1) {
        return this.core.config.users.find(user => user.id === userId);
      }
    }

    return false;
  }

  async createUser(data) {
    const hash = await argon2.hash(data.password);

    const modelData = { ...data };

    delete modelData.password;

    return this.UserModel.create({
      ...modelData,
      password_hash: hash,
    });
  }

  static verifyPassword(hash, password) {
    return argon2.verify(hash, password);
  }
}

module.exports = (core) => new Auth(core);