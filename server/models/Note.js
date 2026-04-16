const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending'
  },
  downloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  avgRating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  rankScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  timestamps: true
});

module.exports = Note;
