import { AuthEntry } from '@/components/login/AuthEntry';
import { ScreenContainer } from '@/components/ui/screen-container';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function LoginScreen() {
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
