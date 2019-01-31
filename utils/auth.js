const crypto = require('crypto');
const express = require('express');
const config = require('../config');

const router = express.Router();

class Auth {
  constructor(core) {
    /**
     * {string} userId => {string[]} tokens
     * @type {Object}
     */
    this.tokens = {};

    // Middleware
    this.authenticated = (req, res, next) => {
      const token = Auth.extractRequestToken(req);

      if (this.authenticate(token)) {
        return next();
      }

      const err = new Error('Not authorized');
      err.status = 400;
      return next(err);
    };

    router.post('/login', (req, res, next) => {
      const { username = '', password } = req.body;

      const user = config.users.find(user => user.id.toLowerCase() === username.toLowerCase() && user.password === password);

      if (user) {
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

        return res.send({
          ok: true,
        });
      }

      const err = new Error('Token was not found');
      err.status = 401;
      return next(err);
    });

    core.express.use('/api/auth', router);
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
      crypto.randomBytes(config.auth.tokenSize, (err, buffer) => {
        if (err) return reject(err);

        const token = buffer.toString('base64');

        if (this.tokens.hasOwnProperty(userId)) {
          if (this.tokens[userId].length >= config.auth.maxTokens) {
            this.tokens[userId].shift();
          }

          this.tokens[userId].push(token);
        } else {
          this.tokens[userId] = [token];
        }

        return resolve(token);
      });
    });
  }

  authenticate(token, givenUserId = false) {
    for (const [userId, tokens] of Object.entries(this.tokens)) {
      if (givenUserId && givenUserId !== userId) {
        continue;
      }

      if (tokens.indexOf(token) !== -1) {
        return config.users.find(user => user.id === userId);
      }
    }

    return false;
  }
}

module.exports = (core) => new Auth(core);