const express = require('express');
const router = express.Router();
const { summarizeNote, generateTags, recommendNotes, chatWithNote } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/summarize/:noteId', protect, summarizeNote);
router.post('/tags/:noteId', protect, generateTags);
router.get('/recommend/:noteId', protect, recommendNotes);
router.post('/chat/:noteId', protect, chatWithNote);

module.exports = router;
