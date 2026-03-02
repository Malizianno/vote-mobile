import packageInfo from '../../package.json';

export const environment = {
  production: true,
  version: packageInfo.version,
  serverUrl: 'https://vote-backend-1fk7.onrender.com/vote',
  defaultLanguage: 'ro-RO',
  supportedLanguages: ['en-US', 'ro-RO'],
};
