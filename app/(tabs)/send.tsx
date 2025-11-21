import ContactSearchModal from '@/components/modals/ContactSearchModal';
import {
    ContactListItem,
    type ContactItem,
} from '@/components/contacts/ContactListItem';
import { IconButton } from '@/components/ui/buttons/IconButton';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { AppInput } from '@/components/ui/input';
import { InputVariant } from '@/components/ui/input-variants';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { contactService } from '@/src/domain/contacts';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SendScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: contacts = [] } = useQuery({
        queryKey: ['contacts'],
        queryFn: () => contactService.getContacts(),
    });

    const topReceivers = useMemo(() => contacts.slice(0, 4), [contacts]);

    const items: ContactItem[] = useMemo(() => {
        const list = contacts.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone || c.email || c.blockchainAddress || '',
            invite: Math.random() < 0.5,
        }));
        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(
            i =>
                i.name.toLowerCase().includes(q) ||
                i.phone.toLowerCase().includes(q)
        );
    }, [contacts, searchQuery]);

    const handleSelect = (id: string) => {
        setSearchVisible(false);
        router.push({
            pathname: '/(modals)/send-amount',
            params: { contactId: id },
        } as never);
    };

    return (
        <ScreenContainer padded style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity
                    onPress={() => router.push('/(modals)/user-details' as any)}
                    style={styles.profileButton}
                >
                    <MaterialIcons
                        name="account-circle"
                        size={42}
                        color="#007AFF"
                    />
                </TouchableOpacity>
                <IconButton
                    iconName={IconName.Property1Search}
                    shape="circle"
                    iconSize={16}
                    onPress={() => setSearchVisible(true)}
                />
            </View>

            <View style={styles.content}>
                <AppText variant={TextVariant.H1}>Send Funds</AppText>
                <AppText variant={TextVariant.Secondary} color="lessEmphasis">
                    Move money securely to enyone, anywhere, instantly on Solana
                </AppText>

                <View style={{ marginTop: 24 }}>
                    <AppText
                        variant={TextVariant.SecondaryMedium}
                        color="lessEmphasis"
                    >
                        Choose who you're sending to
                    </AppText>
                    <Pressable onPress={() => setSearchVisible(true)}>
                        <AppInput
                            editable={false}
                            placeholder="Search for contact to send"
                            variant={InputVariant.Filled}
                            left={
                                <Icon
                                    name={IconName.Property1Search}
                                    size={18}
                                />
                            }
                            containerStyle={{ marginTop: 8 }}
                        />
                    </Pressable>
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 8,
                    }}
                >
                    <MaterialIcons name="info" size={14} color="#777" />
                    <AppText variant={TextVariant.Caption} color="lessEmphasis">
                        If we want to put some comment in here
                    </AppText>
                </View>

                <View style={{ marginTop: 20 }}>
                    <AppText variant={TextVariant.SecondaryMedium}>
                        Top Receivers
                    </AppText>
                    <FlatList
                        data={topReceivers}
                        keyExtractor={i => i.id}
                        contentContainerStyle={{ gap: 12, paddingVertical: 12 }}
                        renderItem={({ item }) => (
                            <ContactListItem
                                contact={item}
                                onPress={handleSelect}
                                showInvite={false}
                                rightAccessory={
                                    <Icon
                                        name={IconName.Property1ArrowRight}
                                        size={16}
                                    />
                                }
                            />
                        )}
                    />
                </View>
            </View>

            <Modal
                transparent
                visible={searchVisible}
                animationType="fade"
                onRequestClose={() => setSearchVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={() => setSearchVisible(false)}
                    />
                    <View style={styles.modalCenter}>
                        <ContactSearchModal
                            title="Search for contact to send"
                            query={searchQuery}
                            onChangeQuery={setSearchQuery}
                            onCancel={() => setSearchVisible(false)}
                            contacts={items}
                            onSelect={handleSelect}
                        />
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignContent: 'center',
        padding: 20,
    },
    profileButton: { padding: 4 },
    content: { paddingHorizontal: 20, gap: 8 },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalCenter: { width: '92%', maxWidth: 460 },
});
