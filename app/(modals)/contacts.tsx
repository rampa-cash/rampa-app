import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Contact, contactService } from '../../src/domain/contacts';

export default function ContactsScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newContact, setNewContact] = useState({
        name: '',
        email: '',
        phone: '',
        blockchainAddress: '',
    });

    // Fetch contacts
    const {
        data: contacts,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['contacts'],
        queryFn: () => contactService.getContacts(),
    });

    const filteredContacts = contacts?.filter(
        contact =>
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.phone?.includes(searchQuery)
    );

    const handleAddContact = async () => {
        if (!newContact.name.trim()) {
            Alert.alert('Error', 'Please enter a contact name');
            return;
        }

        try {
            const result = await contactService.addContact({
                name: newContact.name,
                email: newContact.email || undefined,
                phone: newContact.phone || undefined,
                blockchainAddress: newContact.blockchainAddress || undefined,
                isVerified: false,
            });

            if (result.success) {
                Alert.alert('Success', 'Contact added successfully!');
                setShowAddModal(false);
                setNewContact({
                    name: '',
                    email: '',
                    phone: '',
                    blockchainAddress: '',
                });
                refetch();
            } else {
                Alert.alert('Error', result.error || 'Failed to add contact');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to add contact');
        }
    };

    const handleDeleteContact = (id: string) => {
        Alert.alert(
            'Delete Contact',
            'Are you sure you want to delete this contact?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await contactService.deleteContact(id);
                        if (result.success) {
                            refetch();
                        } else {
                            Alert.alert(
                                'Error',
                                result.error || 'Failed to delete contact'
                            );
                        }
                    },
                },
            ]
        );
    };

    const renderContactItem = ({ item }: { item: Contact }) => (
        <TouchableOpacity style={styles.contactCard}>
            <View style={styles.contactInfo}>
                <View style={styles.contactHeader}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    {item.isVerified && (
                        <MaterialIcons
                            name="verified"
                            size={20}
                            color="#4CAF50"
                        />
                    )}
                </View>
                {item.email && (
                    <Text style={styles.contactDetail}>
                        <MaterialIcons name="email" size={14} color="#666" />{' '}
                        {item.email}
                    </Text>
                )}
                {item.phone && (
                    <Text style={styles.contactDetail}>
                        <MaterialIcons name="phone" size={14} color="#666" />{' '}
                        {item.phone}
                    </Text>
                )}
                {item.blockchainAddress && (
                    <Text style={styles.contactDetail}>
                        <MaterialIcons
                            name="account-balance-wallet"
                            size={14}
                            color="#666"
                        />{' '}
                        {item.blockchainAddress.slice(0, 8)}...
                    </Text>
                )}
            </View>
            <View style={styles.contactActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                        Alert.alert('Send to Contact', `Send to ${item.name}?`)
                    }
                >
                    <MaterialIcons name="send" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteContact(item.id)}
                >
                    <MaterialIcons name="delete" size={20} color="#F44336" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.closeButton}
                >
                    <MaterialIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>My Contacts</Text>
                <TouchableOpacity
                    onPress={() => setShowAddModal(true)}
                    style={styles.addButton}
                >
                    <MaterialIcons name="add" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color="#666" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading contacts...</Text>
                </View>
            ) : filteredContacts && filteredContacts.length > 0 ? (
                <FlatList
                    data={filteredContacts}
                    keyExtractor={item => item.id}
                    renderItem={renderContactItem}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="contacts" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No contacts found</Text>
                    <Text style={styles.emptySubtext}>
                        Add contacts to send money easily
                    </Text>
                </View>
            )}

            {/* Add Contact Modal */}
            {showAddModal && (
                <View style={styles.modal}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Contact</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Name *"
                            value={newContact.name}
                            onChangeText={text =>
                                setNewContact(prev => ({ ...prev, name: text }))
                            }
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={newContact.email}
                            onChangeText={text =>
                                setNewContact(prev => ({
                                    ...prev,
                                    email: text,
                                }))
                            }
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Phone"
                            value={newContact.phone}
                            onChangeText={text =>
                                setNewContact(prev => ({
                                    ...prev,
                                    phone: text,
                                }))
                            }
                            keyboardType="phone-pad"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Blockchain Address"
                            value={newContact.blockchainAddress}
                            onChangeText={text =>
                                setNewContact(prev => ({
                                    ...prev,
                                    blockchainAddress: text,
                                }))
                            }
                            autoCapitalize="none"
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.cancelButton,
                                ]}
                                onPress={() => setShowAddModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.addButtonModal,
                                ]}
                                onPress={handleAddContact}
                            >
                                <Text style={styles.addButtonText}>
                                    Add Contact
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    listContent: {
        padding: 20,
    },
    contactCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contactInfo: {
        flex: 1,
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginRight: 8,
    },
    contactDetail: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    contactActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
    modal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
        gap: 12,
    },
    modalButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    addButtonModal: {
        backgroundColor: '#007AFF',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
