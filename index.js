// Only import Para SDK shim if using Para providers and not on web
// Para SDK is React Native only and will crash on web
const authProvider = process.env.EXPO_PUBLIC_AUTH_PROVIDER?.toLowerCase();
const walletProvider = process.env.EXPO_PUBLIC_WALLET_PROVIDER?.toLowerCase();
const bothMock = authProvider === 'mock' && walletProvider === 'mock';
const isWeb = typeof window !== 'undefined';

// Skip Para SDK if:
// 1. Both providers are set to 'mock', OR
// 2. Running on web (Para SDK is React Native only)
if (!bothMock && !isWeb) {
    // Import Para SDK shim if not using mock providers for both and not on web
    try {
        require("@getpara/react-native-wallet/shim");
    } catch (error) {
        console.warn('[Para SDK] Failed to load shim:', error);
    }
}

import "expo-router/entry";

