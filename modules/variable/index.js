class Variable {
  constructor(config, items, core) {
    this.id = 'variable';
    this.name = 'Variable';
    this.config = {
      charHistoryCount: 60,
      defaultState: { value: 'N/A' },
      items,
      ...config,
    };
    this.states = {};
    this.chartData = {};

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

    core.apiRouter.get(`/${this.id}/:itemId/chart`, (req, res, next) => {
      const item = this.config.items.find(item => {
        return item.id === req.params.itemId;
      });

      if (!item) {
        const err = new Error('Item was not found');
        err.status = 404;
        return next(err);
      }

      const data = this.chartData[req.params.itemId] || [];

      return res.json({
        ok: true,
        item,
        data,
      });
    });
  }

  onUpdate(itemId, data) {
    this.updateState(itemId, data);

    if (!this.chartData[itemId]) {
      this.chartData[itemId] = [];
    } else if (this.chartData[itemId].length >= this.config.charHistoryCount) {
      this.chartData[itemId].shift();
    }

    const date = new Date();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');

    this.chartData[itemId].push({
      time: `${hours}:${minutes}`,
      value: data,
    });
  }

  updateState(itemId, newState) {
    this.states[itemId] = { value: newState };
  }

  loadDefaultStates() {
    this.config.items.forEach(item => {
      this.states[item.id] = this.config.defaultState;
    });
  }

  getState(itemId) {
    return this.states[itemId];
  }
}

module.exports = (config, items, core) => new Variable(config, items, core);