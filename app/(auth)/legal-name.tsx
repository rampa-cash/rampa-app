import { AppButton } from '@/components/ui/buttons/button';
import { IconButton } from '@/components/ui/buttons/IconButton';
import { IconName } from '@/components/ui/icons/icon-names';
import { AppInput } from '@/components/ui/input';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { useSignup } from '@/hooks/SignupProvider';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LegalNameScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const { setName } = useSignup();

    const canContinue =
        firstName.trim().length > 0 && lastName.trim().length > 0;

    const handleNext = useCallback(() => {
        setName(firstName.trim(), lastName.trim());
        router.replace('/(tabs)/home' as any);
    }, [firstName, lastName, router, setName]);

    return (
        <ScreenContainer
            padded
            scroll
            style={styles.container}
            contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: insets.bottom + 16 },
            ]}
        >
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <IconButton
                    iconName={IconName.Property1ArrowLeft}
                    shape="circle"
                    iconSize={14}
                    bordered
                    onPress={() => router.back()}
                />
            </View>

            <View style={styles.body}>
                <View style={styles.copy}>
                    <AppText variant={TextVariant.H1}>
                        What&apos;s your name as it appears on official
                        documents?
                    </AppText>
                    <AppText
                        variant={TextVariant.Secondary}
                        color="lessEmphasis"
                    >
                        It must match the government ID you&apos;ll use to
                        verify your identity.
                    </AppText>
                </View>

                <View style={styles.form}>
                    <AppInput
                        label="Legal first name"
                        placeholder="First name"
                        autoCapitalize="words"
                        value={firstName}
                        onChangeText={setFirstName}
                        textContentType="givenName"
                        autoComplete="given-name"
                        returnKeyType="next"
                    />
                    <AppInput
                        label="Legal last name"
                        placeholder="Last name"
                        autoCapitalize="words"
                        value={lastName}
                        onChangeText={setLastName}
                        textContentType="familyName"
                        autoComplete="family-name"
                        returnKeyType="done"
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <AppButton title="Next" onPress={handleNext} disabled={!canContinue} />
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    body: {

        justifyContent: 'space-between',
        gap: 32,
    },
    copy: {
        gap: 12,
    },
    form: {
        gap: 16,
    },
    footer: {
        marginTop: 32,
    },
});

