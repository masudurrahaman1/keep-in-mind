const express = require('express');
const multer = require('multer');
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
// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
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
