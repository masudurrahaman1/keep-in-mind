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
  apiKey: "AIzaSyD4ojD86GoU0_w0zAgLEIgDirSnvazvsn8",
  authDomain: "keep-in-minds.firebaseapp.com",
  projectId: "keep-in-minds",
  storageBucket: "keep-in-minds.firebasestorage.app",
  messagingSenderId: "856059392786",
  appId: "1:856059392786:web:ce5ee79d736866e90df9cb"

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
