const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://127.0.0.1', {
  clientId: 'corridor-buzzer',
  username: 'device',
  password: 'bnmdfgu534mbv7yadsu2hj34687tsd',
});

client.on('connect', function() {
  client.subscribe('buzzer/corridor-buzzer/unlock');
  client.subscribe('buzzer/corridor-buzzer/auto_unlock/set');

  setTimeout(() => {
    client.publish('buzzer/corridor-buzzer/ringing', 'true');
  }, 5000);
});

client.on('message', function(topic, message) {
  const data = JSON.parse(message.toString());

  console.log(data);

  switch (topic) {
    case 'buzzer/corridor-buzzer/unlock':
      if (data) {
        client.publish('buzzer/corridor-buzzer/unlocked', 'false');
      } else {
        client.publish('buzzer/corridor-buzzer/ringing', 'false');
      }

      break;
    case 'buzzer/corridor-buzzer/auto_unlock/set':
      client.publish('buzzer/corridor-buzzer/auto_unlock', message.toString());

      break;
  }
});
