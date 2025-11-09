export interface User {
    id: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    country: string;
    kycStatus: 'pending' | 'verified' | 'rejected';
    kycVerifiedAt?: Date;
    preferences: UserPreferences;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserPreferences {
    language: string;
    currency: string;
    notifications: NotificationSettings;
    privacy: PrivacySettings;
    theme: 'light' | 'dark' | 'system';
}

export interface NotificationSettings {
    transactionUpdates: boolean;
    educationalContent: boolean;
    marketing: boolean;
    securityAlerts: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
}

export interface PrivacySettings {
    dataSharing: boolean;
    analytics: boolean;
    crashReporting: boolean;
    marketingData: boolean;
}
