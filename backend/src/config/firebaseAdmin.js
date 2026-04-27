const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized from file.');
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized from environment variable.');
  } catch (err) {
    console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT env var:', err.message);
  }
} else {
  console.error('\n❌ CRITICAL ERROR: Firebase credentials missing!');
  console.error('Either provide backend/serviceAccountKey.json or set FIREBASE_SERVICE_ACCOUNT environment variable.\n');
}

module.exports = admin;
