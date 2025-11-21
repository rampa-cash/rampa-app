import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

import { AppButton } from '@/components/ui/buttons/button';
import { ButtonVariant } from '@/components/ui/buttons/button-variants';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { useTheme } from '@/hooks/theme';

export type ContactItem = {
    id: string;
    name: string;
    phone: string;
    avatarUri?: string;
    invite?: boolean; // if true, show Invite action on trailing
};

type ContactListItemProps = {
    contact: ContactItem;
    onPress?: (id: string) => void;
    onInvite?: (id: string) => void;
    showInvite?: boolean;
    rightAccessory?: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
};

export function ContactListItem({
    contact,
    onPress,
    onInvite,
    showInvite = true,
    rightAccessory,
    containerStyle,
}: ContactListItemProps) {
    const t = useTheme();
    const handlePress = () => onPress?.(contact.id);
    const showInviteButton = showInvite && contact.invite;

    return (
        <TouchableOpacity
            style={[styles.row, containerStyle]}
            onPress={handlePress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            {contact.avatarUri ? (
                <Image
                    source={{ uri: contact.avatarUri }}
                    style={styles.avatar}
                />
            ) : (
                <MaterialCommunityIcons
                    name="account-circle-outline"
                    size={44}
                    color={t.icon.lessEmphasis}
                    style={{ marginRight: 2 }}
                />
            )}
            <View style={{ flex: 1, gap: 6 }}>
                <AppText variant={TextVariant.BodyMedium}>
                    {contact.name}
                </AppText>
                {Boolean(contact.phone) && (
                    <AppText
                        variant={TextVariant.BodyMedium}
                        color={'lessEmphasis' as any}
                    >
                        {contact.phone}
                    </AppText>
                )}
            </View>
            {showInviteButton ? (
                <AppButton
                    title="Invite"
                    variant={ButtonVariant.Tertiary}
                    onPress={() => onInvite?.(contact.id)}
                    color="normal"
                />
            ) : rightAccessory ? (
                <View style={styles.trailing}>{rightAccessory}</View>
            ) : null}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    trailing: { marginLeft: 8 },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
    },
});

export default ContactListItem;
