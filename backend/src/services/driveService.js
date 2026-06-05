const { google } = require('googleapis');
const User = require('../models/User');

const FOLDERS = [
  'Government ID',
  'Bank & Finance',
  'Insurance',
  'Education',
  'Health',
  'Other'
];

const Folder = require('../models/Folder');
const { seedDefaultFolders } = require('./folderService');

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

  // Listen for automatic token refresh and save new tokens to MongoDB
  oauth2Client.on('tokens', async (tokens) => {
    try {
      let updated = false;
      if (tokens.refresh_token) {
        user.googleRefreshToken = tokens.refresh_token;
        updated = true;
      }
      if (tokens.access_token) {
        user.googleAccessToken = tokens.access_token;
        updated = true;
      }
      if (updated) {
        await user.save();
        console.log(`[DriveService] Automatically refreshed and saved Google tokens for user ${user._id}`);
      }
    } catch (err) {
      console.error(`[DriveService] Failed to save refreshed tokens for user ${user._id}:`, err);
    }
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

    // Ensure default folders exist in MongoDB first
    await seedDefaultFolders(userId);

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

    // 1.5 Verify or Create Documents Folder
    let documentsFolderId = user.documentsFolderId;
    let documentsFolderExists = false;

    if (documentsFolderId) {
      try {
        const docRes = await drive.files.get({ fileId: documentsFolderId, fields: 'id, trashed' });
        if (!docRes.data.trashed) documentsFolderExists = true;
      } catch (err) {
        console.log(`Documents folder ${documentsFolderId} not found in Drive. Will recreate or find.`);
      }
    }

    if (!documentsFolderExists) {
      const docSearch = await drive.files.list({
        q: `name = 'Documents' and '${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id)', spaces: 'drive',
      });
      if (docSearch.data.files.length > 0) {
        documentsFolderId = docSearch.data.files[0].id;
      } else {
        documentsFolderId = await createDriveFolder(drive, 'Documents', rootFolderId);
      }
      user.documentsFolderId = documentsFolderId;
      await user.save(); // Save early
    }

    // 1.6 Verify or Create My Files Folder
    let myFilesFolderId = user.myFilesFolderId;
    let myFilesFolderExists = false;

    if (myFilesFolderId) {
      try {
        const myRes = await drive.files.get({ fileId: myFilesFolderId, fields: 'id, trashed' });
        if (!myRes.data.trashed) myFilesFolderExists = true;
      } catch (err) {
        console.log(`My Files folder ${myFilesFolderId} not found in Drive. Will recreate or find.`);
      }
    }

    if (!myFilesFolderExists) {
      const mySearch = await drive.files.list({
        q: `name = 'My Files' and '${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id)', spaces: 'drive',
      });
      if (mySearch.data.files.length > 0) {
        myFilesFolderId = mySearch.data.files[0].id;
      } else {
        myFilesFolderId = await createDriveFolder(drive, 'My Files', rootFolderId);
      }
      user.myFilesFolderId = myFilesFolderId;
      await user.save(); // Save early
    }

    // 2. Fetch existing subfolders from Drive inside KeepInMind and Documents
    const rootFoldersRes = await drive.files.list({
      q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name, parents)', spaces: 'drive',
    });
    
    const docFoldersRes = await drive.files.list({
      q: `'${documentsFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name, parents)', spaces: 'drive',
    });

    const rootFolders = rootFoldersRes.data.files || [];
    const docFolders = docFoldersRes.data.files || [];
    
    // Migration: Move existing category folders to Documents, and custom folders to My Files
    const docFolderNames = docFolders.map(f => f.name);
    for (const rootFolder of rootFolders) {
      if (rootFolder.name === 'Documents' || rootFolder.name === 'My Files' || rootFolder.name === 'Personal') continue;
      
      const targetFolderId = FOLDERS.includes(rootFolder.name) ? documentsFolderId : myFilesFolderId;
      
      console.log(`Migrating ${rootFolder.name} to appropriate folder...`);
      await drive.files.update({
        fileId: rootFolder.id,
        addParents: targetFolderId,
        removeParents: rootFolderId,
        fields: 'id, parents'
      });
      if (FOLDERS.includes(rootFolder.name)) {
        docFolders.push(rootFolder);
        docFolderNames.push(rootFolder.name);
      }
    }

    // Also migrate custom folders that were accidentally put in Documents
    for (const docFolder of docFolders) {
      if (!FOLDERS.includes(docFolder.name)) {
        console.log(`Migrating custom folder ${docFolder.name} from Documents to My Files...`);
        await drive.files.update({
          fileId: docFolder.id,
          addParents: myFilesFolderId,
          removeParents: documentsFolderId,
          fields: 'id, parents'
        });
      }
    }

    const existingFolderNames = docFolders.map(f => f.name);

    // Update DB with active IDs
    const userFolders = await Folder.find({ user: userId });
    for (const driveFolder of docFolders) {
      const dbFolder = userFolders.find(f => f.name === driveFolder.name);
      if (dbFolder && dbFolder.driveFolderId !== driveFolder.id) {
        dbFolder.driveFolderId = driveFolder.id;
        await dbFolder.save();
      }
    }

    // 3. Determine missing folders and create them inside Documents
    const missingFolders = FOLDERS.filter(name => !existingFolderNames.includes(name));
    
    if (missingFolders.length > 0) {
      console.log(`Creating missing folders: ${missingFolders.join(', ')}`);
      const folderPromises = missingFolders.map(async (folderName) => {
        const folderId = await createDriveFolder(drive, folderName, documentsFolderId);
        return { name: folderName, id: folderId };
      });

      const results = await Promise.allSettled(folderPromises);
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { name, id } = result.value;
          const dbFolder = await Folder.findOne({ user: userId, name });
          if (dbFolder) {
            dbFolder.driveFolderId = id;
            await dbFolder.save();
          }
        } else {
          console.error('Failed to create a missing subfolder:', result.reason);
        }
      }
    }

    await user.save();
    console.log(`Successfully verified/initialized Drive folders for User ${userId}`);
    
  } catch (error) {
    console.error(`Fatal error in initializeUserDrive for ${userId}:`, error.message);
  }
};

const ensureCustomFolderInDrive = async (userId, customFolderName) => {
  const user = await User.findById(userId);
  if (!user || !user.googleAccessToken) return null;
  const drive = getDriveClient(user);

  let rootFolderId = user.rootFolderId;
  if (!rootFolderId) {
    const rootRes = await drive.files.list({
      q: "name = 'KeepInMind' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id)', spaces: 'drive',
    });
    if (rootRes.data.files.length > 0) rootFolderId = rootRes.data.files[0].id;
    else {
      const rootFolder = await drive.files.create({ requestBody: { name: 'KeepInMind', mimeType: 'application/vnd.google-apps.folder' }, fields: 'id' });
      rootFolderId = rootFolder.data.id;
    }
    user.rootFolderId = rootFolderId;
    await user.save();
  }

  let myFilesFolderId = user.myFilesFolderId;
  if (!myFilesFolderId) {
    const docRes = await drive.files.list({
      q: `name = 'My Files' and '${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)', spaces: 'drive',
    });
    if (docRes.data.files.length > 0) myFilesFolderId = docRes.data.files[0].id;
    else {
      const docFolder = await drive.files.create({ requestBody: { name: 'My Files', parents: [rootFolderId], mimeType: 'application/vnd.google-apps.folder' }, fields: 'id' });
      myFilesFolderId = docFolder.data.id;
    }
    user.myFilesFolderId = myFilesFolderId;
    await user.save();
  }

  const safeName = customFolderName.replace(/'/g, "\\'");
  const customRes = await drive.files.list({
    q: `name = '${safeName}' and '${myFilesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id)', spaces: 'drive',
  });
  if (customRes.data.files.length > 0) return customRes.data.files[0].id;
  else {
    const customFolder = await drive.files.create({ requestBody: { name: customFolderName, parents: [myFilesFolderId], mimeType: 'application/vnd.google-apps.folder' }, fields: 'id' });
    return customFolder.data.id;
  }
};

const uploadFileToDrive = async (userId, fileBuffer, originalName, mimeType, category, isRetry = false) => {
  let user;
  try {
    user = await User.findById(userId);
    if (!user || !user.googleAccessToken) {
      throw new Error('User lacks Google tokens');
    }

    const drive = getDriveClient(user);

    // Use Folder collection instead of schemaFieldMap
    let parentFolderId;
    
    const Folder = require('../models/Folder');
    const folderDoc = await Folder.findOne({ user: userId, name: category });
    
    if (folderDoc && folderDoc.driveFolderId) {
      parentFolderId = folderDoc.driveFolderId;
    } else {
      // Missing in Drive or DB. 
      // Ensure it exists in Drive
      let rootFolderId = user.rootFolderId;
      if (!rootFolderId) {
        const rootRes = await drive.files.list({
          q: "name = 'KeepInMind' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
          fields: 'files(id)', spaces: 'drive',
        });
        if (rootRes.data.files.length > 0) rootFolderId = rootRes.data.files[0].id;
        else {
          const rootFolder = await drive.files.create({ requestBody: { name: 'KeepInMind', mimeType: 'application/vnd.google-apps.folder' }, fields: 'id' });
          rootFolderId = rootFolder.data.id;
        }
        user.rootFolderId = rootFolderId;
        await user.save();
      }

      const isSystem = folderDoc ? folderDoc.isSystem : FOLDERS.includes(category);
      const targetParentName = isSystem ? 'Documents' : 'My Files';
      let targetParentId = isSystem ? user.documentsFolderId : user.myFilesFolderId;

      if (!targetParentId) {
        const docRes = await drive.files.list({
          q: `name = '${targetParentName}' and '${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: 'files(id)', spaces: 'drive',
        });
        if (docRes.data.files.length > 0) targetParentId = docRes.data.files[0].id;
        else {
          const docFolder = await drive.files.create({ requestBody: { name: targetParentName, parents: [rootFolderId], mimeType: 'application/vnd.google-apps.folder' }, fields: 'id' });
          targetParentId = docFolder.data.id;
        }
        if (isSystem) user.documentsFolderId = targetParentId;
        else user.myFilesFolderId = targetParentId;
        await user.save();
      }

      const safeCategory = category.replace(/'/g, "\\'");
      const catRes = await drive.files.list({
        q: `name = '${safeCategory}' and '${targetParentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id)', spaces: 'drive',
      });
      
      if (catRes.data.files.length > 0) {
        parentFolderId = catRes.data.files[0].id;
      } else {
        const catFolder = await drive.files.create({ requestBody: { name: category, parents: [targetParentId], mimeType: 'application/vnd.google-apps.folder' }, fields: 'id' });
        parentFolderId = catFolder.data.id;
      }
      
      // Update or create DB folder
      if (folderDoc) {
        folderDoc.driveFolderId = parentFolderId;
        await folderDoc.save();
      } else {
        await Folder.create({
          user: userId,
          name: category,
          driveFolderId: parentFolderId,
          path: `/documents/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        });
      }
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
      const folderDoc = await Folder.findOne({ user: userId, name: category });
      if (folderDoc) {
        folderDoc.driveFolderId = null;
        await folderDoc.save();
      }
      user.documentsFolderId = null;
      user.myFilesFolderId = null;
      user.rootFolderId = null; 
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
  deleteFileFromDrive,
  ensureCustomFolderInDrive
};
