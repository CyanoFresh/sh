const HISTORY_TYPES = {
  WATERED: 'watered',
  SETTINGS_CHANGED: 'settings',
};

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
      maxHistorySize: 7,
      ...config,
    };
    this.states = {};
    this.history = {};

    this.initData();

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

    core.express.apiRouter.get(`/${this.id}/:itemId/history`, (req, res, next) => {
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
      this.addHistory(itemId, HISTORY_TYPES.WATERED);
    }
  }

  onUpdate(itemId, { moisture, minMoisture, duration }) {
    if (moisture) {
      this.states[itemId].moisture = moisture;
    }

    const historyData = {};

    if (minMoisture && this.states[itemId].minMoisture !== minMoisture) {
      historyData.oldMoisture = this.states[itemId].minMoisture;
      historyData.newMoisture = minMoisture;

      this.states[itemId].minMoisture = minMoisture;
    }

    if (duration && this.states[itemId].duration !== duration) {
      historyData.oldDuration = this.states[itemId].duration;
      historyData.newDuration = duration;

      this.states[itemId].duration = duration;
    }

    if (Object.keys(historyData).length) {
      this.addHistory(itemId, HISTORY_TYPES.SETTINGS_CHANGED, historyData);
    }
  }

  initData() {
    this.config.items.forEach(item => {
      this.states[item.id] = {
        ...this.config.defaultState,
      };
      this.history[item.id] = [];
    });
  }

  getItemData(itemId) {
    const item = this.config.items.find(item => item.id === itemId);

    return {
      ...item,
      ...this.states[itemId],
    };
  }

  addHistory(itemId, type, data) {
    const date = new Date();

    this.history[itemId].unshift({
      type,
      date,
      ...data,
    });

    this.history[itemId] = this.history[itemId].slice(0, this.config.maxHistorySize);
  }
}

module.exports = (config, items, core) => new Plant(config, items, core);