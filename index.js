const aedes = require('aedes')();
const mqttServer = require('net').createServer(aedes.handle);
const ws = require('websocket-stream');
const httpServer = require('http').createServer();
const port = 1883;
const wsPort = 8888;

const state = {
  switches: [
    { id: 1, name: 'Switch 1', state: false },
    { id: 2, name: 'Switch 2', state: true },
    { id: 3, name: 'Switch 3', state: false },
  ],
};

mqttServer.listen(port, function() {
  console.log('MQTT server listening on port', port);
});

ws.createServer({
  server: httpServer,
}, aedes.handle);

httpServer.listen(wsPort, function() {
  console.log('websocket server listening on port', wsPort);
});

aedes.on('clientError', function(client, err) {
  console.log('client error', client.id, err.message, err.stack);
});

aedes.on('connectionError', function(client, err) {
  console.log('client error', client, err.message, err.stack);
});

aedes.on('publish', function(packet, client) {
  if (client) {
    console.log('message from client', client.id);
  }
});

aedes.on('subscribe', function(subscriptions, client) {
  if (client) {
    console.log('subscribe from client', subscriptions, client.id);
  }
});

aedes.on('client', function(client) {
  console.log('new client', client.id);
  setTimeout(() => client.publish({
    topic: 'web',
    payload: JSON.stringify(state),
  }), 1);
});
// wss.on('connection', function (ws) {
//     ws.on('message', (message) => {
//         const data = JSON.parse(message);
//
//         console.log('received: %s', message);
//
//         switch (data.type) {
//             case 'UPDATE_SWITCH': {
//                 state.switches = state.switches.map(item => {
//                     if (item.id === data.payload.id) {
//                         return {...item, ...data.payload};
//                     }
//
//                     return item;
//                 });
//
//                 broadcast({
//                     type: 'UPDATE_SWITCH',
//                     payload: data.payload,
//                 });
//
//                 break
//             }
//             default:
//                 console.log('unknown command type: %s', data.type);
//                 break
//         }
//     });
//
//     ws.send(JSON.stringify({
//         type: 'INIT',
//         payload: state
//     }));
// });
//
// const broadcast = (data, ws) => {
//     wss.clients.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN && client !== ws) {
//             client.send(JSON.stringify(data))
//         }
//     })
// };