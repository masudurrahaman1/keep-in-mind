// ─────────────────────────────────────────────────────────────
//  src/config/firebase.ts
//
//  ⚠️  REPLACE the placeholder values below with your own
//      Firebase project config from:
//      Firebase Console → Project Settings → Your apps → SDK setup
// ─────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDuAoN4WXflYR1zJmMZ8nNPShI2m8zhDfs",
  authDomain: "keepinmind-dce6e.firebaseapp.com",
  projectId: "keepinmind-dce6e",
  storageBucket: "keepinmind-dce6e.firebasestorage.app",
  messagingSenderId: "329859333999",
  appId: "1:329859333999:web:a721e118de39e3a62ab29a",
  measurementId: "G-FJ1STMBFL1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ── Drive scope for note file sync ──────────────────────────
// drive.file: create/read/update files created by this app (needed for note sync)
// NOTE: drive.metadata.readonly was removed — it's a restricted scope that triggers
// Google's "app not verified" warning. Use Google Cloud Console → OAuth consent screen
// → Test users to add your email and bypass the warning during development.
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

export default app;
