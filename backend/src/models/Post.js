const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String, // URL to image
  },
  category: {
    type: String,
    default: 'Announcement'
  },
  author: {
    type: String,
    default: 'Executive Admin'
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String // user uid or email
  }],
  comments: [{
    text: { type: String, required: true },
    user: { type: String, required: true },
    userEmail: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
