const admin = require('../config/firebaseAdmin');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendVerificationEmail } = require('../utils/mailer');
const crypto = require('crypto');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Auth user with Firebase ID token
// @route   POST /api/auth/google
// @access  Public
const authGoogle = async (req, res) => {
  const { token } = req.body;

  console.log('--- Firebase Auth Request ---');

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    console.log(`Token verified for: ${email} (UID: ${uid})`);

    let user = await User.findOne({ googleId: uid });

    if (!user) {
      console.log(`Creating new local user record for: ${email}`);
      user = await User.create({
        googleId: uid,
        email,
        name: name || email.split('@')[0],
        avatar: picture,
        authProvider: 'google'
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
        authProvider: user.authProvider || 'local',
        googleId: user.googleId
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Firebase Verification Error:', error.message);
    res.status(401).json({ message: `Authentication failed: ${error.message}` });
  }
};

// @desc    Register a new user with Email and Password
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      if (userExists.authProvider === 'google') {
        return res.status(400).json({ message: 'This email is already linked to a Google account. Please use Continue with Google.' });
      }
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const verificationCode = generateOTP();
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      authProvider: 'local',
      isVerified: false,
      verificationCode,
      verificationCodeExpiresAt
    });

    await sendVerificationEmail(user.email, verificationCode);

    res.status(201).json({
      message: 'Registration successful. Please check your email for the verification code.',
      email: user.email
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Verify OTP for newly registered user
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified.' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    if (new Date() > user.verificationCodeExpiresAt) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;
    await user.save();

    res.json({
      message: 'Email verified successfully.',
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
    console.error('Verification Error:', error.message);
    res.status(500).json({ message: 'Server error during verification.' });
  }
};

// @desc    Login with Email and Password
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.authProvider !== 'local') {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      // Re-send code if they are trying to log in but never verified
      const verificationCode = generateOTP();
      user.verificationCode = verificationCode;
      user.verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendVerificationEmail(user.email, verificationCode);
      
      return res.status(403).json({ 
        message: 'Email not verified. A new verification code has been sent to your email.',
        unverified: true 
      });
    }

    // ── 2FA Gate ──────────────────────────────────────────────
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const pendingToken = jwt.sign(
        { id: user._id, pending2FA: true },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      return res.json({
        twoFactorRequired: true,
        pendingToken,
        user: { name: user.name, email: user.email, avatar: user.avatar },
      });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider || 'local',
        googleId: user.googleId
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login.' });
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
    const user = await User.findById(req.user._id);
    if (user) {
      // Just saving updates the updatedAt timestamp automatically
      await user.save();
      res.json({ message: 'Ping successful', lastSeen: user.updatedAt });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { authGoogle, registerUser, verifyEmail, loginUser, linkGoogle, ping };

