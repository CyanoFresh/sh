class Switch {
  constructor(config, items, core) {
    this.id = 'switch';
    this.name = 'Switch';
    this.config = {
      defaultState: false,
      items,
      ...config,
    };
    this.states = {};

    this.loadDefaultStates();

    core.aedes.on('publish', ({ topic, payload }) => {
      const [module, itemId, action] = topic.split('/');

      if (module === this.id) {
        try {
          if (!action) {
            this.onUpdate(itemId, JSON.parse(payload.toString()));
          }
        } catch (e) {
          return console.error(e);
        }
      }
    });
  }

  onUpdate(itemId, data) {
    this.updateState(itemId, data);
  }

  updateState(itemId, newState) {
    this.states[itemId] = newState;
  }

  loadDefaultStates() {
    this.config.items.forEach((item) => {
      this.states[item.id] = this.config.defaultState;
    });
  }

  getState(itemId) {
    return { state: this.states[itemId] };
  }
}

module.exports = (config, items, core) => new Switch(config, items, core);