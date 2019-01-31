class Variable {
  constructor(config, items, core) {
    this.id = 'variable';
    this.name = 'Variable';
    this.config = {
      defaultState: { value: 'N/A' },
      items,
      ...config,
    };
    this.states = {};

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

      return res.json({
        ok: true,
        item: item,
        data: [
          {
            time: '16:00',
            value: 24,
          },
          {
            time: '16:01',
            value: 25,
          },
          {
            time: '16:02',
            value: 24,
          },
          {
            time: '16:03',
            value: 23,
          },
          {
            time: '16:04',
            value: 25,
          },
          {
            time: '16:05',
            value: 28,
          },
          {
            time: '16:06',
            value: 27,
          },
          {
            time: '16:07',
            value: 26,
          },
          {
            time: '16:08',
            value: 25,
          },
          {
            time: '16:09',
            value: 23,
          },
          {
            time: '16:10',
            value: 28,
          },
        ],
      });
    });
  }

  onUpdate(itemId, data) {
    this.updateState(itemId, data);
  }

  updateState(itemId, newState) {
    this.states[itemId] = { value: newState.value };
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