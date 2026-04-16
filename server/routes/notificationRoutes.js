const express = require('express');
const router = express.Router();
const { 
  getNotifications, 
  markAsSeen, 
  markAllAsSeen,
  getUnseenCount 
} = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getNotifications);
router.get('/unseen/count', protect, adminOnly, getUnseenCount);
router.put('/:id/seen', protect, adminOnly, markAsSeen);
router.put('/seen/all', protect, adminOnly, markAllAsSeen);

module.exports = router;
