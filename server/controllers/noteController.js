const { Note, User, Notification } = require('../models');
const { Op } = require('sequelize');
const pdfParse = require('pdf-parse');

const calcRankScore = (note) => {
  const days = (Date.now() - new Date(note.createdAt)) / (1000 * 60 * 60 * 24);
  const recency = Math.max(0, 100 - days);
  return (note.avgRating * 20 * 0.6) + (note.downloads * 0.3) + (recency * 0.1);
};

const noteWithUploader = { include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }] };

exports.uploadNote = async (req, res) => {
  try {
    const { title, subject, description, type, videoUrl } = req.body;
    const noteType = type || 'pdf';

    let fileUrl = '';
    let extractedText = '';

    if (noteType === 'pdf') {
      if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a file' });
      fileUrl = req.file.path;
      try {
        const response = await fetch(fileUrl);
        const buffer = Buffer.from(await response.arrayBuffer());
        const data = await pdfParse(buffer);
        extractedText = data.text.slice(0, 8000);
      } catch (e) { /* silent fail */ }
    }

    if (noteType === 'video' && !videoUrl)
      return res.status(400).json({ success: false, message: 'Video URL is required' });

    const note = await Note.create({
      title, subject, description,
      type: noteType,
      fileUrl,
      videoUrl: videoUrl || '',
      extractedText,
      uploadedBy: req.user.id,
      status: 'Pending'
    });

    await Notification.create({
      message: `New note "${title}" uploaded by ${req.user.name}`,
      noteId: note.id,
      studentId: req.user.id
    });

    await User.increment({ contributionScore: 10 }, { where: { id: req.user.id } });

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { status: 'Approved' },
      ...noteWithUploader,
      order: [['rankScore', 'DESC'], ['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchNotes = async (req, res) => {
  try {
    const { query, subject, tag } = req.query;
    const where = { status: 'Approved' };

    if (query) where[Op.or] = [
      { title: { [Op.iLike]: `%${query}%` } },
      { description: { [Op.iLike]: `%${query}%` } },
    ];
    if (subject) where.subject = { [Op.iLike]: `%${subject}%` };
    if (tag) where.tags = { [Op.contains]: [tag.toLowerCase()] };

    const notes = await Note.findAll({ where, ...noteWithUploader, order: [['rankScore', 'DESC']] });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTrendingNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { status: 'Approved' },
      include: [{ model: User, as: 'uploader', attributes: ['name'] }],
      order: [['rankScore', 'DESC']],
      limit: 10
    });
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { uploadedBy: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNote = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id, noteWithUploader);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      include: [{ model: User, as: 'uploader', attributes: ['name', 'email', 'contact'] }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveNote = async (req, res) => {
  try {
    const { status } = req.body;
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    note.status = status;
    await note.save();

    if (status === 'Approved') {
      await User.increment({ contributionScore: 20, coins: 10 }, { where: { id: note.uploadedBy } });
    }

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

exports.updateNote = async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    if (note.uploadedBy !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await note.update({ title, subject, description, status: 'Pending' });
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOwnNote = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    if (note.uploadedBy !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await note.destroy();
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
