import { ParaMobile } from '@getpara/react-native-wallet';
import { Environment } from '@getpara/web-sdk';

// Initialize Para SDK with API key from environment
export const para = new ParaMobile(
    Environment.BETA, // Use BETA environment for development
    process.env.EXPO_PUBLIC_PARA_API_KEY!,
    undefined,
    {
        disableWorkers: true,
    }
);

// Initialize Para SDK
export const initializePara = async (): Promise<void> => {
    try {
        await para.init();
    } catch (error) {
        console.error('Failed to initialize Para SDK:', error);
        throw new Error('Para SDK initialization failed');
    }
};
