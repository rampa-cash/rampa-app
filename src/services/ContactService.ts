import { contactApiClient } from '../lib';
import { Contact } from '../types/Contact';
import { logger } from '../utils/errorHandler';

export interface ContactResponse {
    success: boolean;
    contact?: Contact;
    error?: string;
}

export class ContactService {
    /**
     * Get all user contacts
     */
    async getContacts(): Promise<Contact[]> {
        try {
            logger.info('Fetching user contacts');

            const response = await contactApiClient.getContacts();
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch contacts', { error });
            throw new Error('Failed to fetch contacts');
        }
    }

    /**
     * Get contact by ID
     */
    async getContactById(id: string): Promise<Contact> {
        try {
            logger.info('Fetching contact by ID', { id });

            const response = await contactApiClient.getContactById(id);
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch contact by ID', { error, id });
            throw new Error('Failed to fetch contact');
        }
    }

    /**
     * Add new contact
     */
    async addContact(
        contact: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    ): Promise<ContactResponse> {
        try {
            logger.info('Adding new contact', { contact });

            const response = await contactApiClient.createContact(contact);

            return {
                success: true,
                contact: response.data,
            };
        } catch (error) {
            logger.error('Failed to add contact', { error, contact });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to add contact',
            };
        }
    }

    /**
     * Update contact
     */
    async updateContact(
        id: string,
        updates: Partial<Contact>
    ): Promise<ContactResponse> {
        try {
            logger.info('Updating contact', { id, updates });

            const response = await contactApiClient.updateContact(id, updates);

            return {
                success: true,
                contact: response.data,
            };
        } catch (error) {
            logger.error('Failed to update contact', { error, id, updates });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to update contact',
            };
        }
    }

    /**
     * Delete contact
     */
    async deleteContact(
        id: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            logger.info('Deleting contact', { id });

            await contactApiClient.deleteContact(id);

            return { success: true };
        } catch (error) {
            logger.error('Failed to delete contact', { error, id });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to delete contact',
            };
        }
    }

    /**
     * Search contacts
     */
    async searchContacts(query: string): Promise<Contact[]> {
        try {
            logger.info('Searching contacts', { query });

            const response = await contactApiClient.searchContacts(query);

            return response.data;
        } catch (error) {
            logger.error('Failed to search contacts', { error, query });
            throw new Error('Failed to search contacts');
        }
    }

    /**
     * Verify contact
     */
    async verifyContact(
        id: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            logger.info('Verifying contact', { id });

            await contactApiClient.verifyContact(id);

            return { success: true };
        } catch (error) {
            logger.error('Failed to verify contact', { error, id });
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to verify contact',
            };
        }
    }

    /**
     * Mark contact as recently used
     */
    async markAsRecentlyUsed(id: string): Promise<void> {
        try {
            logger.info('Marking contact as recently used', { id });

            await contactApiClient.markAsRecentlyUsed(id);
        } catch (error) {
            logger.error('Failed to mark contact as recently used', {
                error,
                id,
            });
        }
    }
}

export const contactService = new ContactService();
