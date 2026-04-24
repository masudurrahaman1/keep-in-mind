const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  actor: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL'],
    default: 'INFO'
  },
  type: {
    type: String,
    enum: ['success', 'warning', 'error', 'neutral'],
    default: 'neutral'
  },
  ip: {
    type: String
  },
  details: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
