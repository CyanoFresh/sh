const ws = require('websocket-stream');
const aedes = require('aedes')();
const mqttServer = require('net').createServer(aedes.handle);

const config = require('./config');

const MQTTPort = 1883;
const WSPort = 8888;

const itemStates = {};

aedes.authenticate = (client, username, password, callback) => {
  client.isDevice = username === '1';

  return callback(null, true);
};

setInterval(() => {
  console.log(itemStates);
}, 10000);

// aedes.on('publish', (packet, client) => {
//   if (client) {
//     try {
//       const data = JSON.parse(packet.payload.toString());
//
//       console.log('json from client', client.id, data);
//
//       if (packet.topic === 'switch/my-room_switch/set') {
//         itemStates['my-room_switch'] = {
//           state: data.state,
//         };
//
//         aedes.publish({
//           topic: 'switch/my-room_switch',
//           payload: JSON.stringify(itemStates['my-room_switch']),
//         }, () => console.log('sent'));
//       }
//     } catch (e) {
//       console.log('from client', client.id, packet.payload);
//     }
//   }
// });
//
// aedes.on('clientDisconnect', (client) => {
//   console.log(`Client Disconnected ${client.id}`);
// });
//
// const getUserInitialState = () => {
//   const state = { ...config };
//
//   state.dashboard = state.dashboard.map((itemGroup) => {
//     const newItemGroup = { ...itemGroup };
//
//     newItemGroup.items = itemGroup.items.map((item) => {
//       return {
//         ...item,
//         ...itemStates[item.id],
//       };
//     });
//
//     return newItemGroup;
//   });
//
//   console.log(state);
//
//   return state;
// };
//
// aedes.on('subscribe', (subscriptions, client) => {
//   if (client) {
//     console.log('Client Subscribe', subscriptions, client.id);
//
//     if (!client.isDevice && subscriptions[0].topic === `user/${client.id}`) {
//       client.publish({
//         topic: `user/${client.id}`,
//         payload: JSON.stringify(getUserInitialState()),
//       }, () => console.log('sent initial state'));
//     }
//   }
// });
//
// aedes.on('client', function(client) {
//   console.log('Client connected', client.id);
// });

// Start servers
mqttServer.listen(MQTTPort, function() {
  console.log('MQTT server listening on port', MQTTPort);
});

ws.createServer({
  port: WSPort,
}, aedes.handle);