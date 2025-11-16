import { AppButton } from '@/components/ui/buttons/button';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { ListCard } from '@/components/ui/list-card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { Toggle } from '@/components/ui/toggle';
import { Palette } from '@/constants/theme';
import { useTheme, useThemeMode } from '@/hooks/theme';
import { useAuth } from '@/src/domain/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UserDetailsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const t = useTheme();
    const { isDark } = useThemeMode();
    const { user, logout } = useAuth();

    const [notificationsEnabled, setNotificationsEnabled] = useState(
        user?.preferences.notifications.pushEnabled ?? true
    );

    const fullName = useMemo(() => {
        const first = user?.firstName ?? 'Guest';
        const last = user?.lastName ?? '';
        return `${first} ${last}`.trim();
    }, [user?.firstName, user?.lastName]);

    const initials = useMemo(() => {
        const name = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
        return name ? name.charAt(0).toUpperCase() : 'U';
    }, [user?.firstName, user?.lastName]);

    const badgeColor =
        user?.kycStatus === 'verified' ? t.text.success : t.text.warning;

    const surface = isDark ? t.background.onBase2 : t.background.onBase;
    const borderColor = isDark ? t.outline.outline2 : t.outline.outline1;
    const iconBackground = isDark ? t.background.inactive : t.background.onBase;

    const contactItems = [
        {
            id: 'email',
            title: 'Email',
            description: user?.email ?? 'Add your email',
            icon: IconName.Property1Message,
        },
        {
            id: 'phone',
            title: 'Phone',
            description: user?.phone ?? 'Add your phone',
            icon: IconName.Property1Phone,
        },
    ];

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login' as any);
    };

    const handleBack = () => {
        router.back();
    };

    const sectionPadding = {
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 24,
    };

    return (
        <ScreenContainer
            scroll
            padded
            contentContainerStyle={[styles.content, sectionPadding]}
        >
            <View style={styles.header}>
                <Pressable
                    onPress={handleBack}
                    style={[
                        styles.circleButton,
                        {
                            borderColor,
                            backgroundColor: iconBackground,
                        },
                    ]}
                >
                    <MaterialIcons
                        name="arrow-back"
                        size={20}
                        color={t.icon.variant}
                    />
                </Pressable>

                <AppText
                    variant={TextVariant.SecondaryMedium}
                    style={[styles.headerTitle, { color: t.text.normal }]}
                >
                    My Account
                </AppText>

                <View style={styles.headerSpacer} />
            </View>

            <View
                style={[
                    styles.profileCard,
                    { backgroundColor: surface, borderColor },
                ]}
            >
                <View
                    style={[
                        styles.avatar,
                        {
                            backgroundColor: isDark
                                ? t.background.dim
                                : t.background.light,
                            borderColor,
                        },
                    ]}
                >
                    <AppText
                        variant={TextVariant.H2}
                        style={{ color: t.text.info }}
                    >
                        {initials}
                    </AppText>
                </View>
                <AppText
                    variant={TextVariant.H2}
                    style={[styles.name, { color: t.text.normal }]}
                >
                    {fullName}
                </AppText>
                <AppText
                    variant={TextVariant.Secondary}
                    style={{ color: t.text.lessEmphasis }}
                >
                    {user?.email ?? 'Complete your profile details'}
                </AppText>

                <View
                    style={[
                        styles.badge,
                        {
                            backgroundColor: isDark
                                ? t.background.inactive
                                : t.background.secondary,
                        },
                    ]}
                >
                    <MaterialIcons
                        name={
                            user?.kycStatus === 'verified'
                                ? 'verified'
                                : 'hourglass-top'
                        }
                        size={14}
                        color={badgeColor}
                    />
                    <AppText
                        variant={TextVariant.Caption}
                        style={[styles.badgeText, { color: badgeColor }]}
                    >
                        {user?.kycStatus === 'verified'
                            ? 'Verified account'
                            : 'Pending verification'}
                    </AppText>
                </View>
            </View>

            <View style={styles.section}>
                {contactItems.map(item => (
                    <ListCard
                        key={item.id}
                        title={item.title}
                        description={item.description}
                        left={
                            <Icon
                                name={item.icon}
                                size={18}
                                bgColor={iconBackground}
                                containerStyle={styles.iconBackground}
                                color={isDark ? t.icon.variant : undefined}
                            />
                        }
                        style={[
                            styles.card,
                            { backgroundColor: surface, borderColor },
                        ]}
                    />
                ))}
            </View>

            <ListCard
                title="Referrals"
                description="Invite & earn rewards"
                left={
                    <Icon
                        name={IconName.Property1Variant25}
                        size={18}
                        bgColor={iconBackground}
                        containerStyle={styles.iconBackground}
                        color={Palette.primary.signalViolet}
                    />
                }
                style={[
                    styles.card,
                    { backgroundColor: surface, borderColor },
                ]}
                onPress={() => { }}
            />

            <View style={styles.section}>
                <ListCard
                    title="Support"
                    left={
                        <Icon
                            name={IconName.Property1Help}
                            size={18}
                            bgColor={iconBackground}
                            containerStyle={styles.iconBackground}
                            color={isDark ? t.icon.variant : undefined}
                        />
                    }
                    style={[
                        styles.card,
                        { backgroundColor: surface, borderColor },
                    ]}
                    onPress={() => { }}
                />

                <ListCard
                    title="Notification"
                    left={
                        <Icon
                            name={IconName.Property1Notification}
                            size={18}
                            bgColor={iconBackground}
                            containerStyle={styles.iconBackground}
                            color={Palette.primary.signalViolet}
                        />
                    }
                    right={
                        <Toggle
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                        />
                    }
                    showChevron={false}
                    style={[
                        styles.card,
                        { backgroundColor: surface, borderColor },
                    ]}
                />

                <ListCard
                    title="Dark Theme"
                    left={
                        <Icon
                            name={IconName.Property1Theme}
                            size={18}
                            bgColor={iconBackground}
                            containerStyle={styles.iconBackground}
                            color={Palette.primary.signalViolet}
                        />
                    }
                    right={<Toggle value={isDark} onValueChange={t.toggleTheme} />}
                    showChevron={false}
                    style={[
                        styles.card,
                        { backgroundColor: surface, borderColor },
                    ]}
                />

                <ListCard
                    title="Terms & Privacy"
                    left={
                        <Icon
                            name={IconName.Property1Doc}
                            size={18}
                            bgColor={iconBackground}
                            containerStyle={styles.iconBackground}
                            color={isDark ? t.icon.variant : undefined}
                        />
                    }
                    style={[
                        styles.card,
                        { backgroundColor: surface, borderColor },
                    ]}
                    onPress={() => { }}
                />

                <ListCard
                    title="About Rampa"
                    left={
                        <Icon
                            name={IconName.Property1RampaOutline}
                            size={18}
                            bgColor={iconBackground}
                            containerStyle={styles.iconBackground}
                            color={Palette.primary.signalViolet}
                        />
                    }
                    style={[
                        styles.card,
                        { backgroundColor: surface, borderColor },
                    ]}
                    onPress={() => { }}
                />

                <ListCard
                    title="Delete my account"
                    left={
                        <Icon
                            name={IconName.Property1Delete}
                            size={18}
                            bgColor={isDark ? t.background.error : '#FDECEC'}
                            containerStyle={styles.iconBackground}
                            color={t.text.error}
                        />
                    }
                    style={[
                        styles.card,
                        {
                            backgroundColor: surface,
                            borderColor,
                        },
                    ]}
                    onPress={() => { }}
                />
            </View>

            <AppButton
                title="Logout"
                onPress={handleLogout}
                backgroundColor="#F4466D"
                color="onPrimaryBackground"
                style={styles.logoutButton}
            />

            <View style={styles.footer}>
                <AppText
                    variant={TextVariant.Secondary}
                    align="center"
                    style={{ color: t.text.lessEmphasis }}
                >
                    support@rampa.cash
                </AppText>
                <AppText
                    variant={TextVariant.Caption}
                    align="center"
                    style={{ color: t.text.lessEmphasis }}
                >
                    App version 1.0.0 (beta)
                </AppText>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        gap: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    circleButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    headerTitle: {
        textAlign: 'center',
    },
    headerSpacer: {
        width: 36,
    },
    profileCard: {
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        gap: 8,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    name: {
        marginTop: 4,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 6,
    },
    badgeText: {
        marginLeft: 6,
    },
    section: {
        gap: 10,
    },
    card: {
        borderWidth: 1,
        flexDirection: 'row',
        backgroundColor: "red"
    },
    iconBackground: {
        padding: 10,
        borderRadius: 16,
    },
    logoutButton: {
        marginTop: 4,
    },
    footer: {
        gap: 2,
        marginTop: 4,
    },
});
