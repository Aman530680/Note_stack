const express = require('express');
const router = express.Router();
const { summarizeNote, generateTags, recommendNotes, chatWithNote, assistantChat } = require('../controllers/aiController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/assistant', optionalAuth, assistantChat);
router.post('/summarize/:noteId', protect, summarizeNote);
router.post('/tags/:noteId', protect, generateTags);
router.get('/recommend/:noteId', protect, recommendNotes);
router.post('/chat/:noteId', protect, chatWithNote);

module.exports = router;
