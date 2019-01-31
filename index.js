const ws = require('websocket-stream');
const express = require('express');
const cors = require('cors');
const config = require('./config');

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
const apiRouter = express.Router();

apiRouter.use(auth.authenticated);

apiRouter.get(
  '/state',
  (req, res) => {
    const sendState = {
      ok: true,
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

core.apiRouter = apiRouter;

require('./utils/modules')(core);

app.use('/api', apiRouter);

// Error handler
app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({
    success: false,
    message: err.message,
    ...err,
  });
});

// MQTT logic:
aedes.authenticate = (client, username, password, callback) => {
  if (!password || !username) {
    const error = new Error('No credentials provided');
    error.returnCode = 4;
    return callback(error, null);
  }

  client.isDevice = username === '1';

  if (client.isDevice) {
    if (config.devices.find(device => device.id === client.id && device.password === password.toString())) {
      return callback(null, true);
    }
  } else {
    if (auth.authenticate(password.toString())) {
      return callback(null, true);
    }
  }

  const error = new Error('Auth error');
  error.returnCode = 4;
  return callback(error, null);
};

aedes.on('publish', (packet, client) => {
  if (client) {
    console.log(packet.topic, packet.payload.toString(), client.id);
  }
});

aedes.on('client', (client) => {
  console.log(`${client.id} connected`);
});

aedes.on('clientDisconnect', (client) => {
  console.log(`${client.id} disconnected`);
});

const mqttServer = require('net').createServer(aedes.handle);

// Start servers
mqttServer.listen(config.ports.MQTT, () => console.log(`MQTT server listening on port ${config.ports.MQTT}`));

ws.createServer({ server: httpServer }, aedes.handle);
httpServer.listen(config.ports.MQTT_WS, () => console.log(`Websocket MQTT server listening on port ${config.ports.MQTT_WS}`));

app.listen(config.ports.HTTP, () => console.log(`HTTP server listening on port ${config.ports.HTTP}`));