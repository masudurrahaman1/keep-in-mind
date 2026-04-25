const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/authMiddleware');

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

// @desc    Get single post
// @route   GET /api/feed/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.isPublic) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Toggle like
// @route   POST /api/feed/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const userId = req.user._id.toString();
    const index = post.likedBy.indexOf(userId);
    
    if (index === -1) {
      post.likedBy.push(userId);
      post.likes += 1;
    } else {
      post.likedBy.splice(index, 1);
      post.likes = Math.max(0, post.likes - 1);
    }
    
    await post.save();
    res.json({ likes: post.likes, likedBy: post.likedBy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add comment
// @route   POST /api/feed/:id/comments
// @access  Private
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      text,
      user: req.user.name || req.user.email,
      userEmail: req.user.email
    };

    post.comments.push(comment);
    await post.save();
    
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
