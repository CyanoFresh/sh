const Sequelize = require('sequelize');

/**
 * @param {Core} core
 * @constructor
 */
const DBLoader = (core) => {
  core.sequelize = new Sequelize(core.config.db.name, core.config.db.username, core.config.db.password, {
    host: core.config.db.host,
    port: core.config.db.port,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
  });

  core.sequelize.authenticate()
    .then(() => console.log('DB connected'))
    .catch(err => {
      console.error('DB Error:', err);
      process.exit();
    });
};

module.exports = DBLoader;