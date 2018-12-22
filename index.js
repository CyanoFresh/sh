const ws = require('websocket-stream');
const httpServer = require('http').createServer();
const express = require('express');
const cors = require('cors');
const app = express();
const aedes = require('aedes')();
const config = require('./config');

const MQTTPort = 1883;
const WSPort = 8888;
const HTTPPort = 80;

const core = {
  modules: {},
  aedes,
  config,
  express,
};

app.use(cors());

// Load modules
core.config.modules.forEach((moduleConfig) => {
  let moduleItems = [];

  core.config.dashboard.forEach((itemGroup) => {
    moduleItems = [
      ...moduleItems,
      ...itemGroup.items.filter((item) => item.module === moduleConfig.id),
    ];
  });

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
app.get('/api/state', (req, res, next) => {
  const sendState = { dashboard: config.dashboard, modules: config.modules };

  sendState.dashboard.forEach((itemGroup, groupIndex) => {
    sendState.dashboard[groupIndex].items.forEach((item, itemIndex) => {
      const module = core.modules[item.module];

      sendState.dashboard[groupIndex].items[itemIndex] = {
        ...item,
        ...module.getState(item.id),
      };
    });
  });

  res.send(sendState);
});

// MQTT logic:
aedes.authenticate = (client, username, password, callback) => {
  client.isDevice = username === '1';

  callback(null, true);
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