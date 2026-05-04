const { Notification, Note, User } = require('../models');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      include: [
        { model: Note, as: 'note', attributes: ['title', 'subject'] },
        { model: User, as: 'student', attributes: ['name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    const unseenCount = await Notification.count({ where: { seen: false } });
    res.status(200).json({ success: true, count: notifications.length, unseenCount, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsSeen = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Not found' });
    await notification.update({ seen: true });
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllAsSeen = async (req, res) => {
  try {
    await Notification.update({ seen: true }, { where: { seen: false } });
    res.status(200).json({ success: true, message: 'All marked as seen' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUnseenCount = async (req, res) => {
  try {
    const count = await Notification.count({ where: { seen: false } });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
