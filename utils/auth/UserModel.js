const Sequelize = require('sequelize');

module.exports = sequelize => sequelize.define('user', {
  user_id: {
    type: Sequelize.STRING(128),
    allowNull: false,
  },
  password_hash: {
    type: Sequelize.STRING(),
    allowNull: false,
  },
  api_key: Sequelize.STRING(64),
  name: Sequelize.STRING(128),
  room_id: Sequelize.STRING(128),
  last_login_at: Sequelize.INTEGER.UNSIGNED,
}, {
  updatedAt: false,
  indexes: [
    {
      fields: ['user_id'],
      unique: true,
    },
    {
      fields: ['api_key'],
      unique: true,
    },
  ],
});