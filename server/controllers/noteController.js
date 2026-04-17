const { Note, User, Notification } = require('../models');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const calcRankScore = (note) => {
  const days = (Date.now() - new Date(note.createdAt)) / (1000 * 60 * 60 * 24);
  const recency = Math.max(0, 100 - days);
  return (note.avgRating * 20 * 0.6) + (note.downloads * 0.3) + (recency * 0.1);
};

exports.uploadNote = async (req, res) => {
  try {
    const { title, subject, description, type, videoUrl, markdownContent } = req.body;
    const noteType = type || 'pdf';
    console.log('Upload attempt - type:', noteType, 'file:', req.file ? 'present' : 'missing', 'cloudinary:', !!process.env.CLOUDINARY_CLOUD_NAME);

    let fileUrl = '';
    let extractedText = '';

    if (noteType === 'pdf' || noteType === 'image') {
      if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a file' });
      fileUrl = req.file.path; // Cloudinary URL

      // Extract text from PDF for AI features
      if (noteType === 'pdf') {
        try {
          const response = await fetch(fileUrl);
          const buffer = Buffer.from(await response.arrayBuffer());
          const data = await pdfParse(buffer);
          extractedText = data.text.slice(0, 8000);
        } catch (e) { /* silent fail - AI features optional */ }
      }
    }

    if (noteType === 'video' && !videoUrl)
      return res.status(400).json({ success: false, message: 'Video URL is required' });

    if (noteType === 'markdown' && !markdownContent)
      return res.status(400).json({ success: false, message: 'Markdown content is required' });

    const note = await Note.create({
      title, subject, description,
      type: noteType,
      fileUrl,
      videoUrl: videoUrl || '',
      markdownContent: markdownContent || '',
      extractedText,
      uploadedBy: req.user.id,
      status: 'Pending'
    });

    await Notification.create({
      message: `New note "${title}" uploaded by ${req.user.name}`,
      noteId: note._id,
      studentId: req.user.id
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { contributionScore: 10 } });

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ status: 'Approved' })
      .populate('uploadedBy', 'name email')
      .sort({ rankScore: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchNotes = async (req, res) => {
  try {
    const { query, subject, tag } = req.query;
    const filter = { status: 'Approved' };

    if (query) filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } }
    ];
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (tag) filter.tags = { $in: [tag.toLowerCase()] };

    const notes = await Note.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ rankScore: -1 });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTrendingNotes = async (req, res) => {
  try {
    const notes = await Note.find({ status: 'Approved' })
      .populate('uploadedBy', 'name')
      .sort({ rankScore: -1 })
      .limit(10);
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyNotes = async (req, res) => {
  try {
    const notes = await Note.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.incrementDownload = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
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
    const notes = await Note.find()
      .populate('uploadedBy', 'name email contact')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveNote = async (req, res) => {
  try {
    const { status } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    note.status = status;
    await note.save();

    if (status === 'Approved') {
      await User.findByIdAndUpdate(note.uploadedBy, { $inc: { contributionScore: 20, coins: 10 } });
    }

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    if (note.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    Object.assign(note, { title, subject, description, status: 'Pending' });
    await note.save();
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOwnNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    if (note.uploadedBy.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await note.deleteOne();
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
