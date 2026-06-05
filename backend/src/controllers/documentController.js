const { uploadFileToDrive, getDriveClient, renameFileInDrive, deleteFileFromDrive } = require('../services/driveService');
const Document = require('../models/Document');
const User = require('../models/User');

/**
 * @desc    Upload file directly to Google Drive
 * @route   POST /api/documents/upload
 * @access  Private
 */
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { category, title, isEncrypted } = req.body;
    const userId = req.user._id;

    let finalCategory = category || 'Other';
    if (isEncrypted === 'true' || isEncrypted === true) {
      finalCategory = 'Encrypted';
    }

    // 1. Upload to Google Drive
    const driveFile = await uploadFileToDrive(
      userId,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      finalCategory
    );

    // 2. Save metadata to MongoDB Document model
    const doc = new Document({
      user: userId,
      title: title || req.file.originalname,
      driveFileId: driveFile.id,
      category: finalCategory,
      mimeType: req.file.mimetype,
      size: req.file.size,
      thumbnailUrl: driveFile.thumbnailLink || null,
      isEncrypted: isEncrypted === 'true' || isEncrypted === true
    });

    await doc.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      document: doc,
      driveData: driveFile // Contains webViewLink and iconLink if needed
    });
  } catch (error) {
    console.error('Upload Controller Error:', error.message);
    require('fs').writeFileSync('upload_error.log', error.stack + '\n\n' + JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    const status = error.status || error.code || (error.response && error.response.status) || 500;
    res.status(status).json({ message: error.message || 'File upload failed' });
  }
};

/**
 * @desc    Get all documents for a specific category
 * @route   GET /api/documents/:category
 * @access  Private
 */
const getDocumentsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const Folder = require('../models/Folder');
    const folder = await Folder.findOne({ 
      user: req.user._id, 
      $or: [{ path: `/documents/${category}` }, { path: `/vault/${category}` }]
    });

    let decodedCategory;
    if (folder) {
      decodedCategory = folder.name;
    } else {
      // Fallback for missing folder
      decodedCategory = category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace('Ids', 'IDs');
    }

    const documents = await Document.find({ 
      user: req.user._id,
      category: decodedCategory
    }).sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error('Get Documents Error:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
};

/**
 * @desc    Get document counts grouped by category
 * @route   GET /api/documents/metrics/counts
 * @access  Private
 */
const getDocumentCounts = async (req, res) => {
  try {
    const counts = await Document.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const countsMap = counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.json(countsMap);
  } catch (error) {
    console.error('Get Document Counts Error:', error);
    res.status(500).json({ message: 'Failed to fetch document counts' });
  }
};

/**
 * @desc    Delete a document
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // 1. Delete from Google Drive
    const user = await User.findById(req.user._id);
    await deleteFileFromDrive(user, doc.driveFileId);

    // 2. Delete from MongoDB
    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete Document Error:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
};

/**
 * @desc    Rename a document
 * @route   PATCH /api/documents/:id/rename
 * @access  Private
 */
const renameDocument = async (req, res) => {
  try {
    const { newName } = req.body;
    if (!newName) {
      return res.status(400).json({ message: 'New name is required' });
    }

    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // 1. Rename in Google Drive
    const user = await User.findById(req.user._id);
    await renameFileInDrive(user, doc.driveFileId, newName);

    // 2. Rename in MongoDB
    doc.title = newName;
    await doc.save();

    res.json({ message: 'Document renamed successfully', document: doc });
  } catch (error) {
    console.error('Rename Document Error:', error);
    res.status(500).json({ message: 'Failed to rename document' });
  }
};

/**
 * @desc    Move a document to another category
 * @route   PATCH /api/documents/:id/move
 * @access  Private
 */
