const { MODE } = require('./constants');

class Rgb {
  constructor(config, items, core) {
    this.id = 'rgb';
    this.name = 'Rgb';
    this.config = {
      defaultState: { mode: MODE.COLOR, red: 0, green: 0, blue: 0, speed: 100, brightness: 100 },
      items,
      ...config,
    };
    this.states = {};

    this.loadDefaultStates();

    core.aedes.on('publish', ({ topic, payload }) => {
      const [module, itemId, action] = topic.split('/');

      if (module === this.id) {
        try {
          const data = JSON.parse(payload.toString());

          if (action) {
            this.onAction(action, itemId, data);
          } else {
            this.onUpdate(itemId, data);
          }
        } catch (e) {
          return console.error(e);
        }
      }
    });
  }

  onAction(type, itemId, data) {
    if (type === 'set') {
      this.updateState(itemId, data);
    }
  }

  onUpdate(itemId, data) {
    this.updateState(itemId, data);
  }

  updateState(itemId, data) {
    this.states[itemId] = data;
  }

  loadDefaultStates() {
    this.config.items.forEach((item) => {
      this.states[item.id] = this.config.defaultState;
    });
  }

  getState(itemId) {
    return this.states[itemId];
  }
}

module.exports = (config, items, core) => new Rgb(config, items, core);