const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { Note } = require('../models');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper: get Gemini model
const getModel = () => genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Helper: extract text from PDF file
const extractPdfText = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text.slice(0, 8000); // limit to 8000 chars for API
};

// POST /api/ai/summarize/:noteId
exports.summarizeNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    let text = note.extractedText;

    // Extract text if not already stored
    if (!text && note.type === 'pdf' && note.fileUrl) {
      const filePath = path.join(__dirname, '..', note.fileUrl);
      if (fs.existsSync(filePath)) {
        text = await extractPdfText(filePath);
        note.extractedText = text;
      }
    }

    if (note.type === 'markdown') text = note.markdownContent;

    if (!text) return res.status(400).json({ success: false, message: 'No text content to summarize' });

    const model = getModel();
    const prompt = `Summarize the following academic note in 5-8 clear lines suitable for a student:\n\n${text}`;
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

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

    const model = getModel();
    const prompt = `Extract 5-10 relevant academic keywords/tags from this text. Return only a comma-separated list of single words or short phrases, no explanation:\n\n${text.slice(0, 3000)}`;
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
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

    // Find notes with same subject OR matching tags, exclude current note
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

    // Extract PDF text if not stored
    if (!context && note.type === 'pdf' && note.fileUrl) {
      const filePath = path.join(__dirname, '..', note.fileUrl);
      if (fs.existsSync(filePath)) {
        context = await extractPdfText(filePath);
        note.extractedText = context;
        await note.save();
      }
    }

    if (!context) return res.status(400).json({ success: false, message: 'No content available for this note' });

    const model = getModel();
    const prompt = `You are a helpful academic assistant. Based on the following note content, answer the student's question clearly and concisely.\n\nNote Content:\n${context.slice(0, 6000)}\n\nQuestion: ${question}\n\nAnswer:`;
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ success: true, answer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
