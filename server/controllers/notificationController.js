const { Notification, Note, User } = require('../models');

// @route GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      include: [
        { model: Note, attributes: ['title', 'subject'] },
        { model: User, attributes: ['name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const unseenCount = await Notification.count({ where: { seen: false } });

    res.status(200).json({ success: true, count: notifications.length, unseenCount, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/notifications/:id/seen
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

// @route PUT /api/notifications/seen/all
exports.markAllAsSeen = async (req, res) => {
  try {
    await Notification.update({ seen: true }, { where: { seen: false } });
    res.status(200).json({ success: true, message: 'All marked as seen' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/notifications/unseen/count
exports.getUnseenCount = async (req, res) => {
  try {
    const count = await Notification.count({ where: { seen: false } });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
