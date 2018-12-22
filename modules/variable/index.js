class Variable {
  constructor(config, items, core) {
    this.id = 'variable';
    this.name = 'Variable';
    this.config = {
      defaultState: { value: 'N/A' },
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

          this.onUpdate(itemId, data);
        } catch (e) {
          return console.error(e);
        }
      }
    });
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

module.exports = (config, items, core) => new Variable(config, items, core);