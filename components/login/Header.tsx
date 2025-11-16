import { IconName } from '@/components/ui/icons/icon-names';
import { useTheme, useThemeMode } from '@/hooks/theme';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '../ui/buttons/IconButton';

export type AuthEntryProps = {
    onEmail?: () => void;
    onPhone?: () => void;
};

export function Header({ onEmail, onPhone }: AuthEntryProps) {
    const router = useRouter();
    const t = useTheme();
    const { isDark } = useThemeMode();
    const insets = useSafeAreaInsets();

    const goBack = () => (onEmail ? onEmail() : router.back());
    const goHelp = () =>
        onPhone ? onPhone() : router.push('/(auth)/login-phone' as any);

    return (
        <View style={[styles.container, { marginTop: insets.top + 16 }]}>
            <IconButton
                iconSize={14}
                bordered
                shape="circle"
                iconName={IconName.Property1ArrowLeft}
                iconColor={isDark ? 'variant' : 'normal'}
                onPress={goBack}
            />

            <IconButton
                iconSize={14}
                bordered
                shape="circle"
                iconName={IconName.Property1Help}
                iconColor={isDark ? 'variant' : 'normal'}
                onPress={goHelp}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
});
