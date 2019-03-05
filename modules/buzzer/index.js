class Buzzer {
  constructor(config, items, core) {
    this.id = 'buzzer';
    this.name = 'Buzzer';
    this.config = {
      defaultState: { isRinging: false },
      items,
      maxHistorySize: 10,
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
            this.onAction(action, itemId, data);
          }
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
    if (type === 'ringing') {
      this.states[itemId].isRinging = data;

      if (data === true) {
        this.addHistory(itemId, 'ringing');
      }
    } else if (type === 'unlocked') {
      this.states[itemId].isRinging = false;

      this.addHistory(itemId, 'unlocked');
    }
  }

  loadDefaultStates() {
    this.config.items.forEach(item => {
      this.states[item.id] = this.config.defaultState;
      this.history[item.id] = [];
    });
  }

  getState(itemId) {
    return this.states[itemId];
  }

  addHistory(itemId, type) {
    const date = new Date();

    this.history[itemId].unshift({
      date,
      type,
    });

    this.history[itemId] = this.history[itemId].slice(0, this.config.maxHistorySize);
  }
}

module.exports = (config, items, core) => new Buzzer(config, items, core);