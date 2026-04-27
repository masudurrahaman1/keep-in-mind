const admin = require('../config/firebaseAdmin');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const logActivity = require('../utils/logger');

// @desc    Auth user with Firebase ID token (Google or Email/Password)
// @route   POST /api/auth/firebase
// @access  Public
const authFirebase = async (req, res) => {
  const { token } = req.body;

  console.log('--- Firebase Auth Request ---');

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture, firebase } = decodedToken;
    const provider = firebase?.sign_in_provider === 'password' ? 'local' : 'google';

    console.log(`Token verified for: ${email} (UID: ${uid}, Provider: ${provider})`);

    // Check if user exists by Firebase UID
    let user = await User.findOne({ googleId: uid });

    // If not found by UID, check by Email (for users migrating from old Firebase projects)
    if (!user && email) {
      user = await User.findOne({ email });
      if (user) {
        console.log(`User found by email. Updating UID for: ${email}`);
        user.googleId = uid;
        // Also update avatar if missing
        if (!user.avatar && picture) user.avatar = picture;
        await user.save();
      }
    }

    if (!user) {
      console.log(`Creating new user record for: ${email}`);
      user = await User.create({
        googleId: uid, // We use googleId field to store the universal Firebase UID
        email,
        name: name || email.split('@')[0],
        avatar: picture || '',
        authProvider: provider,
        isVerified: true 
      });
      
      await logActivity({
        title: "New User Registration",
        actor: email,
        type: "success",
        details: `Account created via ${provider === 'google' ? 'Google OAuth' : 'Email/Password'}`
      });
    } else {
      await logActivity({
        title: "User Login",
        actor: email,
        type: "neutral",
        details: `Session started via ${provider === 'google' ? 'Google OAuth' : 'Email/Password'}`
      });
    }


    // ── 2FA Gate ──────────────────────────────────────────────
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      // Issue a short-lived "pending" token — not a real session yet
      const pendingToken = jwt.sign(
        { id: user._id, pending2FA: true },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      return res.json({
        twoFactorRequired: true,
        pendingToken,
        // Send minimal info so the UI can show the user's name
        user: { name: user.name, email: user.email, avatar: user.avatar },
      });
    }

    // No 2FA → grant full session immediately
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider,
        googleId: user.googleId
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Firebase Verification Error:', error.message);
    res.status(401).json({ message: `Authentication failed: ${error.message}` });
  }
};

// @desc    Link Google account to existing user
// @route   POST /api/auth/link-google
// @access  Private
const linkGoogle = async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, picture } = decodedToken;

    // Check if this googleId is already linked to ANOTHER user
    const existingGoogleUser = await User.findOne({ googleId: uid });
    if (existingGoogleUser && existingGoogleUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'This Google account is already linked to another profile.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.googleId = uid;
    if (!user.avatar && picture) user.avatar = picture;
    await user.save();

    res.json({
      message: 'Google account linked successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    console.error('Link Google Error:', error.message);
    res.status(401).json({ message: `Linking failed: ${error.message}` });
  }
};

// @desc    Update user "last seen" timestamp
// @route   POST /api/auth/ping
// @access  Private
const ping = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id, 
      { lastActive: new Date() }, 
      { new: true }
    );
    
    if (user) {
      res.json({ message: 'Ping successful', lastActive: user.lastActive });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { authFirebase, linkGoogle, ping };
