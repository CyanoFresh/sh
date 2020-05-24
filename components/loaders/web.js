const express = require('express');
const cors = require('cors');
const Auth = require('../auth');
const Modules = require('../modules');

/**
 * @param {Core} core
 * @constructor
 */
const DBLoader = (core) => {
  core.express = express();

  core.express.use(cors());
  core.express.disable('x-powered-by');
  core.express.use(express.json());

  core.auth = Auth(core);
  core.express.use('/api/auth', core.auth.getRouter());

  core.express.apiRouter = express.Router();
  core.express.apiRouter.use(core.auth.authenticatedMiddleware);

  core.modules = Modules(core);

  core.express.apiRouter.get('/dashboard/:dashboardId', (req, res, next) => {
    const dashboard = core.config.dashboards.find(dashboard => dashboard.id === req.params.dashboardId);

    if (!dashboard) {
      const error = new Error('Dashboard not found');
      error.status = 404;
      return next();
    }

    const responseData = {
      ...JSON.parse(JSON.stringify(dashboard)), // Clone dashboard configuration
      modules: [],
    };

    // Unique array of module ids used by items in this dashboard
    const moduleIDs = [];

    // Replace item_id with config and current state
    for (let i = 0; i < responseData.items.length; i++) {
      const room = responseData.items[i];

      if (!Array.isArray(room.items)) {
        continue;
      }

      for (let j = 0; j < room.items.length; j++) {
        const itemGroup = room.items[j];

        if (!Array.isArray(itemGroup)) {
          continue;
        }

        for (let k = 0; k < itemGroup.length; k++) {
          const itemId = itemGroup[k];
          const item = core.config.items.find(item => item.id === itemId);

          if (!item) {
            console.error(`Item with id '${itemId}' was not found in dashboard '${dashboard.id}'`);

            // Remove item_id
            itemGroup.splice(k, 1);

            continue;
          }

          if (!core.modules.hasOwnProperty(item.module)) {
            console.error(`Invalid module specified for item '${item.id}': ${item.module}`);

            // Remove item_id
            itemGroup.splice(k, 1);

            continue;
          }

          if (moduleIDs.indexOf(item.module) === -1) {
            moduleIDs.push(item.module);
          }

          // Replace the item_id with state and config
          itemGroup[k] = core.modules[item.module].getItemData(item.id);
        }
      }
    }

    // Replace module_id with module config
    for (let i = 0; i < moduleIDs.length; i++) {
      const moduleConfig = core.config.modules.find(module => module.id === moduleIDs[i]);

      if (!moduleConfig.frontend) continue;

      responseData.modules.push(moduleConfig);
    }

    return res.send({
      ok: true,
      ...responseData,
    });
  });

  core.express.apiRouter.get('/dashboards', (req, res) => {
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

  core.express.apiRouter.get('/users', async (req, res, next) => {
    try {
      const users = await core.auth.UserModel.findAll({
        attributes: [
          'id',
          'user_id',
          'name',
        ],
      });

      return res.send({
        ok: true,
        users,
      });
    } catch (e) {
      return next(e);
    }
  });

  core.express.apiRouter.post('/users', async (req, res, next) => {
    if (!req.body.user_id || !req.body.name || !req.body.password) {
      const e = new Error('Wrong parameters');
      e.status = 400;
      return next(e);
    }

    try {
      const user = await core.auth.createUser({
        user_id: req.body.user_id,
        name: req.body.name,
        password: req.body.password,
        api_key: req.body.api_key,
        room_id: req.body.room_id,
      });

      return res.send({
        ok: true,
        user,
      });
    } catch (e) {
      return next(e);
    }
  });

  core.express.apiRouter.get('/users/:userId', async (req, res, next) => {
    try {
      const { userId } = req.params;

      const user = await core.auth.UserModel.findByPk(userId, {
        attributes: [
          'id',
          'user_id',
          'api_key',
          'name',
          'room_id',
          'last_login_at',
        ],
      });

      return res.send({
        ok: true,
        user,
      });
    } catch (e) {
      return next(e);
    }
  });

  core.express.apiRouter.put('/users/:userId', async (req, res, next) => {
    try {
      const { userId } = req.params;
      const data = await core.auth.dataPasswordHash(req.body);

      delete data.user_id;
      delete data.last_login_at;

      const user = await core.auth.UserModel.update(data, {
        where: {
          id: userId,
        },
      });

      return res.send({
        ok: true,
        user,
      });
    } catch (e) {
      return next(e);
    }
  });

  core.express.apiRouter.delete('/users/:userId', async (req, res, next) => {
    try {
      const { userId } = req.params;

      await core.auth.UserModel.destroy({
        where: {
          id: userId,
        },
      });

      await core.auth.UserTokenModel.destroy({
        where: {
          user_id: userId,
        },
      });

      return res.send({
        ok: true,
      });
    } catch (e) {
      return next(e);
    }
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
