const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  device: {
    type: String,
    required: true
  },
  os: {
    type: String,
    required: true
  },
  browser: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: "Unknown"
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isCurrent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
