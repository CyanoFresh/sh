const HISTORY_RANGE = {
  ONE_HOUR: 1,
  THREE_HOURS: 3,
  TWELVE_HOURS: 12,
  DAY: 24,
};

class Variable {
  constructor(config, items, core) {
    this.id = 'variable';
    this.name = 'Variable';
    this.config = {
      historyCount: 20,
      defaultState: { value: 'N/A' },
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
      const item = this.config.items.find(item => {
        return item.id === req.params.itemId;
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
    this.updateState(itemId, data);

    this._checkHistoryCount(itemId);

    const date = new Date();

    this.history[itemId].push({
      date,
      value: data,
    });
  }

  updateState(itemId, newState) {
    this.states[itemId] = { value: newState };
  }

  loadDefaultStates() {
    this.config.items.forEach(item => {
      this.states[item.id] = this.config.defaultState;
      this.history[item.id] = [];
    });
  }

  getState(itemId) {
    return {
      historyCount: this._getHistoryCount(itemId),
      ...this.states[itemId],
    };
  }

  _checkHistoryCount(itemId) {
    if (!this.history[itemId]) {
      this.history[itemId] = [];
      return;
    }

    const historyCount = this._getHistoryCount(itemId);

    if (this.history[itemId].length >= historyCount) {
      this.history[itemId].shift();
    }
  }

  _getHistoryCount(itemId) {
    const item = this.config.items.find(item => item.id === itemId);

    let historyCount = this.config.historyCount;

    if (item && item.hasOwnProperty('historyCount')) {
      historyCount = item.historyCount;
    }

    return historyCount;
  }
}

module.exports = (config, items, core) => new Variable(config, items, core);