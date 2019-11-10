if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const ws = require('websocket-stream');
const EventEmitter = require('events');
const config = require('./config');
const DBLoader = require('./components/loaders/db');
const MQTTLoader = require('./components/loaders/mqtt');
const WebLoader = require('./components/loaders/web');

/**
 * @property {Object} config
 * @property {Object<string, Object>} modules
 * @property {Auth} auth
 * @property {Express} express
 * @property {Router} apiRouter
 * @property {aedes.Aedes} aedes
 * @property {Sequelize} sequelize
 */
class Core extends EventEmitter {
  constructor() {
    super();

    this.config = config;

    DBLoader(this);
    MQTTLoader(this);
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