const moveDocument = async (req, res) => {
  try {
    const { newCategory } = req.body;
    if (!newCategory) {
      return res.status(400).json({ message: 'New category is required' });
    }

    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Find the new folder in MongoDB
    const Folder = require('../models/Folder');
    const newFolderDoc = await Folder.findOne({ user: req.user._id, name: newCategory });
    
    if (!newFolderDoc || !newFolderDoc.driveFolderId) {
      return res.status(400).json({ message: 'Destination folder not found or not synced with Drive' });
    }

    // Find the old folder to remove from
    const oldFolderDoc = await Folder.findOne({ user: req.user._id, name: doc.category });
    
    if (oldFolderDoc && oldFolderDoc.driveFolderId) {
      // 1. Move in Google Drive
      const user = await User.findById(req.user._id);
      const drive = getDriveClient(user);
      
      await drive.files.update({
        fileId: doc.driveFileId,
        addParents: newFolderDoc.driveFolderId,
        removeParents: oldFolderDoc.driveFolderId,
        fields: 'id, parents'
      });
    }

    // 2. Move in MongoDB
    doc.category = newCategory;
    await doc.save();

    res.json({ message: 'Document moved successfully', document: doc });
  } catch (error) {
    console.error('Move Document Error:', error);
    res.status(500).json({ message: 'Failed to move document' });
  }
};

/**
 * @desc    Stream document directly from Google Drive
 * @route   GET /api/documents/stream/:fileId
 * @access  Private (uses token in query or headers)
 */
const streamDocument = async (req, res) => {
  const { fileId } = req.params;
  const { download } = req.query;

  try {
    const doc = await Document.findOne({ driveFileId: fileId });
    const user = await User.findById(doc ? doc.user : req.user._id);
    
    if (!user || !user.googleAccessToken) {
      return res.status(401).json({ message: 'Unauthorized or missing Google tokens' });
    }

    const drive = getDriveClient(user);

    const contentType = doc ? doc.mimeType : 'application/octet-stream';
    const fileName = doc ? doc.title : fileId;

    const driveResponse = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    if (download === 'true') {
      const safeFileName = encodeURIComponent(fileName);
      res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    } else {
      res.setHeader('Content-Disposition', 'inline');
    }

    driveResponse.data
      .on('error', (err) => {
        console.error(`[Stream Error] ${fileId}:`, err.message);
        if (!res.headersSent) res.status(500).end();
      })
      .pipe(res);

  } catch (error) {
    console.error(`[Streaming Failed] ${fileId}:`, error.message);
    if (!res.headersSent) {
      const status = error.response?.status || 500;
      res.status(status).json({ message: 'Streaming failed', error: error.message });
    }
  }
};

/**
 * @desc    Sync documents with Google Drive (remove DB records if missing from Drive)
 * @route   POST /api/documents/sync/:category
 * @access  Private
 */
const syncDocumentsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const decodedCategory = category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace('Ids', 'IDs');

    const user = await User.findById(req.user._id);
    if (!user.googleAccessToken) {
      return res.status(401).json({ message: 'Google Drive not connected' });
    }

    const drive = getDriveClient(user);
    const dbDocs = await Document.find({ user: user._id, category: decodedCategory });

    if (dbDocs.length === 0) {
      return res.json({ message: 'No documents to sync', deletedCount: 0 });
    }

    const Folder = require('../models/Folder');
    const customFolder = await Folder.findOne({ user: user._id, name: decodedCategory });
    let folderId = null;
    if (customFolder && customFolder.driveFolderId) {
      folderId = customFolder.driveFolderId;
    }

    if (!folderId) {
      return res.json({ message: 'Folder not found in Drive, skipping sync.', deletedCount: 0 });
    }

    let driveFileIds = new Set();
    let pageToken = null;

    do {
      const driveRes = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id)',
        spaces: 'drive',
        pageToken: pageToken
      });
      driveRes.data.files.forEach(f => driveFileIds.add(f.id));
      pageToken = driveRes.data.nextPageToken;
    } while (pageToken);

    let deletedCount = 0;
    
    for (const doc of dbDocs) {
      if (!driveFileIds.has(doc.driveFileId)) {
        await Document.findByIdAndDelete(doc._id);
        deletedCount++;
      }
    }

    res.json({ message: 'Sync complete', deletedCount });
  } catch (error) {
    console.error('Sync Documents Error:', error);
    res.status(500).json({ message: 'Failed to sync documents' });
  }
};

module.exports = {
  uploadDocument,
  getDocumentsByCategory,
  deleteDocument,
  renameDocument,
  moveDocument,
  streamDocument,
  getDocumentCounts,
  syncDocumentsByCategory
};
