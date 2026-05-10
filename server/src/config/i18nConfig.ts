// server/src/config/i18nConfig.ts
import i18n from 'i18n';
import path from 'path';

export const setupI18n = () => {
  i18n.configure({
    locales: ['en', 'de'], // Supported languages
    defaultLocale: 'en',
    directory: path.join(__dirname, '..', 'locales'), // Path to your translation files (relative to this config file)
    objectNotation: true, // Allows for nested JSON objects in translations
    cookie: 'lang', // Name of the cookie to store language preference (optional)
    queryParameter: 'lang', // Name of the query parameter to set language (e.g., ?lang=de)
    // Register on `res` to make `res.__()` available directly in route handlers
    // This is generally preferred in Express applications.
    register: undefined, // Explicitly set to undefined or don't set this for the next step.
                         // We will integrate it as middleware below.
    autoReload: true, // Reloads translations when JSON files change (good for dev)
    syncFiles: true, // Creates locale files if they don't exist
  });

  // Return the i18n instance's init middleware
  // This is what will be used in app.use()
  return i18n.init;
};

// Also export the i18n object directly if you need to access methods like i18n.setLocale
export { i18n };