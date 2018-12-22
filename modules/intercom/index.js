class Intercom {
  constructor(config, items, core) {
    this.id = 'intercom';
    this.name = 'Intercom';
    this.config = {
      defaultState: { unlock: false },
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
    if (type === 'unlock') {
      this.updateState(itemId, data);
    }
  }

  onUpdate(itemId, data) {
    this.updateState(itemId, data);
  }

  updateState(itemId, newValue) {
    this.states[itemId] = { value: newValue };
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

module.exports = (config, items, core) => new Intercom(config, items, core);