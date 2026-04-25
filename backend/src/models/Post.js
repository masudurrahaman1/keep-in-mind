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
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
