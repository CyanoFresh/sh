const Sequelize = require('sequelize');

module.exports = sequelize => sequelize.define('user_token', {
  user_id: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
  token: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, {
  updatedAt: false,
  indexes: [
    {
      fields: ['token'],
      unique: true,
    },
    {
      fields: ['user_id'],
    },
  ],
});