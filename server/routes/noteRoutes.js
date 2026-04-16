const express = require('express');
const router = express.Router();
const {
  uploadNote,
  getNotes,
  searchNotes,
  getNote,
  incrementDownload,
  getAllNotes,
  approveNote,
  deleteNote,
  getTrendingNotes,
  updateNote,
  deleteOwnNote,
  getMyNotes
} = require('../controllers/noteController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public/Student routes
router.post('/upload', protect, upload.single('file'), uploadNote);
router.get('/', protect, getNotes);
router.get('/search', protect, searchNotes);
router.get('/trending', protect, getTrendingNotes);
router.get('/my/all', protect, getMyNotes);
router.get('/:id', getNote); // Public - anyone can view
router.put('/:id/download', protect, incrementDownload);
router.put('/:id', protect, updateNote);
router.delete('/my/:id', protect, deleteOwnNote);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllNotes);
router.put('/:id/approve', protect, adminOnly, approveNote);
router.delete('/:id', protect, adminOnly, deleteNote);

module.exports = router;
