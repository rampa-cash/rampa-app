export interface Contact {
    id: string;
    userId: string;
    name: string;
    email?: string;
    phone?: string;
    blockchainAddress?: string;
    isVerified: boolean;
    verificationMethod?: 'email' | 'phone' | 'blockchain';
    lastUsed?: Date;
    createdAt: Date;
    updatedAt: Date;
}
