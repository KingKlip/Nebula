const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Customize resolver to handle platform-specific extensions properly
config.resolver = {
  ...config.resolver,
  sourceExts: ['jsx', 'js', 'ts', 'tsx', 'cjs', 'json', 'native.js', 'native.jsx', 'native.ts', 'native.tsx'],
  // Add proper platform extensions priority
  platformResolver: {
    ios: ['ios.js', 'native.js', 'js', 'ios.jsx', 'native.jsx', 'jsx', 'ios.ts', 'native.ts', 'ts', 'ios.tsx', 'native.tsx', 'tsx'],
    android: ['android.js', 'native.js', 'js', 'android.jsx', 'native.jsx', 'jsx', 'android.ts', 'native.ts', 'ts', 'android.tsx', 'native.tsx', 'tsx'],
    web: ['web.js', 'js', 'web.jsx', 'jsx', 'web.ts', 'ts', 'web.tsx', 'tsx'],
  },

  assetExts: [...config.resolver.assetExts, 'db', 'sqlite'],
  extraNodeModules: {
    "react-native-maps": require.resolve("./empty.js"), 
  },
};

// Add blacklist for problematic modules if needed
config.resolver.blacklistRE = [
  /node_modules\/.*\/node_modules\/react-native\/.*/,
];

module.exports = config;