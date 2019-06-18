class Variable {
  constructor(config, items, core) {
    this.id = 'variable';
    this.name = 'Variable';
    this.config = {
      defaultState: {
        value: 'N/A',
        lastUpdate: null,
      },
      defaultConfig: {
        color: 'default',
        historyCount: 20,
      },
      items,
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

          this.onUpdate(itemId, data);
        } catch (e) {
          return console.error(e);
        }
      }
    });

    core.apiRouter.get(`/${this.id}/:itemId/history`, (req, res, next) => {
      const { itemId } = req.params;

      const item = this.config.items.find(item => {
        return item.id === itemId;
      });

      if (!item) {
        const err = new Error('Item was not found');
        err.status = 404;
        return next(err);
      }

      const history = this.history[item.id];

      return res.json({
        ok: true,
        item,
        history,
      });
    });
  }

  onUpdate(itemId, data) {
    this.states[itemId].value = data;
    this.states[itemId].lastUpdate = new Date();

    this._checkHistoryCount(itemId);

    const date = new Date();

    this.history[itemId].push({
      date,
      value: data,
    });
  }

  loadDefaultStates() {
    this.config.items.forEach(item => {
      this.states[item.id] = this.config.defaultState;
      this.history[item.id] = [];
    });
  }

  getState(itemId) {
    return {
      ...this.states[itemId],
    };
  }

  _checkHistoryCount(itemId) {
    if (!this.history[itemId]) {
      this.history[itemId] = [];
      return;
    }

    const item = this.config.items.find(item => item.id === itemId);

    if (this.history[itemId].length >= item.historyCount) {
      this.history[itemId].shift();
    }
  }
}

module.exports = (config, items, core) => new Variable(config, items, core);