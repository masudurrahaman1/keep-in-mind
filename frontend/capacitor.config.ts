import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.keepinmind.notes.app',
  appName: 'Keep In Mind',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    GoogleAuth: {
      scopes: ["profile", "email", "https://www.googleapis.com/auth/drive.file"],
      serverClientId: "1071922323881-aru337f1r4adtvm96oi5dg43aqdqhhqf.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
