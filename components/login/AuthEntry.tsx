import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { ListCard } from '@/components/ui/list-card';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { useTheme, useThemeMode } from '@/hooks/theme';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export type AuthEntryProps = {
    onEmail?: () => void;
    onPhone?: () => void;
};

export function AuthEntry({ onEmail, onPhone }: AuthEntryProps) {
    const router = useRouter();
    const t = useTheme();
    const { isDark } = useThemeMode();

    const goEmail = () =>
        onEmail ? onEmail() : router.push('/(auth)/login-email' as any);
    const goPhone = () =>
        onPhone ? onPhone() : router.push('/(auth)/login-phone' as any);

    return (
        <View style={styles.container}>
            <View
                style={{ gap: 8, flexDirection: 'row', alignItems: 'center' }}
            >
                <Icon
                    name={IconName.Property1RampaSolid}
                    color={isDark ? t.icon.variant : t.icon.normal}
                />
                <AppText variant={TextVariant.Secondary}>
                    Connect your way
                </AppText>
            </View>

            <AppText
                variant={TextVariant.H1}
                style={{
                    color: t.text.normal,
                    marginTop: 24,
                    marginBottom: 42,
                }}
            >
                Choose how you’d like to join Rampa
            </AppText>

            <View style={{ gap: 18 }}>
                <ListCard
                    title="Apple"
                    disabled
                    onPress={goEmail}
                    left={<Icon name={IconName.Property1Apple} />}
                />
                <ListCard
                    title="Google"
                    disabled
                    onPress={goEmail}
                    left={<Icon name={IconName.Property1Google} />}
                />

                <ListCard
                    title="Email"
                    onPress={goEmail}
                    left={<Icon name={IconName.Vector} />}
                />
                <ListCard
                    title="Wallet"
                    disabled
                    onPress={goEmail}
                    left={<Icon name={IconName.Property1Card} />}
                />
                <ListCard
                    title="Phone"
                    onPress={goPhone}
                    left={<Icon name={IconName.Property1Phone} />}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
});

export default AuthEntry;
