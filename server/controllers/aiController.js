const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Note } = require('../models');
const { Op } = require('sequelize');
const pdfParse = require('pdf-parse');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/** Static knowledge about NOTESTACK (product + pages). Kept in sync with marketing copy at a high level. */
const SITE_KNOWLEDGE = `
NOTESTACK is a free student note-sharing platform (MERN stack).

Public pages: Home/Landing, About, Features, Contact, Sign up, Login.
After login: students use Dashboard (browse/search PDF notes, ratings, downloads, AI tools on a note). Admins use Admin Dashboard (approve/reject uploads, moderation) and Analytics Dashboard (downloads, leaderboard, subject stats, weekly uploads).

Core features: JWT auth, PDF uploads with title/subject/description, admin moderation before notes go public, embedded PDF preview, search/filter, download counts, 5-star ratings and comments (admin can moderate comments), notifications for admins, contribution score and coins for students, trending/popular notes, AI on PDFs: summarize, tag extraction, Q&A per note, recommendations by subject.

Workflow: student uploads PDF → status Pending → admin approves → status Approved and visible to everyone; Rejected notes are not public.

Limitations: PDF format only for uploads; AI summaries/tags/chat apply to PDF notes with extractable text (scanned images may work poorly).

For support questions, direct users to Contact on the site and signing in for full features.
`.trim();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableAIError = (error) => {
  const message = (error?.message || '').toLowerCase();
  return message.includes('429') || message.includes('quota') || message.includes('rate limit') || message.includes('timeout');
};

const cleanAIText = (text = '') => text.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

const askAI = async (prompt, { maxRetries = 3 } = {}) => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const result = await model.generateContent(prompt);
      const text = result?.response?.text?.() || '';
      return cleanAIText(text);
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries || !isRetryableAIError(error)) break;
      const backoffMs = 1200 * (attempt + 1);
      await sleep(backoffMs);
    }
  }

  throw lastError;
};

const extractPdfTextFromUrl = async (url) => {
  if (!url || !url.toLowerCase().includes('.pdf')) return '';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return '';
    const bytes = await response.arrayBuffer();
    const parsed = await pdfParse(Buffer.from(bytes));
    return (parsed.text || '').replace(/\s+/g, ' ').trim();
  } catch (error) {
    return '';
  } finally {
    clearTimeout(timer);
  }
};

const getPdfContext = async (note) => {
  let text = (note.extractedText || '').trim();
  // For older notes, extractedText may only contain short metadata.
  if (text.length < 300 && note.fileUrl) {
    const extracted = await extractPdfTextFromUrl(note.fileUrl);
    if (extracted && extracted.length > 100) {
      text = extracted;
      await note.update({ extractedText: extracted });
    }
  }

  if (!text) {
    text = `Title: ${note.title}\nSubject: ${note.subject}\nDescription: ${note.description}`;
  }
  return text;
};

const buildFallbackSummary = (text, title = 'Untitled', subject = 'General') => {
  const cleaned = (text || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return '';

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const intro = sentences.slice(0, 2).join(' ');
  const keyPoints = sentences.slice(2, 6).map((line) => `- ${line}`).join('\n');
  const shortWords = cleaned.split(' ');
  const preview = shortWords.slice(0, 130).join(' ') + (shortWords.length > 130 ? '...' : '');

  return [
    `Topic: ${title} (${subject})`,
    '',
    'Quick Overview:',
    intro || preview,
    '',
    'Key Points:',
    keyPoints || `- ${preview}`,
    '',
    'Study Tip:',
    'Review the key points first, then revise examples and definitions from the full note.'
  ].join('\n');
};

const buildFallbackTags = (text) => {
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'were', 'have', 'has',
    'had', 'not', 'you', 'your', 'about', 'into', 'over', 'under', 'then', 'than', 'their',
    'them', 'they', 'there', 'here', 'when', 'where', 'what', 'which', 'while', 'will', 'would',
    'should', 'can', 'could', 'subject', 'title', 'description', 'note'
  ]);

  const words = (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && w.length <= 24 && !stopWords.has(w));

  const freq = new Map();
  words.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

