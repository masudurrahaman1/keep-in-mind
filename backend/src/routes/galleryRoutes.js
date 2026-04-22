const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {
  uploadMedia,
  getMediaList,
  getTrashedMedia,
  deleteMedia,
  restoreMedia,
  permanentDeleteMedia,
  getGalleryStorage,
  streamMedia,
  renameMedia
} = require('../controllers/galleryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Publicly accessible streaming route (secured by Google Token in query param)
router.get('/stream/:fileId', streamMedia);

// All gallery routes are protected
// Configure multer for disk storage to handle files safely (up to 100MB)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../temp');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// All gallery routes are protected
router.get('/', protect, getMediaList);
router.get('/trash', protect, getTrashedMedia);
router.get('/storage', protect, getGalleryStorage);
router.post('/upload', protect, upload.single('file'), uploadMedia);
router.patch('/:id/rename', protect, renameMedia);
router.patch('/:id/restore', protect, restoreMedia);
router.delete('/:id', protect, deleteMedia);
router.delete('/:id/permanent', protect, permanentDeleteMedia);

module.exports = router;
