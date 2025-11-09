import { BaseApiClient } from '../../shared/lib/baseApiClient';
import { Contact } from './types';

/**
 * Contact API Client
 *
 * Handles all contact-related API endpoints
 */
export class ContactApiClient extends BaseApiClient {
    /**
     * Get all user contacts
     */
    async getContacts() {
        return this.request<Contact[]>('/contacts');
    }

    /**
     * Get contact by ID
     */
    async getContactById(id: string) {
        return this.request<Contact>(`/contacts/${id}`);
    }

    /**
     * Create a new contact
     */
    async createContact(
        data: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    ) {
        return this.request<Contact>('/contacts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Update contact
     */
    async updateContact(id: string, data: Partial<Contact>) {
        return this.request<Contact>(`/contacts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * Delete contact
     */
    async deleteContact(id: string) {
        return this.request<void>(`/contacts/${id}`, {
            method: 'DELETE',
        });
    }

    /**
     * Search contacts
     */
    async searchContacts(query: string) {
        return this.request<Contact[]>(
            `/contacts/search?q=${encodeURIComponent(query)}`
        );
    }

    /**
     * Verify contact
     */
    async verifyContact(id: string) {
        return this.request<void>(`/contacts/${id}/verify`, {
            method: 'POST',
        });
    }

    /**
     * Mark contact as recently used
     */
    async markAsRecentlyUsed(id: string) {
        return this.request<void>(`/contacts/${id}/last-used`, {
            method: 'PUT',
        });
    }
}

export const contactApiClient = new ContactApiClient();
