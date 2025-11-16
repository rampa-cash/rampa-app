const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure node module resolutions as per Para SDK documentation
config.resolver.extraNodeModules = {
    crypto: require.resolve('react-native-quick-crypto'),
    buffer: require.resolve('@craftzdog/react-native-buffer'),
};

// Suppress warnings for @noble/hashes crypto.js imports
// These are harmless - Metro falls back to file-based resolution
config.resolver.unstable_enablePackageExports = false;

config.serializer = config.serializer || {};
config.serializer.experimentalSerializerHook = (graph /*, delta */) => {
    try {
        for (const m of graph.dependencies.values()) {
            if (!m?.dependencies) continue;
            for (const dep of m.dependencies.values()) {
                if (!dep?.absolutePath && dep?.data?.data?.asyncType != null) {
                    dep.data.data.asyncType = null;
                }
            }
        }
    } catch {}
};

module.exports = config;
