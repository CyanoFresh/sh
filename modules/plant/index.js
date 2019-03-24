class Plant {
  constructor(config, items, core) {
    this.id = 'plant';
    this.name = 'Plant';
    this.config = {
      defaultState: {
        moisture: 'N/A',
        minMoisture: 80,
        duration: 10,
      },
      items,
      maxHistorySize: 5,
      ...config,
    };
    this.states = {};
    this.history = {};

    this.loadDefaultStates();

    core.aedes.on('publish', ({ topic, payload }) => {
      const [module, itemId, action] = topic.split('/');

      if (module === this.id) {
        try {
          const data = JSON.parse(payload.toString());

          if (action) {
            return this.onAction(action, itemId, data);
          }

          return this.onUpdate(itemId, data);
        } catch (e) {
          return console.error(e);
        }
      }
    });

    core.apiRouter.get(`/${this.id}/:itemId/history`, (req, res, next) => {
      const item = this.config.items.find(item => item.id === req.params.itemId);

      if (!item) {
        const err = new Error('Item was not found');
        err.status = 404;
        return next(err);
      }

      return res.json({
        ok: true,
        history: this.history[item.id] || [],
      });
    });
  }

  onAction(type, itemId, data) {
    if (type === 'watered') {
      this.addWateredHistory(itemId);
    }
  }

  onUpdate(itemId, data) {
    if (data.moisture) {
      this.states[itemId].moisture = data.moisture;
    }

    if (data.minMoisture) {
      this.states[itemId].minMoisture = data.minMoisture;
    }

    if (data.duration) {
      this.states[itemId].duration = data.duration;
    }
  }

  loadDefaultStates() {
    this.config.items.forEach(item => {
      this.states[item.id] = {
        ...this.config.defaultState,

      };
      this.history[item.id] = [];
    });
  }

  getState(itemId) {
    return this.states[itemId];
  }

  addWateredHistory(itemId) {
    const date = new Date();

    this.history[itemId].unshift(date);

    this.history[itemId] = this.history[itemId].slice(0, this.config.maxHistorySize);
  }
}

module.exports = (config, items, core) => new Plant(config, items, core);