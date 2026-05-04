const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Note = sequelize.define('Note', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('pdf', 'video'), defaultValue: 'pdf' },
  fileUrl: { type: DataTypes.STRING, defaultValue: '' },
  videoUrl: { type: DataTypes.STRING, defaultValue: '' },
  summary: { type: DataTypes.TEXT, defaultValue: '' },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  extractedText: { type: DataTypes.TEXT, defaultValue: '' },
  status: { type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'), defaultValue: 'Pending' },
  downloads: { type: DataTypes.INTEGER, defaultValue: 0 },
  avgRating: { type: DataTypes.FLOAT, defaultValue: 0 },
  rankScore: { type: DataTypes.FLOAT, defaultValue: 0 },
}, { tableName: 'notes' });

module.exports = Note;
