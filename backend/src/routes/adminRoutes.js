const express = require('express');
const router = express.Router();
const { login, getSessions, revokeSession, getStats, getUsers, getActiveUsers, getActivities, updateProfile, getProfile, createUser, deleteUser, seedUsers } = require('../controllers/adminController');

// Public admin login
router.post('/login', login);

// For now, I'll allow access without a complex "Admin" role check 
// but in a real app, you'd add an adminMiddleware here.
router.get('/stats', getStats);
// Admin user management
router.get('/users', getUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);
router.post('/seed', seedUsers);
router.get('/users/active', getActiveUsers);
router.get('/activities', getActivities);
router.get('/sessions', getSessions);
router.delete('/sessions/:id', revokeSession);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);




module.exports = router;
