const express = require('express');
const router = express.Router();
const { submitRating, getRatings, checkUserRating, approveComment, getAllComments } = require('../controllers/ratingController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, submitRating);
router.get('/:noteId', protect, getRatings);
router.get('/check/:noteId', protect, checkUserRating);
router.get('/admin/comments', protect, adminOnly, getAllComments);
router.put('/:id/approve-comment', protect, adminOnly, approveComment);

module.exports = router;
