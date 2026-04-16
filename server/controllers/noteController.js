const { Op } = require('sequelize');
const { Note, User, Notification } = require('../models');

const calcRankScore = (note) => {
  const days = (Date.now() - new Date(note.createdAt)) / (1000 * 60 * 60 * 24);
  const recency = Math.max(0, 100 - days);
  return (note.avgRating * 20 * 0.6) + (note.downloads * 0.3) + (recency * 0.1);
};

// @route POST /api/notes/upload
exports.uploadNote = async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a PDF file' });

    const note = await Note.create({
      title, subject, description,
      fileUrl: `/uploads/${req.file.filename}`,
      UserId: req.user.id,
      status: 'Pending'
    });

    await Notification.create({
      message: `New note "${title}" uploaded by ${req.user.name}`,
      NoteId: note.id,
      UserId: req.user.id
    });

    await User.increment('contributionScore', { by: 10, where: { id: req.user.id } });

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/notes
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { status: 'Approved' },
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['rankScore', 'DESC'], ['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/notes/search
exports.searchNotes = async (req, res) => {
  try {
    const { query, subject } = req.query;
    const where = { status: 'Approved' };

    if (query) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } }
      ];
    }
    if (subject) where.subject = { [Op.iLike]: `%${subject}%` };

    const notes = await Note.findAll({
      where,
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['rankScore', 'DESC']]
    });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/notes/trending
exports.getTrendingNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { status: 'Approved' },
      include: [{ model: User, attributes: ['name'] }],
      order: [['rankScore', 'DESC']],
      limit: 10
    });
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/notes/my/all
exports.getMyNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/notes/:id
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/notes/:id/download
exports.incrementDownload = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    note.downloads += 1;
    note.rankScore = calcRankScore(note);
    await note.save();

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/notes/admin/all
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      include: [{ model: User, attributes: ['name', 'email', 'contact'] }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/notes/:id/approve
exports.approveNote = async (req, res) => {
  try {
    const { status } = req.body;
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    note.status = status;
    await note.save();

    if (status === 'Approved') {
      await User.increment(
        { contributionScore: 20, coins: 10 },
        { where: { id: note.UserId } }
      );
    }

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/notes/:id  (admin)
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    await note.destroy();
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/notes/:id  (student edit own)
exports.updateNote = async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    if (note.UserId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await note.update({ title, subject, description, status: 'Pending' });
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/notes/my/:id  (student delete own)
exports.deleteOwnNote = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    if (note.UserId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await note.destroy();
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
