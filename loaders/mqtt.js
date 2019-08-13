const Aedes = require('aedes');

/**
 * @param {Core} core
 * @returns {aedes.Aedes}
 * @constructor
 */
const MQTTLoader = (core) => {
  core.aedes = Aedes({
    id: 'sh',
    authenticate: (client, username, password, callback) => {
      if (!password || !username) {
        console.log(`Auth failed: ${client.id}, ${username}, ${password}`);

        const error = new Error('No credentials provided');
        error.returnCode = 4;
        return callback(error, null);
      }

      client.isDevice = username === 'device';

      if (client.isDevice) {
        if (core.config.devices.find(device => device.id === client.id && device.password === password.toString())) {
          return callback(null, true);
        }
      } else {
        if (core.auth.authenticate(password.toString())) {
          return callback(null, true);
        }
      }

      console.log(`Auth failed for Client ID ${client.id} with username: ${username}, password: ${password}`);

      const error = new Error('Wrong credentials');
      error.returnCode = 4;
      return callback(error, null);
    },
  });

  core.aedes.on('publish', (packet, client) => {
    if (client) {
      console.log(packet.topic, packet.payload.toString(), client.id);

      const [module, ...params] = packet.topic.split('/');

      if (core.modules.hasOwnProperty(module) && typeof core.modules[module].onMessage === 'function') {
        core.modules[module].onMessage.call(
          core.modules[module],
          params,
          packet.payload.toString(),
          client,
          packet,
        );
      }
    }
  });

  core.aedes.on('client', client => {
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

    core.aedes.publish({
      topic: connectedTopic,
      payload: JSON.stringify(true),
    });
  });

  core.aedes.on('clientDisconnect', client => {
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

    core.aedes.publish({
      topic: disconnectedTopic,
      payload: JSON.stringify(false),
    }, () => null);
  });
};

module.exports = MQTTLoader;
