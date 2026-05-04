const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const { Note } = require('../models');
const { Op } = require('sequelize');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const extractPdfText = async (fileUrl) => {
  const response = await fetch(fileUrl);
  const buffer = Buffer.from(await response.arrayBuffer());
  const data = await pdfParse(buffer);
  return data.text.slice(0, 8000);
};

const askAI = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

exports.summarizeNote = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    let text = note.extractedText;
    if (!text && note.type === 'pdf' && note.fileUrl) {
      text = await extractPdfText(note.fileUrl);
      await note.update({ extractedText: text });
    }
    if (!text) return res.status(400).json({ success: false, message: 'No text content to summarize' });

    const summary = await askAI(`Summarize the following academic note in 5-8 clear lines for a student:\n\n${text}`);
    await note.update({ summary });

    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateTags = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    const text = note.extractedText || note.description;
    if (!text) return res.status(400).json({ success: false, message: 'No content for tag extraction' });

    const raw = await askAI(`Extract 5-10 relevant academic keywords from this text. Return only a comma-separated list, no explanation:\n\n${text.slice(0, 3000)}`);
    const tags = raw.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0 && t.length < 30);

    await note.update({ tags });
    res.json({ success: true, tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.recommendNotes = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    const { User } = require('../models');
    const recommendations = await Note.findAll({
      where: {
        id: { [Op.ne]: note.id },
        status: 'Approved',
        subject: note.subject
      },
      include: [{ model: User, as: 'uploader', attributes: ['name'] }],
      order: [['avgRating', 'DESC'], ['downloads', 'DESC']],
      limit: 5
    });

    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.chatWithNote = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

    const note = await Note.findByPk(req.params.noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    let context = note.extractedText;
    if (!context && note.type === 'pdf' && note.fileUrl) {
      context = await extractPdfText(note.fileUrl);
      await note.update({ extractedText: context });
    }
    if (!context) return res.status(400).json({ success: false, message: 'No content available for this note' });

    const answer = await askAI(`You are a helpful academic assistant. Based on the note content below, answer the student's question clearly.\n\nNote Content:\n${context.slice(0, 6000)}\n\nQuestion: ${question}\n\nAnswer:`);

    res.json({ success: true, answer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
