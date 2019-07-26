const ws = require('websocket-stream');
const EventEmitter = require('events');
const DBLoader = require('./loaders/db');
const MQTTLoader = require('./loaders/mqtt');
const WebLoader = require('./loaders/web');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config = require('./config');

/**
 * @param {Object} config
 * @param {Object} modules
 * @param {Auth} auth
 * @param {Express} express
 * @param {Router} apiRouter
 * @param {Aedes} aedes
 * @param {Sequelize} sequelize
 */
class Core extends EventEmitter {
  constructor() {
    super();

    this.config = config;

    this.sequelize = DBLoader(this);
    this.aedes = MQTTLoader(this);

    WebLoader(this);

    this.sequelize.sync();

    this.emit('core.init');
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