const express = require('express');
const router = express.Router();
const { topDownloads, leaderboard, subjectStats, weeklyUploads, overview } = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/top-downloads', protect, adminOnly, topDownloads);
router.get('/leaderboard', protect, adminOnly, leaderboard);
router.get('/subject-stats', protect, adminOnly, subjectStats);
router.get('/weekly-uploads', protect, adminOnly, weeklyUploads);
router.get('/overview', protect, adminOnly, overview);

module.exports = router;
