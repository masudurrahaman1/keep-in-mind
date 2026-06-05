const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String
  },
  verificationCodeExpiresAt: {
    type: Date
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  galleryFolderId: {
    type: String,
    default: null
  },
  googleAccessToken: {
    type: String,
    default: null
  },
  googleRefreshToken: {
    type: String,
    default: null
  },
  rootFolderId: {
    type: String,
    default: null
  },
  documentsFolderId: {
    type: String,
    default: null
  },
  myFilesFolderId: {
    type: String,
    default: null
  },
  // Old hardcoded folder IDs removed in favor of Folder collection
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
