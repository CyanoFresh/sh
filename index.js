const ws = require('websocket-stream');
const express = require('express');
const cors = require('cors');
const EventEmitter = require('events');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config = require('./config');

const httpServer = require('http').createServer();
const aedes = require('aedes')();
const app = express();

class Core extends EventEmitter {
  constructor() {
    super();

    this.express = app;
    this.modules = {};
    this.aedes = aedes;
    this.config = config;
  }
}

const core = new Core();

app.use(cors());
app.use(express.json());

const auth = require('./utils/auth')(core);

// HTTP
core.apiRouter = express.Router();

core.apiRouter.use(auth.authenticated);

require('./utils/modules')(core);

app.use('/api', core.apiRouter);

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

  let connectedTopic;

  if (client.isDevice) {
    connectedTopic = `devices/${client.id}/connected`;

    core.emit('device.connected', client.id);
  } else {
    const [userId] = client.id.split('@');

    connectedTopic = `users/${userId}/connected`;

    core.emit('user.connected', userId);
  }

  aedes.publish({
    topic: connectedTopic,
    payload: JSON.stringify(true),
  });
});

aedes.on('subscribe', (subscriptions, client) => {
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

aedes.on('clientDisconnect', client => {
  console.log(`${client.id} disconnected`);

  let disconnectedTopic;

  if (client.isDevice) {
    disconnectedTopic = `devices/${client.id}/connected`;

    core.emit('device.disconnected', client.id);
  } else {
    const [userId] = client.id.split('@');

    disconnectedTopic = `users/${userId}/connected`;

    core.emit('user.disconnected', userId);
  }

  aedes.publish({
    topic: disconnectedTopic,
    payload: JSON.stringify(false),
  }, () => {
  });
});

const mqttServer = require('net').createServer(aedes.handle);

// Start servers
mqttServer.listen(config.ports.MQTT, () => console.log(`MQTT server listening on port ${config.ports.MQTT}`));

ws.createServer({ server: httpServer }, aedes.handle);
httpServer.listen(config.ports.MQTT_WS, () => console.log(`Websocket MQTT server listening on port ${config.ports.MQTT_WS}`));

app.listen(config.ports.HTTP, () => console.log(`HTTP server listening on port ${config.ports.HTTP}`));