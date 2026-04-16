const User = require('./User');
const Note = require('./Note');
const Rating = require('./Rating');
const Notification = require('./Notification');

// User → Notes (one to many)
User.hasMany(Note, { foreignKey: 'UserId', onDelete: 'CASCADE' });
Note.belongsTo(User, { foreignKey: 'UserId' });

// User → Ratings (one to many)
User.hasMany(Rating, { foreignKey: 'UserId', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'UserId' });

// Note → Ratings (one to many)
Note.hasMany(Rating, { foreignKey: 'NoteId', onDelete: 'CASCADE' });
Rating.belongsTo(Note, { foreignKey: 'NoteId' });

// Note → Notifications (one to many)
Note.hasMany(Notification, { foreignKey: 'NoteId', onDelete: 'CASCADE' });
Notification.belongsTo(Note, { foreignKey: 'NoteId' });

// User → Notifications (one to many)
User.hasMany(Notification, { foreignKey: 'UserId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'UserId' });

module.exports = { User, Note, Rating, Notification };
