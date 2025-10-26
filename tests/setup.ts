import '@testing-library/jest-native/extend-expect';

// Mock Expo modules
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));

// Mock Para SDK
jest.mock('@getpara/react-native-wallet', () => ({
    ParaMobile: jest.fn().mockImplementation(() => ({
        init: jest.fn(),
        signUpOrLogIn: jest.fn(),
        verifyNewAccount: jest.fn(),
        loginWithPasskey: jest.fn(),
        registerPasskey: jest.fn(),
    })),
}));

// Mock React Native modules
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => {};
    return Reanimated;
});

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
    useRoute: () => ({
        params: {},
    }),
}));

// Global test setup
beforeEach(() => {
    jest.clearAllMocks();
});