const buildFallbackAnswer = (context, question, title = 'this note') => {
  const cleaned = (context || '').replace(/\s+/g, ' ').trim();
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const questionWords = (question || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const relevant = sentences.filter((line) => {
    const low = line.toLowerCase();
    return questionWords.some((w) => low.includes(w));
  });

  const isRequirementsQuestion = /functional|non functional|requirement|requirements/i.test(question || '');
  const requirementsLines = sentences.filter((line) =>
    /functional|non functional|requirement|performance|security|usability|reliability|availability/i.test(line)
  );

  const bestLines = isRequirementsQuestion
    ? requirementsLines.slice(0, 8)
    : (relevant.length ? relevant : []).slice(0, 6);

  if (!bestLines.length) {
    return [
      `I could not use live AI right now, and I could not find a reliable answer in ${title}.`,
      '',
      'Not found in provided PDF content.',
      '',
      'Try one of these:',
      '- Ask with exact section name from the PDF',
      '- Upload a clearer text-based PDF (not scanned image)',
      '- Ask a targeted question like "List 5 functional requirements"'
    ].join('\n');
  }

  const fallbackBody = bestLines.map((line, idx) => `${idx + 1}. ${line}`).join('\n');

  return [
    `I could not use AI service right now, but here is the best available answer from ${title}:`,
    '',
    fallbackBody,
    '',
    'Tip: Ask with exact heading/section names for more precise results.'
  ].join('\n');
};

const tokenize = (text = '') => text
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .split(/\s+/)
  .filter((w) => w.length > 2);

const pickRelevantContext = (text, question, maxChars = 9000) => {
  const cleaned = (text || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';

  const chunks = [];
  const chunkSize = 1200;
  for (let i = 0; i < cleaned.length; i += chunkSize) {
    chunks.push(cleaned.slice(i, i + chunkSize));
  }

  const qWords = tokenize(question);
  const scored = chunks.map((chunk, idx) => {
    const low = chunk.toLowerCase();
    let score = 0;
    qWords.forEach((word) => {
      if (low.includes(word)) score += 2;
    });
    // Slight priority to early chunks to keep intro definitions.
    score += Math.max(0, 3 - idx * 0.2);
    return { chunk, score };
  });

  const ordered = scored.sort((a, b) => b.score - a.score).map((item) => item.chunk);
  let merged = '';
  for (const chunk of ordered) {
    if ((merged + '\n' + chunk).length > maxChars) break;
    merged += (merged ? '\n\n' : '') + chunk;
  }

  return merged || cleaned.slice(0, maxChars);
};

const noteTextForScoring = (note) => {
  const tags = Array.isArray(note.tags) ? note.tags.join(' ') : '';
  const body =
    note.type === 'pdf'
      ? (note.extractedText || '').slice(0, 6000)
      : [note.description || '', note.videoUrl || ''].join(' ');
  return [note.title, note.subject, note.description || '', note.summary || '', tags, body].join(' ');
};

const scoreNoteAgainstQuestion = (note, question) => {
  const qWords = tokenize(question);
  if (!qWords.length) return 1;
  const blob = noteTextForScoring(note).toLowerCase();
  let score = 0;
  qWords.forEach((w) => {
    if (blob.includes(w)) score += 3;
  });
  if (note.subject && question.toLowerCase().includes(note.subject.toLowerCase())) score += 4;
  if (note.title && question.toLowerCase().includes(note.title.toLowerCase().slice(0, 12))) score += 2;
  return score;
};

const formatNoteForAssistant = (note, question) => {
  const tags = Array.isArray(note.tags) && note.tags.length ? note.tags.join(', ') : '—';
  const statusLine = note.status === 'Pending' ? 'UPCOMING (pending admin review — not public yet)' : note.status;
  const baseMeta = `Title: ${note.title}
Subject: ${note.subject}
Status: ${statusLine}
Type: ${note.type}
Description: ${note.description || '—'}
Summary: ${(note.summary || '').trim() || '—'}
Tags: ${tags}`;

  if (note.type === 'pdf') {
    const raw = (note.extractedText || '').trim();
    const excerpt = raw
      ? pickRelevantContext(raw, question, 2800)
      : pickRelevantContext(note.description || '', question, 1200);
    return `${baseMeta}\nExcerpt from note text:\n${excerpt || '—'}`;
  }

  return `${baseMeta}\nVideo URL (if any): ${note.videoUrl || '—'}`;
};

const trimHistory = (history, maxPairs = 6) => {
  if (!Array.isArray(history)) return [];
  const cleaned = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && String(m.content || '').trim())
    .map((m) => ({ role: m.role, content: String(m.content).trim() }));
  const maxMessages = maxPairs * 2;
  return cleaned.length > maxMessages ? cleaned.slice(-maxMessages) : cleaned;
};

const buildAssistantHistoryBlock = (history) => {
  if (!history.length) return '';
  const lines = history.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`);
  return `Earlier in this conversation:\n${lines.join('\n')}\n`;
};

exports.assistantChat = async (req, res) => {
  try {
    const rawMessage = req.body?.message ?? req.body?.question;
    const message = rawMessage != null ? String(rawMessage).trim() : '';
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const history = trimHistory(req.body?.history);
    const user = req.user;
    const isAdmin = user?.role === 'admin';

    const approvedNotes = await Note.findAll({
      where: { status: 'Approved' },
      attributes: ['id', 'title', 'subject', 'description', 'summary', 'tags', 'extractedText', 'status', 'type', 'fileUrl', 'videoUrl'],
      limit: 180,
      order: [['updatedAt', 'DESC']]
    });

    let upcomingNotes = [];
    if (isAdmin) {
      upcomingNotes = await Note.findAll({
        where: { status: 'Pending' },
        attributes: ['id', 'title', 'subject', 'description', 'summary', 'tags', 'extractedText', 'status', 'type', 'fileUrl', 'videoUrl'],
        limit: 100,
        order: [['createdAt', 'DESC']]
      });
    }

    const catalogNotes = [...upcomingNotes, ...approvedNotes];
    const seen = new Set();
    const deduped = [];
    catalogNotes.forEach((n) => {
      if (seen.has(n.id)) return;
      seen.add(n.id);
      deduped.push(n);
    });

    const scored = deduped
      .map((n) => ({ note: n, score: scoreNoteAgainstQuestion(n, message) }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const tb = new Date(a.note.updatedAt || a.note.createdAt || 0).getTime();
        const ta = new Date(b.note.updatedAt || b.note.createdAt || 0).getTime();
        return ta - tb;
      });

    const top = scored.slice(0, 14).map((s) => s.note);
    const catalogBlock = top.length
      ? top.map((n) => formatNoteForAssistant(n, message)).join('\n\n---\n\n')
      : 'No notes indexed yet.';

    const roleHint = !user
      ? 'The user is anonymous (not logged in). Only describe public behaviour.'
      : isAdmin
        ? 'The user is an admin: you may discuss pending/upcoming notes listed below.'
        : 'The user is a logged-in student: approved notes are public; do not claim they can open pending uploads unless they uploaded them (you do not know per-user upload ownership in this context).';

    const prompt = `You are "NOTESTACK Assistant", the official help and study guide for the NOTESTACK platform.

${roleHint}

Rules:
- Ground answers in WEBSITE KNOWLEDGE and NOTE CATALOG below. If something is not there, say you do not have that detail in the materials you were given.
- For study questions, prefer NOTE CATALOG excerpts; name the note title and subject when you recommend material.
- Pending notes are only included in NOTE CATALOG for admins; for others, never invent pending titles.
- Be concise, friendly, and practical. Use short headings or bullets when helpful.

WEBSITE KNOWLEDGE:
${SITE_KNOWLEDGE}

NOTE CATALOG (retrieval excerpts — may be partial):
${catalogBlock}

${buildAssistantHistoryBlock(history)}
User message: ${message}

Assistant reply:`;

    let answer = '';
    try {
      answer = await askAI(prompt, { maxRetries: 2 });
    } catch (aiError) {
      console.error('Gemini assistant fallback:', aiError.message);
      answer = [
        'I could not reach the AI service just now.',
        top.length
          ? `Here are the most relevant notes in the library for your message: ${top
              .slice(0, 5)
              .map((n) => `"${n.title}" (${n.subject})`)
              .join('; ')}.`
          : 'The note library is empty or still loading.',
        '',
        'Try again in a moment, or open a specific note and use the note AI chat for deeper PDF Q&A.'
      ].join('\n');
    }

    if (!answer || !answer.trim()) {
      answer = 'Sorry — I could not generate a reply. Please try again.';
    }

    res.json({ success: true, answer: cleanAIText(answer) });
  } catch (error) {
    console.error('Assistant chat error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.summarizeNote = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    if (note.type !== 'pdf') {
      return res.status(400).json({ success: false, message: 'AI summary is available only for PDF notes' });
    }

    let text = await getPdfContext(note);
    text = text.slice(0, 15000);

    if (!text.trim()) return res.status(400).json({ success: false, message: 'No content to summarize' });

    let summary = '';
    try {
      summary = await askAI(
        `Summarize this PDF study note in a structured format using sections:
1) Topic
2) Quick Overview (2-3 lines)
3) Key Points (4-6 bullet points)
4) Exam Focus (short)
Keep it clear for students.\n\n${text}`
      , { maxRetries: 2 });
    } catch (aiError) {
      console.error('Gemini summarize fallback:', aiError.message);
      summary = buildFallbackSummary(text, note.title, note.subject);
    }

    if (!summary || !summary.trim()) {
      summary = buildFallbackSummary(text, note.title, note.subject);
    }

    await note.update({ summary });

    res.json({ success: true, summary });
  } catch (error) {
    console.error('Summarize error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateTags = async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    if (note.type !== 'pdf') {
      return res.status(400).json({ success: false, message: 'AI tag extraction is available only for PDF notes' });
    }

    let text = await getPdfContext(note);
    if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'No content for tag extraction' });

    let tags = [];
    try {
      const raw = await askAI(`Extract 8-12 relevant academic keywords from this text. Return only a comma-separated list, no explanation:\n\n${text.slice(0, 3000)}`, { maxRetries: 2 });
      tags = raw.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0 && t.length < 30);
    } catch (aiError) {
      console.error('Gemini tags fallback:', aiError.message);
      tags = buildFallbackTags(text);
    }

    if (!tags.length) tags = buildFallbackTags(text);

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
    if (note.type !== 'pdf') {
      return res.status(400).json({ success: false, message: 'AI Q&A is available only for PDF notes' });
    }

    let context = await getPdfContext(note);

    if (!context.trim()) return res.status(400).json({ success: false, message: 'No content available for this note' });
    const relevantContext = pickRelevantContext(context, question, 9000);

    let answer = '';
    try {
      answer = await askAI(`You are a senior academic AI tutor.
Answer from the PDF context only and keep the response high quality.
If the question asks for steps, return numbered steps.
If it asks for difference/comparison, return a short table-like bullet format.
If answer is not present in context, say "Not found in provided PDF content".
End with a one-line practical takeaway.

Note Content:\n${relevantContext}

Question: ${question}

Answer:`, { maxRetries: 2 });
    } catch (aiError) {
      console.error('Gemini chat fallback:', aiError.message);
      answer = buildFallbackAnswer(relevantContext, question, note.title);
    }

    if (!answer || !answer.trim()) {
      answer = buildFallbackAnswer(relevantContext, question, note.title);
    }

    res.json({ success: true, answer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
