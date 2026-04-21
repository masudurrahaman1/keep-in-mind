const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully.');
} else {
  console.error('\n❌ CRITICAL ERROR: backend/serviceAccountKey.json is missing!');
  console.error('Download your service account key from Firebase Console and save it to the backend folder.\n');
}

module.exports = admin;
