const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  comment: {
    type: DataTypes.TEXT
  },
  commentApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  coinAwarded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['UserId', 'NoteId'] }
  ]
});

module.exports = Rating;
