const { Notification, Note, User } = require('../models');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('noteId', 'title subject')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    const unseenCount = await Notification.countDocuments({ seen: false });
    res.status(200).json({ success: true, count: notifications.length, unseenCount, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsSeen = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { seen: true }, { new: true });
    if (!notification) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllAsSeen = async (req, res) => {
  try {
    await Notification.updateMany({ seen: false }, { seen: true });
    res.status(200).json({ success: true, message: 'All marked as seen' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUnseenCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ seen: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
