/**
 * Contacts Domain
 *
 * Barrel export for all contact-related functionality
 */

// Types
export type { Contact } from './types';

// Service
export { contactService } from './ContactService';
export type { ContactResponse } from './ContactService';

// API Client
export { contactApiClient, ContactApiClient } from './apiClient';
