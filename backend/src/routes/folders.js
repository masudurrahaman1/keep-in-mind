const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');
const { protect } = require('../middleware/authMiddleware');

// Get all folders for a user
router.get('/', protect, async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { ensureCustomFolderInDrive, renameFileInDrive, deleteFileFromDrive } = require('../services/driveService');
const Document = require('../models/Document');
const User = require('../models/User');

// Create a new folder
router.post('/', protect, async (req, res) => {
  try {
    const { name, iconName, colorClass, path } = req.body;
    const folder = new Folder({
      user: req.user._id,
      name,
      iconName,
      colorClass,
      path: path || `/vault/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    });
    
    // Try to create the folder in Google Drive immediately
    try {
      const driveFolderId = await ensureCustomFolderInDrive(req.user._id, name);
      if (driveFolderId) {
        folder.driveFolderId = driveFolderId;
      }
    } catch (driveErr) {
      console.error('[FolderRoute] Could not create Drive folder synchronously:', driveErr.message);
    }

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a folder
router.delete('/:id', protect, async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Delete from Google Drive if it exists
    if (folder.driveFolderId) {
      const user = await User.findById(req.user._id);
      if (user) {
        await deleteFileFromDrive(user, folder.driveFolderId);
      }
    }

    // Delete all documents associated with this folder from MongoDB
    await Document.deleteMany({ user: req.user._id, category: folder.name });

    // Finally delete the folder record
    await Folder.findByIdAndDelete(folder._id);

    res.json({ message: 'Folder deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a folder
router.patch('/:id', protect, async (req, res) => {
  try {
    const { name, iconName, colorClass, isPinned, isLocked, isShared } = req.body;
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const oldName = folder.name;

    if (name !== undefined) folder.name = name;
    if (iconName !== undefined) folder.iconName = iconName;
    if (colorClass !== undefined) folder.colorClass = colorClass;
    if (isPinned !== undefined) folder.isPinned = isPinned;
    if (isLocked !== undefined) folder.isLocked = isLocked;
    if (isShared !== undefined) folder.isShared = isShared;

    if (name && name !== oldName) {
      folder.path = `/vault/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      
      // Rename in Drive
      if (folder.driveFolderId) {
        try {
          const user = await User.findById(req.user._id);
          if (user) {
            await renameFileInDrive(user, folder.driveFolderId, name);
          }
        } catch (driveErr) {
          console.error('[FolderRoute] Could not rename Drive folder:', driveErr.message);
        }
      }

      // Update category name in Document collection
      await Document.updateMany(
        { user: req.user._id, category: oldName },
        { $set: { category: name } }
      );
    }

    // Conflict resolution
    if (req.body.updatedAt && folder.updatedAt) {
      if (new Date(req.body.updatedAt).getTime() < new Date(folder.updatedAt).getTime()) {
        return res.status(409).json({ message: 'Conflict: Server has a newer version', latest: folder });
      }
    }

    await folder.save();
    res.json(folder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
