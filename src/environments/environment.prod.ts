import packageInfo from '../../package.json';

export const environment = {
  production: true,
  version: packageInfo.version,
  serverUrl: 'http://192.168.1.201:8090/vote',
  defaultLanguage: 'ro-RO',
  supportedLanguages: ['en-US', 'ro-RO'],
};
