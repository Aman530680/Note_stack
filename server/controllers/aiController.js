const OpenAI = require('openai');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { Note } = require('../models');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper: extract text from PDF
const extractPdfText = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text.slice(0, 8000);
};

// Helper: call OpenAI
const askAI = async (prompt) => {
  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500
  });
  return res.choices[0].message.content;
};

// POST /api/ai/summarize/:noteId
exports.summarizeNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    let text = note.extractedText;

    if (!text && note.type === 'pdf' && note.fileUrl) {
      const filePath = path.join(__dirname, '..', note.fileUrl);
      if (fs.existsSync(filePath)) {
        text = await extractPdfText(filePath);
        note.extractedText = text;
      }
    }

    if (note.type === 'markdown') text = note.markdownContent;
    if (!text) return res.status(400).json({ success: false, message: 'No text content to summarize' });

    const summary = await askAI(`Summarize the following academic note in 5-8 clear lines for a student:\n\n${text}`);

    note.summary = summary;
    await note.save();

    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/ai/tags/:noteId
exports.generateTags = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    const text = note.extractedText || note.markdownContent || note.description;
    if (!text) return res.status(400).json({ success: false, message: 'No content for tag extraction' });

    const raw = await askAI(`Extract 5-10 relevant academic keywords from this text. Return only a comma-separated list, no explanation:\n\n${text.slice(0, 3000)}`);
    const tags = raw.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0 && t.length < 30);

    note.tags = tags;
    await note.save();

    res.json({ success: true, tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/ai/recommend/:noteId
exports.recommendNotes = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    const recommendations = await Note.find({
      _id: { $ne: note._id },
      status: 'Approved',
      $or: [
        { subject: note.subject },
        { tags: { $in: note.tags } }
      ]
    })
      .populate('uploadedBy', 'name')
      .sort({ avgRating: -1, downloads: -1 })
      .limit(5);

    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/ai/chat/:noteId
exports.chatWithNote = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

    const note = await Note.findById(req.params.noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    let context = note.extractedText || note.markdownContent;

    if (!context && note.type === 'pdf' && note.fileUrl) {
      const filePath = path.join(__dirname, '..', note.fileUrl);
      if (fs.existsSync(filePath)) {
        context = await extractPdfText(filePath);
        note.extractedText = context;
        await note.save();
      }
    }

    if (!context) return res.status(400).json({ success: false, message: 'No content available for this note' });

    const answer = await askAI(`You are a helpful academic assistant. Based on the note content below, answer the student's question clearly.\n\nNote Content:\n${context.slice(0, 6000)}\n\nQuestion: ${question}\n\nAnswer:`);

    res.json({ success: true, answer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
