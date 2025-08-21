import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ro.cristiansterie.vote.mobile',
  appName: 'vot.e',
  webDir: 'www/browser',
  bundledWebRuntime: false,
  plugins: {
    CapacitorHttp: {
      enabled: true,
    }
  },
};

export default config;
