import { Contact } from './types';

// Simple in-memory mock contacts dataset
export const MOCK_CONTACTS: Contact[] = [
    {
        id: 'c1',
        userId: 'u1',
        name: 'Savannah Nguyen',
        phone: '+61 491 570 158',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    },
    {
        id: 'c2',
        userId: 'u1',
        name: 'Marvin McKinney',
        phone: '+1 202 555 0169',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
    {
        id: 'c3',
        userId: 'u1',
        name: 'Jenny Wilson',
        phone: '+44 1632 970 156',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'c4',
        userId: 'u1',
        name: 'Brooklyn Simmons',
        phone: '+1 635 555 0143',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'c5',
        userId: 'u1',
        name: 'Devon Lane',
        phone: '+44 1632 960761',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'c6',
        userId: 'u1',
        name: 'Jacob Jones',
        phone: '+44 1632 960600',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'c7',
        userId: 'u1',
        name: 'Brooklyn Simmons',
        phone: '+65 4872 5076',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export function mockSearchContacts(q: string): Contact[] {
    const term = q.toLowerCase();
    return MOCK_CONTACTS.filter(
        c =>
            c.name.toLowerCase().includes(term) ||
            (c.phone ?? '').toLowerCase().includes(term) ||
            (c.email ?? '').toLowerCase().includes(term) ||
            (c.blockchainAddress ?? '').toLowerCase().includes(term)
    );
}

export function mockGetById(id: string): Contact | undefined {
    return MOCK_CONTACTS.find(c => c.id === id);
}
