import {
    CountryItem,
    CountrySearchModal,
} from '@/components/modals/CountrySearchModal';
import AppButton from '@/components/ui/buttons/button';
import { IconButton } from '@/components/ui/buttons/IconButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { IconName } from '@/components/ui/icons/icon-names';
import { AppInput } from '@/components/ui/input';
import ScreenContainer from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { COUNTRIES } from '@/constants/countries';
import { useTheme } from '@/hooks/theme';
import { useAuth } from '@/src/domain/auth/useAuth';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MIN_PHONE_LENGTH = 7;

export default function LoginPhoneScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const t = useTheme();
    const { loginWithPhone, isLoading, clearError } = useAuth();

    const [phone, setPhone] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<CountryItem>(
        COUNTRIES[0]
    );
    const [countryQuery, setCountryQuery] = useState('');
    const [countryModalVisible, setCountryModalVisible] = useState(false);

    const filteredCountries = useMemo(() => {
        const normalized = countryQuery.trim().toLowerCase();
        if (!normalized) return COUNTRIES;
        return COUNTRIES.filter(c => {
            const target = `${c.name} ${c.dial} ${c.code}`.toLowerCase();
            return target.includes(normalized);
        });
    }, [countryQuery]);

    const dismissCountryModal = () => {
        setCountryModalVisible(false);
        setCountryQuery('');
    };

    const handleSelectCountry = (code: string) => {
        const match = COUNTRIES.find(c => c.code === code);
        if (match) {
            setSelectedCountry(match);
        }
        dismissCountryModal();
    };

    const canContinue = useMemo(
        () => phone.trim().length >= MIN_PHONE_LENGTH,
        [phone]
    );

    const formatPhoneNumber = (
        phoneNumber: string,
        countryDial: string
    ): string => {
        // Remove all non-digit characters from the phone number input
        const digits = phoneNumber.replace(/[^\d]/g, '');

        // Check if the phone number already starts with the country code
        // This prevents duplication (e.g., if user enters "+491231234" and country is "+49")
        const countryCodeDigits = countryDial.replace(/[^\d]/g, '');
        let phoneDigits = digits;

        // If phone number starts with country code, remove it to avoid duplication
        if (digits.startsWith(countryCodeDigits)) {
            phoneDigits = digits.substring(countryCodeDigits.length);
        }

        // Combine country dial code with phone number
        // Country dial already includes +, so we just append digits
        const formatted = `${countryDial}${phoneDigits}`;

        console.log('[LoginPhone] Formatting phone number', {
            original: phoneNumber,
            countryDial,
            digits,
            countryCodeDigits,
            phoneDigits,
            formatted,
        });

        return formatted;
    };

    const handleContinue = async () => {
        console.log('[LoginPhone] handleContinue called', {
            canContinue,
            isLoading,
            phoneLength: phone.trim().length,
            phone: phone,
        });

        if (!phone.trim() || phone.trim().length < MIN_PHONE_LENGTH) {
            setError('Please enter a valid phone number');
            return;
        }

        clearError();
        setError(null);

        try {
            // Format phone number to E.164 format: +{country code}{number}
            const formattedPhone = formatPhoneNumber(
                phone,
                selectedCountry.dial!
            );

            console.log('[LoginPhone] Attempting login with formatted phone', {
                originalPhone: phone,
                formattedPhone,
                countryCode: selectedCountry.dial,
                countryName: selectedCountry.name,
            });

            await loginWithPhone(formattedPhone);
            // Navigation will happen automatically via AuthLayout useEffect
            // when isAuthenticated becomes true (if stage === 'login')
            // If verification is required, we'll navigate to verify screen instead
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to sign in';

            // Check if verification is required
            if (
                errorMessage.includes('verification required') ||
                errorMessage.includes('verification')
            ) {
                // Navigate to verification screen with phone parameter
                router.push(
                    `/(auth)/verify-phone?phone=${encodeURIComponent(formatPhoneNumber(phone, selectedCountry.dial!))}` as any
                );
            } else {
                setError(errorMessage);
            }
        }
    };

    return (
        <>
            <ScreenContainer
                scroll
                padded
                contentContainerStyle={[
                    styles.container,
                    {
                        paddingBottom: insets.bottom + 24,
                        flexGrow: 1,
                    },
                ]}
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

                <View style={styles.hero}>
                    <AppText variant={TextVariant.H1} style={styles.title}>
                        Could you please provide your phone number?
                    </AppText>
                    <AppText
                        variant={TextVariant.Secondary}
                        color="lessEmphasis"
                    >
                        We&apos;ll send you a confirmation code there
                    </AppText>
                </View>

                <View
                    style={[
                        styles.card,
                        { backgroundColor: t.background.onBase },
                    ]}
                >
                    <AppText
                        variant={TextVariant.SecondaryMedium}
                        color="lessEmphasis"
                    >
                        Phone number
                    </AppText>
                    <View style={styles.phoneRow}>
                        <Pressable
                            onPress={() => setCountryModalVisible(true)}
                            style={[
                                styles.countryPill,
                                {
                                    borderColor: t.outline.outline1,
                                    backgroundColor: t.background.onBase2,
                                },
                            ]}
                        >
                            <View style={styles.countryFlagWrapper}>
                                {selectedCountry.flag ? (
                                    <Image
                                        source={{ uri: selectedCountry.flag }}
                                        style={styles.countryFlagImage}
                                        resizeMode="center"
                                    />
                                ) : (
                                    <AppText
                                        variant={TextVariant.Body}
                                        style={styles.countryEmoji}
                                    >
                                        {selectedCountry.emoji ?? 'dYO?'}
                                    </AppText>
                                )}
                            </View>
                            <AppText
                                variant={TextVariant.BodyMedium}
                                style={styles.countryDial}
                            >
                                {selectedCountry.dial}
                            </AppText>
                            <IconSymbol
                                name="chevron.right"
                                size={16}
                                color={t.icon.lessEmphasis}
                                style={{ transform: [{ rotate: '90deg' }] }}
                            />
                        </Pressable>
                        <AppInput
                            placeholder="Enter your phone number"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            returnKeyType="done"
                            containerStyle={styles.phoneInput}
                            inputStyle={styles.phoneInputText}
                        />
                    </View>
                </View>

                <View style={styles.flexSpacer} />

                <AppButton
                    title="Get confirmation code"
                    onPress={handleContinue}
                    disabled={!canContinue || isLoading}
                />
            </ScreenContainer>

            <Modal
                visible={countryModalVisible}
                transparent
                animationType="fade"
                onRequestClose={dismissCountryModal}
            >
                <View style={styles.modalBackdrop}>
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={dismissCountryModal}
                    />
                    <View style={styles.modalSheet}>
                        <CountrySearchModal
                            query={countryQuery}
                            onChangeQuery={setCountryQuery}
                            onCancel={dismissCountryModal}
                            countries={filteredCountries}
                            onSelect={handleSelectCountry}
                            selectedCode={selectedCountry.code}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        gap: 32,
    },
    nav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    hero: {
        gap: 12,
    },
    title: {
        lineHeight: 36,
    },
    card: {
        borderRadius: 20,
        gap: 16,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    countryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 9,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
        gap: 6,
    },
    countryFlagWrapper: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countryFlagImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    countryEmoji: {
        fontSize: 20,
    },
    countryDial: {
        minWidth: 36,
    },
    phoneInput: {
        flex: 1,
        marginBottom: 0,
    },
    phoneInputText: {
        fontSize: 18,
        letterSpacing: 0.3,
    },
    flexSpacer: {
        flex: 1,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
        padding: 16,
    },
    modalSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
});
