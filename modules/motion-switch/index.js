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
  }

  onMessage(params, payload) {
    const [itemId, action] = params;

    const data = JSON.parse(payload);

    if (action === 'motion') {
      this.states[itemId].motionEnabled = data;
    } else {
      this.states[itemId].state = data;
    }
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
