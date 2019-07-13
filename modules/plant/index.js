const Sequelize = require('sequelize');
const moment = require('moment');

const Op = Sequelize.Op;

const HISTORY_TYPES = {
  WATERED: 'watered',
  SETTINGS_CHANGED: 'settings',
};

const HISTORY_CLEAR_INTERVAL = 6 * 3600000;  // every 6 hours
const MAX_HISTORY_DAYS = 7;

class Plant {
  constructor(config, items, core) {
    this.id = 'plant';
    this.name = 'Plant';
    this.core = core;
    this.config = {
      defaultState: {
        moisture: null,
        minMoisture: 80,
        duration: 10,
      },
      items,
      ...config,
    };
    this.states = {};

    this.HistoryModel = this.core.sequelize.define('plant_history', {
      item_id: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: false,
        get() {
          return this.getDataValue('data') && JSON.parse(this.getDataValue('data'));
        },
        set(value) {
          this.setDataValue('data', JSON.stringify(value));
        },
      },
      date: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
    }, {
      timestamps: false,
      indexes: [
        {
          fields: ['item_id'],
        },
        {
          fields: ['date'],
        },
      ],
    });

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

      return this.HistoryModel.findAll({
        where: {
          item_id: item.id,
        },
        order: [
          ['date', 'ASC'],
        ],
        attributes: ['date', 'data'],
      }).then(history => res.json({
        ok: true,
        item,
        history,
      }));
    });

    setInterval(() => this.HistoryModel.destroy({
      where: {
        date: {
          [Op.lt]: moment().subtract(MAX_HISTORY_DAYS, 'days').unix(),
        },
      },
    }), HISTORY_CLEAR_INTERVAL);
  }

  onAction(type, itemId) {
    if (type === 'watered') {
      // Save to DB
      this.HistoryModel.create({
        item_id: itemId,
        data: {
          type: HISTORY_TYPES.WATERED,
        },
        date: moment().unix(),
      });
    }
  }

  onUpdate(itemId, { moisture, minMoisture = false, duration = false }) {
    if (moisture) {
      this.states[itemId].moisture = moisture;
    }

    const historyData = {
      type: HISTORY_TYPES.SETTINGS_CHANGED,
    };

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

    if (Object.keys(historyData).length > 1) {  // if settings were changed
      // Save to DB
      this.HistoryModel.create({
        item_id: itemId,
        data: historyData,
        date: moment().unix(),
      });
    }
  }

  initData() {
    this.config.items.forEach(async item => {
      const stateFromDb = {};

      try {
        const historyItem = await this.HistoryModel.findOne({
          where: {
            item_id: item.id,
          },
          attributes: ['data'],
          order: [
            ['date', 'DESC'],
          ],
        });

        if (historyItem) {
          const data = historyItem.data;

          if (data.newMoisture) {
            stateFromDb.minMoisture = data.newMoisture;
          }

          if (data.newDuration) {
            stateFromDb.duration = data.newDuration;
          }
        }
      } catch (e) {
      }

      this.states[item.id] = {
        ...this.config.defaultState,
        ...stateFromDb,
      };
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

module.exports = (config, items, core) => new Plant(config, items, core);