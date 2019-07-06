const ws = require('websocket-stream');
const express = require('express');
const cors = require('cors');
const EventEmitter = require('events');
const Aedes = require('aedes');
const Sequelize = require('sequelize');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config = require('./config');
const Auth = require('./utils/auth');
const Modules = require('./utils/modules');

/**
 * @param {Object} config
 * @param {Object} modules
 * @param {Auth} auth
 * @param {express} express
 * @param {Router} apiRouter
 * @param {Aedes} aedes
 * @param {Sequelize} sequelize
 */
class Core extends EventEmitter {
  constructor() {
    super();

    this.config = config;

    this.initDB();
    this.initMQTT();
    this.initWeb();

    this.sequelize.sync();
  }

  initWeb() {
    this.express = express();
    this.express.use(cors());
    this.express.use(express.json());

    this.auth = Auth(this);

    this.express.apiRouter = express.Router();
    this.express.apiRouter.use(this.auth.authenticated);

    this.modules = Modules(this);

    this.express.use('/api', this.express.apiRouter);

    // Error handler
    this.express.all('*', () => {
      const error = new Error('Not found');
      error.status = 404;
      throw error;
    });

    this.express.use((err, req, res, next) => res.status(err.status || 500).send({
      ok: false,
      message: err.message,
      ...err,
    }));
  }

  initMQTT() {
    this.aedes = Aedes();

    this.aedes.authenticate = (client, username, password, callback) => {
      if (!password || !username) {
        console.log(`Auth failed for '${client.id}': ${username}, ${password}`);

        const error = new Error('No credentials provided');
        error.returnCode = 4;
        return callback(error, null);
      }

      client.isDevice = username === '1' || username === 'device';

      const passwordStr = password.toString();

      if (client.isDevice) {
        if (config.devices.find(device => device.id === client.id && device.password === passwordStr)) {
          return callback(null, true);
        }
      } else {
        if (this.auth.authenticate(passwordStr)) {
          return callback(null, true);
        }
      }

      console.log(`Auth failed: ${client.id}, ${username}, ${password}`);

      const error = new Error('Wrong credentials');
      error.returnCode = 4;
      return callback(error, null);
    };

    this.aedes.on('publish', (packet, client) => {
      if (client) {
        console.log(packet.topic, packet.payload.toString(), client.id);
      }
    });

    this.aedes.on('client', client => {
      console.log(`${client.id} connected`);

      let connectedTopic;

      if (client.isDevice) {
        connectedTopic = `devices/${client.id}/online`;

        core.emit('device.connected', client.id);
      } else {
        const [userId] = client.id.split('@');

        connectedTopic = `users/${userId}/online`;

        core.emit('user.connected', userId);
      }

      this.aedes.publish({
        topic: connectedTopic,
        payload: JSON.stringify(true),
      });
    });

    this.aedes.on('subscribe', (subscriptions, client) => {
      if (!client || client.isDevice) {
        return;
      }

      const userTopic = `user/${client.id}`;

      if (subscriptions.find(subscription => subscription.topic === userTopic)) {
        const sendData = {
          dashboard: config.dashboard,
          modules: config.modules,
        };

        // Populate items with current state
        sendData.dashboard.forEach((room, roomIndex) => {
          room.items.forEach((itemGroup, itemGroupIndex) => {
            itemGroup.forEach((item, itemIndex) => {
              const module = core.modules[item.module];

              sendData.dashboard[roomIndex].items[itemGroupIndex][itemIndex] = module.getItemData(item.id);
            });
          });
        });

        // Send only frontend modules
        sendData.modules = sendData.modules.filter(moduleConfig => moduleConfig.frontend);

        client.publish({
          topic: userTopic,
          payload: JSON.stringify(sendData),
        });
      }
    });

    this.aedes.on('clientDisconnect', client => {
      console.log(`${client.id} disconnected`);

      let disconnectedTopic;

      if (client.isDevice) {
        disconnectedTopic = `devices/${client.id}/online`;

        core.emit('device.disconnected', client.id);
      } else {
        const [userId] = client.id.split('@');

        disconnectedTopic = `users/${userId}/online`;

        core.emit('user.disconnected', userId);
      }

      this.aedes.publish({
        topic: disconnectedTopic,
        payload: JSON.stringify(false),
      });
    });
  }

  initDB() {
    this.sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, {
      host: config.db.host,
      port: config.db.port,
      dialect: 'mysql',
    });

    this.sequelize.authenticate()
      .then(() => console.log('DB connected'))
      .catch(err => {
        console.error(err);
        process.exit();
      });
  }
}

const core = new Core();

const httpServer = require('http').createServer();

// Start servers
require('net')
  .createServer(core.aedes.handle)
  .listen(config.ports.MQTT, () => console.log(`MQTT server listening on port ${config.ports.MQTT}`));

ws.createServer({ server: httpServer }, core.aedes.handle);
httpServer.listen(config.ports.MQTT_WS, () => console.log(`Websocket MQTT server listening on port ${config.ports.MQTT_WS}`));

core.express.listen(config.ports.HTTP, () => console.log(`HTTP server listening on port ${config.ports.HTTP}`));