const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure for Para SDK and crypto dependencies
config.resolver.extraNodeModules = {
    crypto: 'react-native-quick-crypto',
    buffer: '@craftzdog/react-native-buffer',
};

module.exports = config;
