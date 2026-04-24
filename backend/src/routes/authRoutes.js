const express = require('express');
const { authGoogle, registerUser, loginUser, verifyEmail, linkGoogle, ping } = require('../controllers/authController');
const { setup2FA, verify2FA, disable2FA, get2FAStatus, loginVerify2FA } = require('../controllers/twoFactorController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/google', authGoogle);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/link-google', protect, linkGoogle);
router.post('/ping', protect, ping);

// Two-Factor Authentication routes

router.get('/2fa/status',        protect,      get2FAStatus);
router.post('/2fa/setup',        protect,      setup2FA);
router.post('/2fa/verify',       protect,      verify2FA);
router.post('/2fa/disable',      protect,      disable2FA);
// Public: completes 2FA login using a pending token (not a full JWT)
router.post('/2fa/login-verify',               loginVerify2FA);

module.exports = router;
