module.exports = {
  modules: require('./modules'),
  users: require('./users'),
  devices: require('./devices'),
  dashboard: require('./dashboard'),
  ports: {
    MQTT: 1883,
    MQTT_WS: 8888,
    HTTP: 80,
  },
  auth: {
    maxTokens: 5,
    tokenSize: 48,
  },
};
