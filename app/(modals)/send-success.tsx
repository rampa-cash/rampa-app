import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { Amount } from '@/components/ui/amount';
import { AmountSize, AmountTone } from '@/components/ui/amount-variants';
import AppButton from '@/components/ui/buttons/button';
import { ButtonVariant } from '@/components/ui/buttons/button-variants';
import { Palette } from '@/constants/theme';

export default function SendSuccessScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
        amount = '0',
        currency = 'EUR',
        contactName = 'Recipient',
        contactRef = '',
    } = useLocalSearchParams<{
        amount?: string;
        currency?: 'USD' | 'EUR' | 'SOL';
        contactName?: string;
        contactRef?: string;
    }>();

    const numeric = Number.parseFloat(String(amount));
    const symbolOverride = currency === 'SOL' ? 'SOL' : undefined;
    const curr = currency === 'USD' ? 'USD' : 'EUR';

    return (
        <ScreenContainer
            padded
            scroll
            contentContainerStyle={[
                styles.container,
                { paddingBottom: insets.bottom + 24 },
            ]}
        >
            <View style={styles.center}>
                <View style={styles.checkCircle}>
                    <MaterialIcons name="check" size={28} color="#fff" />
                </View>

                <AppText variant={TextVariant.Body} style={{ marginTop: 12 }}>
                    Sent!
                </AppText>

                <View style={{ marginTop: 6 }}>
                    <Amount
                        value={Number.isFinite(numeric) ? numeric : 0}
                        currency={curr}
                        symbolOverride={symbolOverride}
                        showCents={true}
                        size={AmountSize.Lg}
                        tone={AmountTone.Accent}
                    />
                </View>

                <AppText
                    variant={TextVariant.Secondary}
                    color={'lessEmphasis' as any}
                    align="center"
                    style={{ marginTop: 8 }}
                >
                    was successfully sent to {String(contactName)}
                </AppText>
                {Boolean(contactRef) && (
                    <AppText
                        variant={TextVariant.Caption}
                        color={'lessEmphasis' as any}
                        align="center"
                    >
                        {String(contactRef)}
                    </AppText>
                )}

                <Pressable
                    onPress={() => {
                        /* TODO: navigate to tx details */
                    }}
                >
                    <AppText
                        variant={TextVariant.Body}
                        style={{ marginTop: 12 }}
                    >
                        View transaction
                    </AppText>
                </Pressable>
            </View>

            <View style={{ marginTop: 32 }}>
                <AppButton
                    title="Close"
                    variant={ButtonVariant.Primary}
                    onPress={() => router.replace('/(tabs)/home' as any)}
                />
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'space-between' },
    center: { alignItems: 'center', marginTop: 40 },
    checkCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#22C55E',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
