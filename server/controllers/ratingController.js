const { Rating, Note, User } = require('../models');

exports.submitRating = async (req, res) => {
  try {
    const { noteId, rating, comment } = req.body;

    const existing = await Rating.findOne({ where: { userId: req.user.id, noteId } });
    if (existing) return res.status(400).json({ success: false, message: 'You have already rated this note' });

    const newRating = await Rating.create({ userId: req.user.id, noteId, rating, comment: comment || null });

    const all = await Rating.findAll({ where: { noteId } });
    const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;

    const note = await Note.findByPk(noteId);
    const days = (Date.now() - new Date(note.createdAt)) / (1000 * 60 * 60 * 24);
    const recency = Math.max(0, 100 - days);
    const rankScore = (avg * 20 * 0.6) + (note.downloads * 0.3) + (recency * 0.1);

    await note.update({ avgRating: avg, rankScore });

    res.status(201).json({ success: true, data: newRating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRatings = async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      where: { noteId: req.params.noteId },
      include: [{ model: User, as: 'user', attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, count: ratings.length, data: ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkUserRating = async (req, res) => {
  try {
    const rating = await Rating.findOne({ where: { userId: req.user.id, noteId: req.params.noteId } });
    res.status(200).json({ success: true, hasRated: !!rating, data: rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllComments = async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      where: { comment: { [require('sequelize').Op.ne]: null } },
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
        { model: Note, as: 'note', attributes: ['title'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    // Map to match frontend expectations (userId, noteId)
    const data = ratings.map(r => ({
      ...r.toJSON(),
      userId: r.user,
      noteId: r.note
    }));
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveComment = async (req, res) => {
  try {
    const rating = await Rating.findByPk(req.params.id);
    if (!rating) return res.status(404).json({ success: false, message: 'Rating not found' });
    if (!rating.comment) return res.status(400).json({ success: false, message: 'No comment to approve' });
    if (rating.commentApproved) return res.status(400).json({ success: false, message: 'Already approved' });

    await rating.update({ commentApproved: true, coinAwarded: true });
    await User.increment({ coins: 1 }, { where: { id: rating.userId } });

    res.status(200).json({ success: true, data: rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
