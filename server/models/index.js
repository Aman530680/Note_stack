const User = require('./User');
const Note = require('./Note');
const Rating = require('./Rating');
const Notification = require('./Notification');

// Associations
User.hasMany(Note, { foreignKey: 'uploadedBy', as: 'notes' });
Note.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Note.hasMany(Rating, { foreignKey: 'noteId', as: 'ratings' });
Rating.belongsTo(Note, { foreignKey: 'noteId', as: 'note' });

Note.hasMany(Notification, { foreignKey: 'noteId', as: 'notifications' });
Notification.belongsTo(Note, { foreignKey: 'noteId', as: 'note' });

User.hasMany(Notification, { foreignKey: 'studentId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

module.exports = { User, Note, Rating, Notification };
