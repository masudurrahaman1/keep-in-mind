const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  iconName: {
    type: String,
    default: 'Folder'
  },
  colorClass: {
    type: String,
    default: 'bg-neutral-50 text-neutral-500 dark:bg-neutral-500/10 dark:text-neutral-400'
  },
  path: {
    type: String
  },
  driveFolderId: {
    type: String,
    default: null
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isShared: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Folder', folderSchema);
