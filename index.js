const ws = require('websocket-stream');
const express = require('express');
const cors = require('cors');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config = require('./config');
const items = require('./utils/items');

const httpServer = require('http').createServer();
const aedes = require('aedes')();
const app = express();

const core = {
  modules: {},
  aedes,
  config,
  express: app,
};

app.use(cors());
app.use(express.json());

const auth = require('./utils/auth')(core);

// HTTP
core.apiRouter = express.Router();

core.apiRouter.use(auth.authenticated);

core.apiRouter.get('/state', (req, res) => {
  const response = {
    ok: true,
    dashboard: config.dashboard,
    modules: config.modules,
  };

  // Fill items with current state
  response.dashboard.forEach((room, roomIndex) => {
    room.items.forEach((itemGroup, itemGroupIndex) => {
      itemGroup.forEach((item, itemIndex) => {
        const module = core.modules[item.module];

        response.dashboard[roomIndex].items[itemGroupIndex][itemIndex] = {
          ...item,
          ...module.getState(item.id),
        };
      });
    });
  });

  // Remove only backend modules
  response.modules = response.modules.filter(moduleConfig => moduleConfig.frontend);

  return res.send(response);
});

require('./utils/modules')(core);

app.use('', core.apiRouter);

// Error handler
app.all('*', () => {
  const error = new Error('Not found');
  error.status = 404;
  throw error;
});
app.use((err, req, res, next) => res.status(err.status || 500).send({
  ok: false,
  message: err.message,
  ...err,
}));

// MQTT logic:
aedes.authenticate = (client, username, password, callback) => {
  if (!password || !username) {
    console.log(`Auth failed: ${client.id}, ${username}, ${password}`);

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
    if (auth.authenticate(passwordStr)) {
      return callback(null, true);
    }
  }

  console.log(`Auth failed: ${client.id}, ${username}, ${password}`);

  const error = new Error('Wrong credentials');
  error.returnCode = 4;
  return callback(error, null);
};

aedes.on('publish', (packet, client) => {
  if (client) {
    console.log(packet.topic, packet.payload.toString(), client.id);
  }
});

aedes.on('client', client => {
  console.log(`${client.id} connected`);

  if (client.isDevice) {
    // Send device initial state (hub is the source of truth)
    const deviceItems = items.getDeviceItems(client.id);
    const deviceConfig = {};

    deviceItems.forEach(item => {
      deviceConfig[item.id] = core.modules[item.module].getState(item.id);
    });

    if (Object.keys(deviceConfig).length !== 0) {
      aedes.publish({
        topic: `devices/${client.id}/config`,
        payload: JSON.stringify(deviceConfig),
      }, () => console.log('Sent device config', deviceConfig));
    }
  }
});

aedes.on('clientDisconnect', client => console.log(`${client.id} disconnected`));

const mqttServer = require('net').createServer(aedes.handle);

// Start servers
mqttServer.listen(config.ports.MQTT, () => console.log(`MQTT server listening on port ${config.ports.MQTT}`));

ws.createServer({ server: httpServer }, aedes.handle);
httpServer.listen(config.ports.MQTT_WS, () => console.log(`Websocket MQTT server listening on port ${config.ports.MQTT_WS}`));

app.listen(config.ports.HTTP, () => console.log(`HTTP server listening on port ${config.ports.HTTP}`));