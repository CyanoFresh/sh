const Sequelize = require('sequelize');
const moment = require('moment');

const Op = Sequelize.Op;

const HISTORY_CLEAR_INTERVAL = 3 * 3600000;  // every 3 hours
const MAX_HISTORY_DAYS = 3;

class Variable {
  constructor(config, items, core) {
    this.id = 'variable';
    this.name = 'Variable';
    this.core = core;
    this.config = {
      defaultState: {
        value: null,
        lastUpdate: null,
      },
      defaultConfig: {
        color: 'default',
      },
      items,
      ...config,
    };
    this.states = {};

    this.core.aedes.on('publish', ({ topic, payload }) => {
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

    this.core.express.apiRouter.get(`/${this.id}/:itemId/history`, (req, res, next) => {
      const item = this.config.items.find(item => item.id === req.params.itemId);

      if (!item) {
        const err = new Error('Item was not found');
        err.status = 404;
        return next(err);
      }

      const minMoment = moment();

      switch (req.query.period) {
        case '3_days':
          minMoment.subtract(3, 'days');
          break;
        case '24_hours':
          minMoment.subtract(24, 'hours');
          break;
        case '12_hours':
          minMoment.subtract(12, 'hours');
          break;
        case '3_hours':
          minMoment.subtract(3, 'hours');
          break;
        default:
        case '6_hours':
          minMoment.subtract(6, 'hours');
          break;
      }

      return this.Variable
        .findAll({
          where: {
            item_id: item.id,
            date: {
              [Op.gte]: minMoment.unix(),
            },
          },
          order: [
            ['date', 'ASC'],
          ],
          attributes: ['date', 'value'],
        })
        .then(history => res.json({
          ok: true,
          item,
          history,
        }));
    });

    this.Variable = this.core.sequelize.define('variable', {
      item_id: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      value: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      date: {
        type: Sequelize.INTEGER.UNSIGNED,
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

    // Clear old history by interval
    setInterval(() => this.Variable.destroy({
      where: {
        date: {
          [Op.lt]: moment().subtract(MAX_HISTORY_DAYS, 'days').unix(),
        },
      },
    }), HISTORY_CLEAR_INTERVAL);
  }

  onUpdate(itemId, data) {
    // Save to memory
    this.states[itemId].value = data;
    this.states[itemId].lastUpdate = moment().unix();

    // Save to DB
    this.Variable.create({
      item_id: itemId,
      value: data,
      date: moment().unix(),
    });
  }

  initData() {
    this.config.items.forEach(async (item, index) => {
      this.states[item.id] = { ...this.config.defaultState };

      try {
        const lastVariableModel = await this.Variable.findOne({
          where: {
            item_id: item.id,
          },
          order: [
            ['date', 'DESC'],
          ],
        });

        if (lastVariableModel) {
          this.states[item.id].value = lastVariableModel.value;
          this.states[item.id].lastUpdate = lastVariableModel.date;
        }
      } catch (e) {
        return console.error(e);
      }

      // Merge with default config
      this.config.items[index] = {
        ...this.config.defaultConfig,
        ...item,
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

module.exports = (config, items, core) => new Variable(config, items, core);
