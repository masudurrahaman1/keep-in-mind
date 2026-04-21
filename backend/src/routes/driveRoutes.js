const express = require('express');
const { syncToDrive, fetchFromDrive, getStorageQuota } = require('../controllers/driveController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Both routes are protected by our JWT middleware
router.post('/sync',    protect, syncToDrive);
router.post('/fetch',   protect, fetchFromDrive);
router.post('/storage', protect, getStorageQuota);

module.exports = router;
