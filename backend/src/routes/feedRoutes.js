const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// @desc    Get all public posts for the Explore feed
// @route   GET /api/feed
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ isPublic: true }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
