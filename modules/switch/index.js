class Switch {
  constructor(config, items, core) {
    this.id = 'switch';
    this.name = 'Switch';
    this.core = core;
    this.config = {
      defaultState: false,
      items,
      ...config,
    };
    this.states = {};

    this.initData();
    this.initWeb();

    core.aedes.on('publish', ({ topic, payload }) => {
      const [module, itemId, action] = topic.split('/');

      if (module === this.id) {
        try {
          if (!action) {
            this.onUpdate(itemId, JSON.parse(payload.toString()));
          }
        } catch (e) {
          return console.error(e);
        }
      }
    });
  }

  onUpdate(itemId, data) {
    this.states[itemId] = Boolean(data);
  }

  initData() {
    this.config.items.forEach((item) => {
      this.states[item.id] = this.config.defaultState;
    });
  }

  initWeb() {
    this.core.express.apiRouter.post(`/${this.id}/:itemId/toggle`, (req, res, next) => {
      const item = this.config.items.find(item => item.id === req.params.itemId);

      if (!item) {
        const err = new Error('Item was not found');
        err.status = 404;
        return next(err);
      }

      this.core.aedes.publish({
        topic: `${this.id}/${item.id}/toggle`,
        payload: JSON.stringify(''),
      }, () => res.json({
        ok: true,
      }));
    });
  }

  getItemData(itemId) {
    const item = this.config.items.find(item => item.id === itemId);

    return {
      ...item,
      state: this.states[itemId],
    };
  }
}

module.exports = (config, items, core) => new Switch(config, items, core);
