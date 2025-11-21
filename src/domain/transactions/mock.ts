import type { ApiResponse } from '../../shared/lib/baseApiClient';
import type { Transaction } from './types';

function todayAt(hours: number, minutes: number) {
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
}

export const mockTransactions: Transaction[] = [
    {
        id: 't1',
        senderId: 'me',
        recipientId: 'company',
        senderWalletId: 'w1',
        recipientAddress: 'addr1',
        amount: 45,
        currency: 'USDC',
        status: 'completed',
        fees: 0,
        notes: 'Company',
        createdAt: todayAt(10, 42),
        updatedAt: todayAt(10, 42),
        completedAt: todayAt(10, 43),
    },
    {
        id: 't2',
        senderId: 'me',
        recipientId: 'mama',
        senderWalletId: 'w1',
        recipientAddress: 'addr2',
        amount: -30,
        currency: 'USDC',
        status: 'completed',
        fees: 0,
        notes: 'Mama',
        createdAt: todayAt(10, 42),
        updatedAt: todayAt(10, 42),
        completedAt: todayAt(10, 43),
    },
    {
        id: 't3',
        senderId: 'bonus',
        recipientId: 'me',
        senderWalletId: 'w2',
        recipientAddress: 'addr3',
        amount: 120,
        currency: 'USDC',
        status: 'completed',
        fees: 0,
        notes: 'Bonus',
        createdAt: todayAt(10, 50),
        updatedAt: todayAt(10, 50),
        completedAt: todayAt(10, 51),
    },
    {
        id: 't4',
        senderId: 'client',
        recipientId: 'me',
        senderWalletId: 'w2',
        recipientAddress: 'addr4',
        amount: 200,
        currency: 'USDC',
        status: 'completed',
        fees: 0,
        notes: 'Freelance',
        createdAt: todayAt(11, 0),
        updatedAt: todayAt(11, 0),
        completedAt: todayAt(11, 1),
    },
    {
        id: 't5',
        senderId: 'me',
        recipientId: 'grocery',
        senderWalletId: 'w1',
        recipientAddress: 'addr5',
        amount: -75,
        currency: 'USDC',
        status: 'completed',
        fees: 0,
        notes: 'Groceries',
        createdAt: todayAt(11, 15),
        updatedAt: todayAt(11, 15),
        completedAt: todayAt(11, 16),
    },
    {
        id: 't6',
        senderId: 'me',
        recipientId: 'investment',
        senderWalletId: 'w1',
        recipientAddress: 'addr6',
        amount: 300,
        currency: 'USDC',
        status: 'completed',
        fees: 0,
        notes: 'Investment',
        createdAt: todayAt(11, 30),
        updatedAt: todayAt(11, 30),
        completedAt: todayAt(11, 31),
    },
    {
        id: 't7',
        senderId: 'me',
        recipientId: 'utilities',
        senderWalletId: 'w1',
        recipientAddress: 'addr7',
        amount: -100,
        currency: 'USDC',
        status: 'completed',
        fees: 0,
        notes: 'Utilities',
        createdAt: todayAt(11, 45),
        updatedAt: todayAt(11, 45),
        completedAt: todayAt(11, 46),
    },
    {
        id: 't8',
        senderId: 'employer',
        recipientId: 'me',
        senderWalletId: 'w3',
        recipientAddress: 'addr8',
        amount: 1500,
        currency: 'USDC',
        status: 'completed',
        fees: 0,
        notes: 'Salary',
        createdAt: todayAt(12, 0),
        updatedAt: todayAt(12, 0),
        completedAt: todayAt(12, 1),
    },
];

export async function getMockTransactions(params?: {
    limit?: number;
    offset?: number;
}) {
    const { limit, offset = 0 } = params || {};
    const slice = mockTransactions.slice(
        offset,
        limit ? offset + limit : undefined
    );
    const res: ApiResponse<Transaction[]> = { data: slice, success: true };
    return Promise.resolve(res);
}
