module.exports = {
  contextSeparator: '_',
  // Key separator used in your translation keys
  keySeparator: '.',

  // Supported languages
  locales: ['en', 'zh', 'ja'],

  // Output directory - changed to match our project structure
  output: 'public/locales/$LOCALE/common.json',

  // Source files to scan
  input: ['components/**/*.{js,jsx}', 'pages/**/*.{js,jsx}'],

  // Keep existing translations
  keepRemoved: true,

  // Generate readable multi-line JSON
  indentation: 4,

  // Sort keys alphabetically
  sort: true,

  // Default value when adding new keys
  defaultValue: (locale, namespace, key) => {
    if (locale === 'en') {
      return key.split('.').pop()
    }
    return ''
  },

  // Lexer configuration for parsing files
  lexers: {
    js: ['JsxLexer'], // Changed from JavascriptLexer to JsxLexer since we use JSX
    jsx: ['JsxLexer'],
  },

  // Add these options for better compatibility
  namespaceSeparator: false, // We don't use namespace separators
  defaultNamespace: 'common', // We use 'common' namespace
}
