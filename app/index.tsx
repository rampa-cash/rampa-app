import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { StorageKeys } from '@/constants/storage';
import { useAuthStore } from '../src/domain/auth/authStore';
export default function Index() {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
    const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const seenFlag = await AsyncStorage.getItem(
                    StorageKeys.onboardingSeen
                );
                setShouldShowOnboarding(!seenFlag);
            } catch  {
                setShouldShowOnboarding(false);
            } finally {
                setHasCheckedOnboarding(true);
            }
        };

        checkOnboarding();
    }, []);

    if (!hasCheckedOnboarding) {
        return null;
    }

    if (!isAuthenticated && shouldShowOnboarding) {
        return <Redirect href="/onboarding" />;
    }

    // Redirect based on authentication state
    if (isAuthenticated) {
        return <Redirect href="/(tabs)/home" />;
    }

    return <Redirect href="/(auth)/login" />;
}
