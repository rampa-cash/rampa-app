import { AuthEntry } from '@/components/login/AuthEntry';
import { ScreenContainer } from '@/components/ui/screen-container';
import { BaseApiClient } from '@/src/shared/lib/baseApiClient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

// Create a base API client instance for health checks
const baseApiClient = new BaseApiClient();

export default function LoginScreen() {
    // Check backend health on mount
    useEffect(() => {
        const checkBackendHealth = async () => {
            try {
                const health = await baseApiClient.checkHealth();
                console.log('[Login] Backend health check successful:', {
                    apiUrl: baseApiClient.getBaseURL(),
                    status: health.status,
                    version: health.version,
                    uptime: health.uptime,
                    timestamp: health.timestamp,
                });
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Unknown error';
                console.error('[Login] Backend health check failed:', {
                    apiUrl: baseApiClient.getBaseURL(),
                    error: errorMessage,
                });
                throw error; // Throw to trigger error boundary or handle as needed
            }
        };

        checkBackendHealth();
    }, []); // Run once on mount

    return (
        <ScreenContainer scroll padded>
            <View style={styles.content}>
                <AuthEntry />
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
        justifyContent: 'center',
    },
});
