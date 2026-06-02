const { google } = require('googleapis');
const User = require('../models/User');

const FOLDERS = [
  'Government IDs',
  'Education',
  'Medical',
  'Banking',
  'Property',
  'Others',
  'Notes',
  'Backups',
  'Encrypted'
];

/**
 * Creates an OAuth2 client for a specific user
 */
const getDriveClient = (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NODE_ENV === 'production' ? 'https://keep-in-mind-1.onrender.com/api/auth/google/callback' : 'http://localhost:5000/api/auth/google/callback'
  );

  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
};

/**
 * Creates a folder in Google Drive
 */
const createDriveFolder = async (drive, name, parentId = null) => {
  const fileMetadata = {
    name: name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    fileMetadata.parents = [parentId];
  }

  try {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });
    return file.data.id;
  } catch (error) {
    console.error(`Error creating folder ${name}:`, error.message);
    throw error;
  }
};

/**
 * Asynchronously initializes the KeepInMind folder structure
 */
const initializeUserDrive = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.googleAccessToken) {
      console.log(`User ${userId} lacks Google tokens. Skipping Drive init.`);
      return;
    }

    console.log(`Starting Drive initialization/verification for User ${userId}...`);
    const drive = getDriveClient(user);

    // 1. Verify or Create Root Folder
    let rootFolderId = user.rootFolderId;
    let rootFolderExists = false;

    if (rootFolderId) {
      try {
        const rootRes = await drive.files.get({ fileId: rootFolderId, fields: 'id, trashed' });
        if (!rootRes.data.trashed) {
          rootFolderExists = true;
        }
      } catch (err) {
        console.log(`Root folder ${rootFolderId} not found in Drive. Will recreate or find.`);
      }
    }

    if (!rootFolderExists) {
      const rootSearch = await drive.files.list({
        q: "name = 'KeepInMind' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields: 'files(id)', spaces: 'drive',
      });
      if (rootSearch.data.files.length > 0) {
        rootFolderId = rootSearch.data.files[0].id;
      } else {
        rootFolderId = await createDriveFolder(drive, 'KeepInMind');
      }
      user.rootFolderId = rootFolderId;
      await user.save(); // Save early
    }

    // 2. Fetch existing subfolders from Drive
    const existingFoldersRes = await drive.files.list({
      q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)', spaces: 'drive',
    });
    
    const existingFolders = existingFoldersRes.data.files || [];
    const existingFolderNames = existingFolders.map(f => f.name);

    const schemaFieldMap = {
      'Government IDs': 'governmentFolderId',
      'Education': 'educationFolderId',
      'Medical': 'medicalFolderId',
      'Banking': 'bankingFolderId',
      'Property': 'propertyFolderId',
      'Others': 'othersFolderId',
      'Notes': 'notesFolderId',
      'Backups': 'backupsFolderId',
      'Encrypted': 'encryptedFolderId'
    };

    // Update DB with active IDs
    existingFolders.forEach(f => {
      const field = schemaFieldMap[f.name];
      if (field) user[field] = f.id;
    });

    // 3. Determine missing folders and create them
    const missingFolders = FOLDERS.filter(name => !existingFolderNames.includes(name));
    
    if (missingFolders.length > 0) {
      console.log(`Creating missing folders: ${missingFolders.join(', ')}`);
      const folderPromises = missingFolders.map(async (folderName) => {
        const folderId = await createDriveFolder(drive, folderName, rootFolderId);
        return { name: folderName, id: folderId };
      });

      const results = await Promise.allSettled(folderPromises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { name, id } = result.value;
          const exactField = schemaFieldMap[name];
          if (exactField) user[exactField] = id;
        } else {
          console.error('Failed to create a missing subfolder:', result.reason);
        }
      });
    }

    await user.save();
    console.log(`Successfully verified/initialized Drive folders for User ${userId}`);
    
  } catch (error) {
    console.error(`Fatal error in initializeUserDrive for ${userId}:`, error.message);
  }
};

