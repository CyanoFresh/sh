const crypto = require('crypto');
const express = require('express');
const Sequelize = require('sequelize');

class Auth {
  constructor(core) {
    this.core = core;
    /**
     * {string} userId => {string[]} tokens
     * @type {Object}
     */
    this.tokens = {};

    this.loadDB();
    this.loadWeb();
  }

  loadDB() {
    this.UserTokenModel = this.core.sequelize.define('user_token', {
      user_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      token: {
        type: Sequelize.STRING(),
        allowNull: false,
      },
    }, {
      timestamps: false,
      indexes: [
        {
          fields: ['user_id', 'token'],
        },
      ],
    });

    // Load tokens form DB
    this.UserTokenModel.findAll({}).then(userTokens => {
      userTokens.forEach(userTokenModel => {
        const { user_id, token } = userTokenModel;

        if (!this.tokens.hasOwnProperty(user_id)) {
          this.tokens[user_id] = [];
        }

        this.tokens[user_id].push(token);
      });
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

    router.post('/login', (req, res, next) => {
      const { username = '', password } = req.body;

      const user = this.core.config.users.find(user => user.id.toLowerCase() === username.toLowerCase() && user.password === password);

      if (user) {
        // Generate, save and return token
        this.generateToken(user.id)
          .then(token => res.send({
            ok: true,
            user: {
              id: user.id,
              name: user.name,
              token: token,
            },
          }));

        return;
      }

      const err = new Error('Wrong credentials');
      err.status = 401;
      return next(err);
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

  generateToken(userId) {
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
}

module.exports = (core) => new Auth(core);