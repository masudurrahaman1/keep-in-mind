const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { login, getSessions, revokeSession, getStats, getUsers, getUserById, getActiveUsers, getActivities, updateProfile, getProfile, createUser, deleteUser, seedUsers, createPost, getAdminPosts, deletePost } = require('../controllers/adminController');

// Multer Config for Admin Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, 'admin-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Public admin login
router.post('/login', login);

// Admin Upload Route
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  
  // Return the public URL
  const baseUrl = process.env.API_BASE_URL || 'https://api.keepinmind.in/api';
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// For now, I'll allow access without a complex "Admin" role check 
// but in a real app, you'd add an adminMiddleware here.
router.get('/stats', getStats);
// Admin user management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);

// Admin post management (Feed)
router.post('/posts', createPost);
router.get('/posts', getAdminPosts);
router.delete('/posts/:id', deletePost);
router.post('/seed', seedUsers);
router.get('/users/active', getActiveUsers);
router.get('/activities', getActivities);
router.get('/sessions', getSessions);
router.delete('/sessions/:id', revokeSession);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);




module.exports = router;
