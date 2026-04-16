const { Rating, Note, User } = require('../models');

// @route POST /api/ratings
exports.submitRating = async (req, res) => {
  try {
    const { noteId, rating, comment } = req.body;

    const existing = await Rating.findOne({ where: { UserId: req.user.id, NoteId: noteId } });
    if (existing) return res.status(400).json({ success: false, message: 'You have already rated this note' });

    const newRating = await Rating.create({
      UserId: req.user.id,
      NoteId: noteId,
      rating,
      comment: comment || null
    });

    // Recalculate average rating
    const all = await Rating.findAll({ where: { NoteId: noteId } });
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

// @route GET /api/ratings/:noteId
exports.getRatings = async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      where: { NoteId: req.params.noteId },
      include: [{ model: User, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, count: ratings.length, data: ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/ratings/check/:noteId
exports.checkUserRating = async (req, res) => {
  try {
    const rating = await Rating.findOne({
      where: { UserId: req.user.id, NoteId: req.params.noteId }
    });
    res.status(200).json({ success: true, hasRated: !!rating, data: rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/ratings/admin/comments
exports.getAllComments = async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      where: { comment: { [require('sequelize').Op.ne]: null } },
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Note, attributes: ['title'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, count: ratings.length, data: ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/ratings/:id/approve-comment
exports.approveComment = async (req, res) => {
  try {
    const rating = await Rating.findByPk(req.params.id);
    if (!rating) return res.status(404).json({ success: false, message: 'Rating not found' });
    if (!rating.comment) return res.status(400).json({ success: false, message: 'No comment to approve' });
    if (rating.commentApproved) return res.status(400).json({ success: false, message: 'Already approved' });

    await rating.update({ commentApproved: true, coinAwarded: true });
    await User.increment('coins', { by: 1, where: { id: rating.UserId } });

    res.status(200).json({ success: true, data: rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
