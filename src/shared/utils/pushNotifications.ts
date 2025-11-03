/**
 * Push Notifications Utilities
 *
 * Provides push notification capabilities using Firebase Cloud Messaging
 * Handles notification permissions, registration, and processing
 */

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { logger } from './errorHandler';

export interface NotificationData {
    title: string;
    body: string;
    data?: Record<string, any>;
    sound?: boolean;
    badge?: number;
}

export interface PushToken {
    token: string;
    type: 'expo' | 'fcm';
    deviceId: string;
}

export class PushNotificationManager {
    private static instance: PushNotificationManager;
    private pushToken: string | null = null;
    private notificationListeners: Notifications.Subscription[] = [];

    static getInstance(): PushNotificationManager {
        if (!PushNotificationManager.instance) {
            PushNotificationManager.instance = new PushNotificationManager();
        }
        return PushNotificationManager.instance;
    }

    private constructor() {
        this.initializeNotifications();
    }

    /**
     * Initialize push notifications
     */
    private async initializeNotifications(): Promise<void> {
        try {
            // Configure notification behavior
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: true,
                    shouldShowBanner: true,
                    shouldShowList: true,
                }),
            });

            // Request permissions
            await this.requestPermissions();

            // Register for push notifications
            await this.registerForPushNotifications();

            // Setup notification listeners
            this.setupNotificationListeners();

            logger.info('Push notifications initialized');
        } catch (error) {
            logger.error('Failed to initialize push notifications', { error });
        }
    }

    /**
     * Request notification permissions
     */
    async requestPermissions(): Promise<boolean> {
        try {
            if (Device.isDevice) {
                const { status: existingStatus } =
                    await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    const { status } =
                        await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus !== 'granted') {
                    logger.warn('Push notification permissions not granted');
                    return false;
                }

                logger.info('Push notification permissions granted');
                return true;
            } else {
                logger.warn('Push notifications not supported on simulator');
                return false;
            }
        } catch (error) {
            logger.error('Failed to request notification permissions', {
                error,
            });
            return false;
        }
    }

    /**
     * Register for push notifications
     */
    async registerForPushNotifications(): Promise<string | null> {
        try {
            if (!Device.isDevice) {
                logger.warn('Push notifications not supported on simulator');
                return null;
            }

            const token = await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId,
            });

            this.pushToken = token.data;
            logger.info('Push token registered', { token: this.pushToken });

            // Configure Android notification channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            return this.pushToken;
        } catch (error) {
            logger.error('Failed to register for push notifications', {
                error,
            });
            return null;
        }
    }

    /**
     * Setup notification listeners
     */
    private setupNotificationListeners(): void {
        // Listen for notifications received while app is foregrounded
        const notificationListener =
            Notifications.addNotificationReceivedListener(notification => {
                logger.info('Notification received', {
                    title: notification.request.content.title,
                    body: notification.request.content.body,
                    data: notification.request.content.data,
                });
            });

        // Listen for user interactions with notifications
        const responseListener =
            Notifications.addNotificationResponseReceivedListener(response => {
                logger.info('Notification response received', {
                    actionIdentifier: response.actionIdentifier,
                    data: response.notification.request.content.data,
                });

                // Handle notification tap
                this.handleNotificationTap(response);
            });

        this.notificationListeners.push(notificationListener, responseListener);
    }

    /**
     * Handle notification tap
     */
    private handleNotificationTap(
        response: Notifications.NotificationResponse
    ): void {
        const data = response.notification.request.content.data;

        if (data?.type) {
            switch (data.type) {
                case 'transaction':
                    // Navigate to transaction details
                    logger.info('Navigate to transaction', {
                        transactionId: data.transactionId,
                    });
                    break;
                case 'education':
                    // Navigate to education content
                    logger.info('Navigate to education', {
                        contentId: data.contentId,
                    });
                    break;
                case 'security':
                    // Navigate to security settings
                    logger.info('Navigate to security settings');
                    break;
                default:
                    logger.info('Unknown notification type', {
                        type: data.type,
                    });
            }
        }
    }

    /**
     * Send local notification
     */
    async sendLocalNotification(notification: NotificationData): Promise<void> {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: notification.title,
                    body: notification.body,
                    data: notification.data || {},
                    sound: notification.sound !== false,
                    badge: notification.badge,
                },
                trigger: null, // Send immediately
            });

            logger.info('Local notification sent', {
                title: notification.title,
            });
        } catch (error) {
            logger.error('Failed to send local notification', { error });
        }
    }

    /**
     * Schedule notification for later
     */
    async scheduleNotification(
        notification: NotificationData,
        trigger: Notifications.NotificationTriggerInput
    ): Promise<void> {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: notification.title,
                    body: notification.body,
                    data: notification.data || {},
                    sound: notification.sound !== false,
                    badge: notification.badge,
                },
                trigger,
            });

            logger.info('Notification scheduled', {
                title: notification.title,
            });
        } catch (error) {
            logger.error('Failed to schedule notification', { error });
        }
    }

    /**
     * Cancel all scheduled notifications
     */
    async cancelAllNotifications(): Promise<void> {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            logger.info('All notifications cancelled');
        } catch (error) {
            logger.error('Failed to cancel notifications', { error });
        }
    }

    /**
     * Get push token
     */
    getPushToken(): string | null {
        return this.pushToken;
    }

    /**
     * Get push token info for backend registration
     */
    async getPushTokenInfo(): Promise<PushToken | null> {
        if (!this.pushToken) {
            return null;
        }

        return {
            token: this.pushToken,
            type: 'expo',
            deviceId: Device.osInternalBuildId || 'unknown',
        };
    }

    /**
     * Send transaction notification
     */
    async sendTransactionNotification(
        type: 'sent' | 'received' | 'completed' | 'failed',
        amount: number,
        currency: string,
        transactionId?: string
    ): Promise<void> {
        const messages = {
            sent: `You sent ${amount} ${currency}`,
            received: `You received ${amount} ${currency}`,
            completed: `Transaction completed: ${amount} ${currency}`,
            failed: `Transaction failed: ${amount} ${currency}`,
        };

        await this.sendLocalNotification({
            title: 'Transaction Update',
            body: messages[type],
            data: {
                type: 'transaction',
                transactionId,
                amount,
                currency,
            },
        });
    }

    /**
     * Send education notification
     */
    async sendEducationNotification(
        title: string,
        contentId: string,
        type: 'new_content' | 'reminder' | 'achievement'
    ): Promise<void> {
        const messages = {
            new_content: 'New educational content available',
            reminder: 'Continue your learning journey',
            achievement: 'Congratulations on your achievement!',
        };

        await this.sendLocalNotification({
            title: 'Learning Update',
            body: messages[type],
            data: {
                type: 'education',
                contentId,
                notificationType: type,
            },
        });
    }

    /**
     * Send security notification
     */
    async sendSecurityNotification(
        type: 'login' | 'suspicious_activity' | 'password_change',
        details?: string
    ): Promise<void> {
        const messages = {
            login: 'New login detected',
            suspicious_activity: 'Suspicious activity detected',
            password_change: 'Password changed successfully',
        };

        await this.sendLocalNotification({
            title: 'Security Alert',
            body: details || messages[type],
            data: {
                type: 'security',
                securityType: type,
            },
        });
    }

    /**
     * Cleanup notification listeners
     */
    cleanup(): void {
        this.notificationListeners.forEach(listener => {
            listener.remove();
        });
        this.notificationListeners = [];
        logger.info('Push notification listeners cleaned up');
    }
}

// Export singleton instance
export const pushNotificationManager = PushNotificationManager.getInstance();
