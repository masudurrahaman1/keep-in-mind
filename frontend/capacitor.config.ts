import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.keepinmind.app',
  appName: 'Keep In Mind',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    GoogleAuth: {
      scopes: ["profile", "email", "https://www.googleapis.com/auth/drive.file"],
      serverClientId: "856059392786-evmi7lf00bek6dddl53sd1lqs826m4fk.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
