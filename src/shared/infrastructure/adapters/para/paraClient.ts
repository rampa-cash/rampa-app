// Para SDK is React Native only - skip on web
const isWeb = typeof window !== 'undefined';

let ParaMobile: any;
let Environment: any;

if (!isWeb) {
    // Only import Para SDK on native platforms
    ParaMobile = require('@getpara/react-native-wallet').ParaMobile;
    Environment = require('@getpara/web-sdk').Environment;
}

// Lazy initialization: only create ParaMobile instance when actually needed
let paraInstance: any = null;

export const getParaInstance = (): any => {
    if (isWeb) {
        throw new Error('Para SDK is not supported on web. Use mock providers for web development.');
    }
    
    if (!ParaMobile) {
        throw new Error('Para SDK is not available. Make sure you are running on a native platform.');
    }
    
    if (!paraInstance) {
        paraInstance = new ParaMobile(
            Environment.BETA,
            process.env.EXPO_PUBLIC_PARA_API_KEY!,
            undefined,
            {
                disableWorkers: true,
            }
        );
    }
    return paraInstance;
};

// Export para as a getter to maintain backward compatibility
// On web, this will throw an error if accessed (which is expected)
export const para = new Proxy({} as any, {
    get(_target, prop) {
        if (isWeb) {
            throw new Error('Para SDK is not supported on web. Use mock providers for web development.');
        }
        return getParaInstance()[prop];
    },
    set(_target, prop, value) {
        if (isWeb) {
            throw new Error('Para SDK is not supported on web. Use mock providers for web development.');
        }
        (getParaInstance() as any)[prop] = value;
        return true;
    },
});

// Initialize Para SDK
export const initializePara = async (): Promise<void> => {
    try {
        await getParaInstance().init();
    } catch (error) {
        console.error('Failed to initialize Para SDK:', error);
        throw new Error('Para SDK initialization failed');
    }
};
