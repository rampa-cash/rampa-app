import { AppButton } from '@/components/ui/buttons/button';
import { IconButton } from '@/components/ui/buttons/IconButton';
import { IconName } from '@/components/ui/icons/icon-names';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { ContactMethod, useSignup } from '@/hooks/SignupProvider';
import { useTheme } from '@/hooks/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CODE_LENGTH = 6;

export default function VerifyCodeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const t = useTheme();
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const { method, contact } = useLocalSearchParams<{
        method?: string;
        contact?: string;
    }>();
    const { contactMethod, contactValue, setContact } = useSignup();

    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));

    const derivedContact = useMemo(
        () => (typeof contact === 'string' && contact) || contactValue || '',
        [contact, contactValue]
    );

    const derivedMethod = useMemo<ContactMethod | null>(() => {
        if (
            typeof method === 'string' &&
            (method === 'email' || method === 'phone')
        ) {
            return method;
        }
        return contactMethod;
    }, [contactMethod, method]);

    const isComplete = useMemo(
        () => digits.every(d => d.length === 1),
        [digits]
    );

    const handleDigitChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        setDigits(prev => {
            const next = [...prev];
            next[index] = digit;
            return next;
        });
        if (digit && index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (index: number, key: string) => {
        if (key === 'Backspace' && !digits[index] && index > 0) {
            setDigits(prev => {
                const next = [...prev];
                next[index - 1] = '';
                return next;
            });
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleNext = () => {
        if (!isComplete) return;
        if (derivedMethod && derivedContact) {
            setContact(derivedMethod, derivedContact);
        }
        router.replace('/(tabs)/home' as any);
    };

    return (
        <ScreenContainer
            padded
            contentContainerStyle={{
                paddingBottom: insets.bottom + 16,
                flexGrow: 1,
            }}
        >
            <View style={[styles.nav, { paddingTop: insets.top }]}>
                <IconButton
                    iconName={IconName.Property1ArrowLeft}
                    shape="circle"
                    iconSize={14}
                    bordered
                    onPress={() => router.back()}
                />
                <IconButton
                    iconName={IconName.Property1Help}
                    shape="circle"
                    iconSize={14}
                    bordered
                />
            </View>

            <View style={styles.body}>
                <AppText variant={TextVariant.H1} style={styles.title}>
                    Enter the 6-digit code that we send to
                </AppText>
                <AppText
                    variant={TextVariant.Secondary}
                    color="lessEmphasis"
                    style={styles.subtitle}
                >
                    {derivedContact || 'your contact'}
                </AppText>

                <View style={styles.codeRow}>
                    {digits.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={ref => (inputRefs.current[index] = ref)}
                            style={[
                                styles.codeBox,
                                {
                                    backgroundColor: t.background.onBase2,
                                    borderColor: t.outline.outline2,
                                    color: t.text.normal,
                                },
                            ]}
                            keyboardType="number-pad"
                            returnKeyType="done"
                            maxLength={1}
                            secureTextEntry
                            value={digit}
                            onChangeText={text =>
                                handleDigitChange(index, text)
                            }
                            onKeyPress={({ nativeEvent }) =>
                                handleKeyPress(index, nativeEvent.key)
                            }
                        />
                    ))}
                </View>

                <Pressable
                    style={styles.resend}
                    onPress={() => setDigits(Array(CODE_LENGTH).fill(''))}
                >
                    <AppText
                        variant={TextVariant.Secondary}
                        color="lessEmphasis"
                    >
                        No code received?
                    </AppText>
                </Pressable>
            </View>

            <AppButton
                title="Next"
                onPress={handleNext}
                disabled={!isComplete}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    nav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    body: {
        gap: 20,
        flex: 1,
    },
    title: {
        lineHeight: 32,
    },
    subtitle: {
        marginBottom: 8,
    },
    codeRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 8,
        justifyContent: 'center',
    },
    codeBox: {
        width: 48,
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
    },
    resend: {
        marginTop: 4,
    },
});
