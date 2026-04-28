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
      serverClientId: "329859333999-rqm1odrq5kj41f1kqki4sgc5a1qhuad6.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
