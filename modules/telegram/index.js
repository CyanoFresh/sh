class Telegram {
  constructor(config, items, core) {
    this.id = 'telegram';
    this.name = 'Telegram';
    this.config = config;

    this.subscribeToEvents();
  }

  subscribeToEvents() {
    this.config.rules.forEach(rule => {

    });
  }
}

module.exports = (config, items, core) => new Telegram(config, items, core);