const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');

/**
 * @desc  Generate a new 2FA secret + QR code URI (does NOT enable yet)
 * @route POST /api/auth/2fa/setup
 */
const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate a TOTP secret tied to the user's email
    const secret = speakeasy.generateSecret({
      name: `Keep In Mind (${user.email})`,
      length: 20,
    });

    // Temporarily store the secret (not yet "enabled")
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code as a data URL
    const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      qrCode: qrDataUrl,
      manualKey: secret.base32,
    });
  } catch (err) {
    console.error('2FA Setup Error:', err);
    res.status(500).json({ message: 'Failed to set up 2FA' });
  }
};

/**
 * @desc  Verify TOTP code and enable 2FA
 * @route POST /api/auth/2fa/verify
 */
const verify2FA = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Code is required' });

  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: 'Run setup first' });
    }

    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: String(code).replace(/\s/g, ''),
      window: 2,
    });

    if (!valid) {
      return res.status(400).json({ message: 'Invalid code. Please try again.' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: '2FA enabled successfully!', twoFactorEnabled: true });
  } catch (err) {
    console.error('2FA Verify Error:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
};

/**
 * @desc  Disable 2FA after verifying current TOTP code
 * @route POST /api/auth/2fa/disable
 */
const disable2FA = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Code is required' });

  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: String(code).replace(/\s/g, ''),
      window: 2,
    });

    if (!valid) {
      return res.status(400).json({ message: 'Invalid code. Cannot disable 2FA.' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret  = null;
    await user.save();

    res.json({ message: '2FA disabled successfully.', twoFactorEnabled: false });
  } catch (err) {
    console.error('2FA Disable Error:', err);
    res.status(500).json({ message: 'Failed to disable 2FA' });
  }
};

/**
 * @desc  Get current 2FA status for the logged-in user
 * @route GET /api/auth/2fa/status
 */
const get2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('twoFactorEnabled');
    res.json({ twoFactorEnabled: user?.twoFactorEnabled ?? false });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch 2FA status' });
  }
};

/**
 * @desc  Complete login by verifying TOTP code with a pending token
 * @route POST /api/auth/2fa/login-verify  (public — uses pendingToken, not JWT)
 */
const loginVerify2FA = async (req, res) => {
  const { pendingToken, code } = req.body;
  if (!pendingToken || !code) {
    return res.status(400).json({ message: 'pendingToken and code are required' });
  }

  try {
    // Decode & validate the short-lived pending token
    let decoded;
    try {
      decoded = jwt.verify(pendingToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Session expired. Please sign in again.' });
    }

    if (!decoded.pending2FA) {
      return res.status(401).json({ message: 'Invalid token type.' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA is not set up for this account.' });
    }

    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: String(code).replace(/\s/g, ''),
      window: 2,
    });

    if (!valid) {
      return res.status(400).json({ message: 'Incorrect code. Please try again.' });
    }

    // Code is valid — grant a full session
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('2FA Login Verify Error:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
};

module.exports = { setup2FA, verify2FA, disable2FA, get2FAStatus, loginVerify2FA };
