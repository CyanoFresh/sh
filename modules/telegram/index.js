const https = require('https');

class Telegram {
  constructor(config, items, core) {
    this.id = 'telegram';
    this.name = 'Telegram';
    this.config = config;
    this.core = core;

    this.subscribeToEvents();
  }

  subscribeToEvents() {
    this.config.rules.forEach(rule => {
      if (typeof rule === 'function') {
        rule(this);
      }
    });
  }

  /**
   * Send a message
   *
   * @param {String} message
   * @param {Number} chatId
   * @param {String} token
   * @param {String} options
   */
  send(message, chatId, token, options) {
    chatId = chatId || this.config.chatId;
    token = token || this.config.token;

    https.get(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}${options}`);
  }
}

module.exports = (config, items, core) => new Telegram(config, items, core);