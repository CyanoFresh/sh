const express = require('express');
const cors = require('cors');
const Auth = require('../utils/auth');
const Modules = require('../utils/modules');

/**
 * @param {Core} core
 * @constructor
 */
const DBLoader = (core) => {
  core.express = express();

  core.express.use(cors());
  core.express.use(express.json());

  core.auth = Auth(core);
  core.express.use('/api/auth', core.auth.getRouter());

  core.express.apiRouter = express.Router();
  core.express.apiRouter.use(core.auth.authenticatedMiddleware);

  core.modules = Modules(core);

  core.express.apiRouter.get('/dashboard/:dashboardId', (req, res, next) => {
    const { dashboardId } = req.params;
    const dashboard = core.config.dashboards.find(dashboard => dashboard.id === dashboardId);

    if (!dashboard) {
      const error = new Error('Dashboard not found');
      error.status = 404;
      return next();
    }

    const getItemData = (itemId) => {
      const item = core.config.items.find(item => item.id === itemId);

      if (!item) {
        console.error(`Invalid configuration for item '${itemId}'`);
        return null;
      }

      if (!core.modules.hasOwnProperty(item.module)) {
        console.error(`Invalid module specified for item '${item.id}': ${item.module}`);
        return null;
      }

      const itemData = core.modules[item.module].getItemData(item.id);

      return {
        ...itemData,
      };
    };

    const responseData = { ...dashboard };

    // Replace item_id with config and current state
    for (let roomI = 0; roomI < responseData.items.length; roomI++) {
      if (!Array.isArray(responseData.items[roomI].items)) {
        continue;
      }

      for (let itemGroupI = 0; itemGroupI < responseData.items[roomI].items.length; itemGroupI++) {
        if (!Array.isArray(responseData.items[roomI].items[itemGroupI])) {
          continue;
        }

        for (let itemI = 0; itemI < responseData.items[roomI].items[itemGroupI].length; itemI++) {
          const itemId = responseData.items[roomI].items[itemGroupI][itemI];

          const itemData = getItemData(itemId);

          if (!itemData) {
            // Remove item if there is no data for it
            responseData.items[roomI].items[itemGroupI].splice(itemI,1);
          } else {
            responseData.items[roomI].items[itemGroupI][itemI] = itemData;
          }
        }
      }
    }

    return res.send({
      ok: true,
      ...responseData,
    });
  });

  core.express.apiRouter.get('/dashboards', (req, res, next) => {
    const dashboards = [];

    core.config.dashboards.forEach(dashboard => {
      if (!dashboard.displayInMenu) return;

      dashboards.push({
        id: dashboard.id,
        name: dashboard.name,
      });
    });

    return res.send({
      ok: true,
      dashboards,
    });
  });

  core.express.use('/api', core.express.apiRouter);

  // Error handler
  core.express.all('*', () => {
    const error = new Error('Not found');
    error.status = 404;
    throw error;
  });

  core.express.use((err, req, res, next) => res.status(err.status || 500).send({
    ok: false,
    message: err.message,
    ...err,
  }));
};

module.exports = DBLoader;