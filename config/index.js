module.exports = {
  modules: require('./modules'),
  users: require('./users'),
  devices: require('./devices'),
  dashboard: require('./dashboard'),
  dashboards: require('./dashboards'),
  items: require('./items'),
  ports: {
    MQTT: process.env.MQTT_PORT,
    MQTT_WS: process.env.MQTT_WS_PORT,
    HTTP: process.env.HTTP_PORT,
  },
  auth: {
    maxTokens: 5,
    tokenSize: 48,
  },
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
};
