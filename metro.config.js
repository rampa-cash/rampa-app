const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure for Para SDK and crypto dependencies
config.resolver.extraNodeModules = {
    crypto: 'react-native-quick-crypto',
    buffer: '@craftzdog/react-native-buffer',
};

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
    } catch { }
};

module.exports = config;