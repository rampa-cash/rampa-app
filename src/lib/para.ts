// Temporarily commented out Para SDK for development
// import { ParaMobile } from '@getpara/react-native-wallet';

// Mock Para SDK for development
export const para = {
    init: async () => {
        console.log('Para SDK mock initialized');
    },
    signUpOrLogIn: async (params: any) => {
        console.log('Para SDK mock signUpOrLogIn:', params);
        return { stage: 'login', success: true };
    },
    verifyNewAccount: async (params: any) => {
        console.log('Para SDK mock verifyNewAccount:', params);
        return { success: true };
    },
    loginWithPasskey: async () => {
        console.log('Para SDK mock loginWithPasskey');
    },
    registerPasskey: async (params: any) => {
        console.log('Para SDK mock registerPasskey:', params);
    },
};

// Initialize Para SDK
export const initializePara = async (): Promise<void> => {
    try {
        await para.init();
    } catch (error) {
        console.error('Failed to initialize Para SDK:', error);
        throw new Error('Para SDK initialization failed');
    }
};
