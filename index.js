const ws = require('websocket-stream');
const express = require('express');
const cors = require('cors');
const config = require('./config');

const httpServer = require('http').createServer();
const aedes = require('aedes')();
const app = express();

const MQTTPort = 1883;
const WSPort = 8888;
const HTTPPort = 80;

const core = {
  modules: {},
  aedes,
  config,
  express: app,
};

app.use(cors());
app.use(express.json());

const auth = require('./auth')(core);

// Load modules
core.config.modules.forEach((moduleConfig) => {
  let moduleItems = [];

  core.config.dashboard.forEach(room => room.items.forEach(itemGroup => {
    moduleItems = [
      ...moduleItems,
      ...itemGroup.filter(item => item.module === moduleConfig.id),
    ];
  }));

  // Load module
  try {
    if (moduleConfig.local) {
      core.modules[moduleConfig.id] = require(`./modules/${moduleConfig.id}`)(moduleConfig, moduleItems, core);
    }

    console.log(`Module ${moduleConfig.id} loaded`);
  } catch (e) {
    console.log(`Module ${moduleConfig.id} not loaded`);
  }
});

// HTTP
app.get(
  '/api/state',
  auth.authenticated,
  (req, res) => {
    const sendState = {
      dashboard: config.dashboard,
      modules: config.modules,
    };

    // Merge items config with state
    sendState.dashboard.forEach((room, roomIndex) => {
      room.items.forEach((itemGroup, itemGroupIndex) => {
        itemGroup.forEach((item, itemIndex) => {
          const module = core.modules[item.module];

          sendState.dashboard[roomIndex].items[itemGroupIndex][itemIndex] = {
            ...item,
            ...module.getState(item.id),
          };
        });
      });
    });

    return res.send(sendState);
  },
);

app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({
    success: false,
    message: err.message,
    ...err,
  });
});

// MQTT logic:
aedes.authenticate = (client, username, password, callback) => {
  client.isDevice = username === '1';

  if (client.isDevice) {
    return callback(null, true);
  } else {
    console.log('auth:', client.id, password.toString());

    if (auth.authenticate(password.toString())) {
      return callback(null, true);
    }

    const error = new Error('Auth error');

    error.returnCode = 4;

    return callback(error, null);
  }
};

aedes.on('publish', (packet, client) => {
  if (client) {
    console.log(packet.topic, packet.payload.toString(), client.id);
  }
});

aedes.on('client', (client) => {
  if (client.isDevice) {
    aedes.publish({
      topic: `devices/${client.id}/set`,
      payload: JSON.stringify({}),
    });
  }
});

const mqttServer = require('net').createServer(aedes.handle);

// Start servers
mqttServer.listen(MQTTPort, () => console.log('MQTT server listening on port', MQTTPort));

app.listen(HTTPPort, () => console.log(`HTTP listening on port 8080!`));

ws.createServer({
  server: httpServer,
}, aedes.handle);

httpServer.listen(WSPort, function() {
  console.log('websocket server listening on port', WSPort);
});