const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  message: { type: DataTypes.STRING, allowNull: false },
  seen: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'notifications' });

module.exports = Notification;
