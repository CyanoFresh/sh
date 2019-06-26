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

    this.initData();

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

  initData() {
    this.config.items.forEach((item) => {
      this.states[item.id] = this.config.defaultState;
    });
  }

  getItemData(itemId) {
    const item = this.config.items.find(item => item.id === itemId);

    return {
      ...item,
      ...this.states[itemId],
    };
  }
}

module.exports = (config, items, core) => new MotionSwitch(config, items, core);