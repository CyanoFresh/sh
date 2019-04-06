module.exports = {
  modules: require('./modules'),
  users: require('./users'),
  devices: require('./devices'),
  dashboard: require('./dashboard'),
  dashboards: require('./dashboards'),
  items: require('./items'),
  ports: {
    MQTT: process.env.MQTT_PORT || 1883,
    MQTT_WS: process.env.MQTT_WS_PORT || 8888,
    HTTP: process.env.HTTP_PORT || 80,
  },
  auth: {
    maxTokens: 5,
    tokenSize: 48,
  },
};
