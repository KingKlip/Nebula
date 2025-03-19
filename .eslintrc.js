module.exports = {
  parser: 'babel-eslint', 
    env: {
      node: true, // Node.js environment
      es2021: true, // Modern ECMAScript
    },
    extends: [
      'eslint:recommended',
     ],
    parserOptions: {
      ecmaVersion: 12, // ECMAScript version
      sourceType: 'module', // Use ES module syntax
    },
    rules: {
      // Custom rules (optional)
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
    },
  };
  