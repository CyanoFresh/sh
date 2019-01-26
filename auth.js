const config = require('./config');
const crypto = require('crypto');
const express = require('express');
const router = express.Router();

class Auth {
  constructor(core) {
    this.core = core;
    this.tokens = {};

    this.authenticated = (req, res, next) => {
      const token = Auth.extractRequestToken(req);

      if (Object.values(this.tokens).indexOf(token) !== -1) {
        return next();
      }

      const err = new Error('Not authorized');
      err.status = 400;
      next(err);
    };

    router.post('/login', (req, res, next) => {
      const { username, password } = req.body;

      const user = config.users.find(user => user.id.toLowerCase() === username.toLowerCase() && user.password === password);

      if (user) {
        return this.generateToken(user.id)
          .then(() => res.send({
            user: {
              id: user.id,
              name: user.name,
              token: this.tokens[user.id],
            },
          }))
          .catch(e => next(e));
      }

      return res.send({
        user: false,
      });
    });

    router.post('/logout', (req, res, next) => {
      const token = Auth.extractRequestToken(req);
      const user = this.authenticate(token);

      console.log(token, user);

      if (user) {
        delete this.tokens[user.id];

        return res.send({
          success: true,
        });
      }

      return res.send({
        success: false,
      });
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
      crypto.randomBytes(48, (err, buffer) => {
        if (err) return reject(err);

        this.tokens[userId] = buffer.toString('base64');

        return resolve(this.tokens[userId]);
      });
    });
  }

  authenticate(token) {
    const index = Object.values(this.tokens).indexOf(token);

    if (index === -1) {
      return false;
    }

    const userId = Object.keys(this.tokens)[index];

    return config.users.find(user => {
      return user.id === userId;
    });
  }
}

module.exports = (core) => new Auth(core);