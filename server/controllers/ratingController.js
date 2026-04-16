const { Rating, Note, User } = require('../models');

exports.submitRating = async (req, res) => {
  try {
    const { noteId, rating, comment } = req.body;

    const existing = await Rating.findOne({ userId: req.user.id, noteId });
    if (existing) return res.status(400).json({ success: false, message: 'You have already rated this note' });

    const newRating = await Rating.create({ userId: req.user.id, noteId, rating, comment: comment || null });

    const all = await Rating.find({ noteId });
    const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;

    const note = await Note.findById(noteId);
    const days = (Date.now() - new Date(note.createdAt)) / (1000 * 60 * 60 * 24);
    const recency = Math.max(0, 100 - days);
    const rankScore = (avg * 20 * 0.6) + (note.downloads * 0.3) + (recency * 0.1);

    await Note.findByIdAndUpdate(noteId, { avgRating: avg, rankScore });

    res.status(201).json({ success: true, data: newRating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ noteId: req.params.noteId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: ratings.length, data: ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkUserRating = async (req, res) => {
  try {
    const rating = await Rating.findOne({ userId: req.user.id, noteId: req.params.noteId });
    res.status(200).json({ success: true, hasRated: !!rating, data: rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllComments = async (req, res) => {
  try {
    const ratings = await Rating.find({ comment: { $ne: null } })
      .populate('userId', 'name email')
      .populate('noteId', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: ratings.length, data: ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveComment = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) return res.status(404).json({ success: false, message: 'Rating not found' });
    if (!rating.comment) return res.status(400).json({ success: false, message: 'No comment to approve' });
    if (rating.commentApproved) return res.status(400).json({ success: false, message: 'Already approved' });

    rating.commentApproved = true;
    rating.coinAwarded = true;
    await rating.save();

    await User.findByIdAndUpdate(rating.userId, { $inc: { coins: 1 } });

    res.status(200).json({ success: true, data: rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
