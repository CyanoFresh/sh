class MotionSwitch {
  constructor(config, items, core) {
    this.id = 'motion-switch';
    this.name = 'MotionSwitch';
    this.config = {
      defaultState: {
        state: false,
        motionEnabled: false,
      },
      items,
      ...config,
    };
    this.states = {};

    this.loadDefaultStates();

    core.aedes.on('publish', ({ topic, payload }) => {
      const [module, itemId, ...rest] = topic.split('/');

      if (module === this.id) {
        try {
          const data = JSON.parse(payload.toString());

          if (!rest.length) {
            this.states[itemId] = {
              state: data,
            };
          } else if (topic.endsWith('/motion')) {
            this.states[itemId] = {
              motionEnabled: data,
            };
          }
        } catch (e) {
          return console.error(e);
        }
      }
    });
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

module.exports = (config, items, core) => new MotionSwitch(config, items, core);