const uploadFileToDrive = async (userId, fileBuffer, originalName, mimeType, category, isRetry = false) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.googleAccessToken) {
      throw new Error('User lacks Google tokens');
    }

    const drive = getDriveClient(user);

    // Map category to the exact field name in schema
    const schemaFieldMap = {
      'Government IDs': 'governmentFolderId',
      'Education': 'educationFolderId',
      'Medical': 'medicalFolderId',
      'Banking': 'bankingFolderId',
      'Property': 'propertyFolderId',
      'Others': 'othersFolderId',
      'Notes': 'notesFolderId',
      'Backups': 'backupsFolderId',
      'Encrypted': 'encryptedFolderId',
      'KeepInMind': 'rootFolderId'
    };

    const targetField = schemaFieldMap[category] || schemaFieldMap['Others'];
    let parentFolderId = user[targetField];

    if (!parentFolderId) {
      console.log(`[DriveService] Folder ID missing for category "${category}". Resolving dynamically...`);
      
      // 1. Ensure root folder exists
      let rootFolderId = user.rootFolderId;
      if (!rootFolderId) {
        const rootRes = await drive.files.list({
          q: "name = 'KeepInMind' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
          fields: 'files(id)', spaces: 'drive',
        });
        if (rootRes.data.files.length > 0) {
          rootFolderId = rootRes.data.files[0].id;
        } else {
          const rootFolder = await drive.files.create({ requestBody: { name: 'KeepInMind', mimeType: 'application/vnd.google-apps.folder' }, fields: 'id' });
          rootFolderId = rootFolder.data.id;
        }
        user.rootFolderId = rootFolderId;
      }

      // 2. Ensure category folder exists
      const safeCategory = category || 'Others';
      const catRes = await drive.files.list({
        q: `name = '${safeCategory.replace(/'/g, "\\'")}' and '${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id)', spaces: 'drive',
      });
      if (catRes.data.files.length > 0) {
        parentFolderId = catRes.data.files[0].id;
      } else {
        const catFolder = await drive.files.create({ requestBody: { name: safeCategory, parents: [rootFolderId], mimeType: 'application/vnd.google-apps.folder' }, fields: 'id' });
        parentFolderId = catFolder.data.id;
      }
      
      // Save it back to user doc
      user[targetField] = parentFolderId;
      await user.save();
    }

    const { Readable } = require('stream');
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);

    const fileMetadata = {
      name: originalName,
      parents: [parentFolderId]
    };

    const media = {
      mimeType: mimeType,
      body: stream
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, iconLink, thumbnailLink'
    });

    return response.data;
  } catch (error) {
    const isNotFound = error.code === 404 || error.status === 404 || (error.message && error.message.includes('File not found'));
    
    if (isNotFound && !isRetry) {
      console.log(`[DriveService] Parent folder not found for category "${category}". Clearing DB references and retrying...`);
      const user = await User.findById(userId);
      const schemaFieldMap = {
        'Government IDs': 'governmentFolderId', 'Education': 'educationFolderId',
        'Medical': 'medicalFolderId', 'Banking': 'bankingFolderId',
        'Property': 'propertyFolderId', 'Others': 'othersFolderId',
        'Notes': 'notesFolderId', 'Backups': 'backupsFolderId',
        'Encrypted': 'encryptedFolderId', 'KeepInMind': 'rootFolderId'
      };
      const targetField = schemaFieldMap[category] || schemaFieldMap['Others'];
      user[targetField] = null;
      user.rootFolderId = null; // Clear root folder ID too, just in case that's what was deleted
      await user.save();
      return uploadFileToDrive(userId, fileBuffer, originalName, mimeType, category, true);
    }

    console.error('Error uploading file to Drive:', error.message);
    throw error;
  }
};

/**
 * Renames a file in Google Drive
 */
const renameFileInDrive = async (user, fileId, newName) => {
  try {
    if (!user || !user.googleAccessToken) throw new Error('Missing Google tokens');
    const drive = getDriveClient(user);
    await drive.files.update({
      fileId,
      requestBody: { name: newName }
    });
  } catch (error) {
    console.error(`Error renaming file ${fileId} in Drive:`, error.message);
    throw error;
  }
};

/**
 * Permanently deletes a file from Google Drive
 */
const deleteFileFromDrive = async (user, fileId) => {
  try {
    if (!user || !user.googleAccessToken) throw new Error('Missing Google tokens');
    const drive = getDriveClient(user);
    await drive.files.delete({ fileId });
  } catch (error) {
    console.warn(`Could not delete file ${fileId} from Drive (may already be deleted):`, error.message);
  }
};

module.exports = {
  getDriveClient,
  initializeUserDrive,
  createDriveFolder,
  uploadFileToDrive,
  renameFileInDrive,
  deleteFileFromDrive
};
