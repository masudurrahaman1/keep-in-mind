const express = require('express');
const router = express.Router();
const { getStats, getUsers, getActiveUsers, getActivities, updateProfile } = require('../controllers/adminController');

// For now, I'll allow access without a complex "Admin" role check 
// but in a real app, you'd add an adminMiddleware here.
router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/active', getActiveUsers);
router.get('/activities', getActivities);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);




module.exports = router;
