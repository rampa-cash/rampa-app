/**
 * Offline Data Synchronization and Network Status Handling
 * 
 * Provides offline capabilities, data synchronization, and network status monitoring
 * Ensures app functionality even when network is unavailable
 */

import NetInfo from '@react-native-community/netinfo';
import { logger } from './errorHandler';

export interface NetworkStatus {
    isConnected: boolean;
    isInternetReachable: boolean;
    type: string | null;
    isWifi: boolean;
    isCellular: boolean;
}

export interface SyncQueueItem {
    id: string;
    action: 'create' | 'update' | 'delete';
    endpoint: string;
    data: any;
    timestamp: Date;
    retryCount: number;
    maxRetries: number;
}

export class OfflineManager {
    private static instance: OfflineManager;
    private syncQueue: SyncQueueItem[] = [];
    private isOnline: boolean = true;
    private networkListeners: ((status: NetworkStatus) => void)[] = [];
    private syncInProgress: boolean = false;

    static getInstance(): OfflineManager {
        if (!OfflineManager.instance) {
            OfflineManager.instance = new OfflineManager();
        }
        return OfflineManager.instance;
    }

    private constructor() {
        this.initializeNetworkMonitoring();
    }

    /**
     * Initialize network status monitoring
     */
    private initializeNetworkMonitoring(): void {
        NetInfo.addEventListener((state) => {
            const wasOnline = this.isOnline;
            this.isOnline = state.isConnected ?? false;

            const networkStatus: NetworkStatus = {
                isConnected: state.isConnected ?? false,
                isInternetReachable: state.isInternetReachable ?? false,
                type: state.type,
                isWifi: state.type === 'wifi',
                isCellular: state.type === 'cellular',
            };

            // Notify listeners
            this.networkListeners.forEach((listener) => {
                try {
                    listener(networkStatus);
                } catch (error) {
                    logger.error('Network listener error', { error });
                }
            });

            // Handle network state changes
            if (!wasOnline && this.isOnline) {
                logger.info('Network connection restored');
                this.processSyncQueue();
            } else if (wasOnline && !this.isOnline) {
                logger.warn('Network connection lost');
            }
        });
    }

    /**
     * Add network status listener
     */
    addNetworkListener(listener: (status: NetworkStatus) => void): () => void {
        this.networkListeners.push(listener);
        
        // Return unsubscribe function
        return () => {
            const index = this.networkListeners.indexOf(listener);
            if (index > -1) {
                this.networkListeners.splice(index, 1);
            }
        };
    }

    /**
     * Get current network status
     */
    async getNetworkStatus(): Promise<NetworkStatus> {
        const state = await NetInfo.fetch();
        return {
            isConnected: state.isConnected ?? false,
            isInternetReachable: state.isInternetReachable ?? false,
            type: state.type,
            isWifi: state.type === 'wifi',
            isCellular: state.type === 'cellular',
        };
    }

    /**
     * Check if device is online
     */
    isDeviceOnline(): boolean {
        return this.isOnline;
    }

    /**
     * Add item to sync queue for offline processing
     */
    addToSyncQueue(
        action: 'create' | 'update' | 'delete',
        endpoint: string,
        data: any,
        maxRetries: number = 3
    ): string {
        const item: SyncQueueItem = {
            id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            action,
            endpoint,
            data,
            timestamp: new Date(),
            retryCount: 0,
            maxRetries,
        };

        this.syncQueue.push(item);
        logger.info('Item added to sync queue', { itemId: item.id, action, endpoint });

        // Try to sync immediately if online
        if (this.isOnline) {
            this.processSyncQueue();
        }

        return item.id;
    }

    /**
     * Process sync queue when network is available
     */
    private async processSyncQueue(): Promise<void> {
        if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
            return;
        }

        this.syncInProgress = true;
        logger.info('Processing sync queue', { queueLength: this.syncQueue.length });

        const itemsToProcess = [...this.syncQueue];
        const failedItems: SyncQueueItem[] = [];

        for (const item of itemsToProcess) {
            try {
                await this.processSyncItem(item);
                // Remove successful item from queue
                this.syncQueue = this.syncQueue.filter((q) => q.id !== item.id);
            } catch (error) {
                logger.error('Sync item failed', { itemId: item.id, error });
                
                item.retryCount++;
                if (item.retryCount < item.maxRetries) {
                    failedItems.push(item);
                } else {
                    logger.error('Sync item exceeded max retries', { itemId: item.id });
                    // Remove item that exceeded max retries
                    this.syncQueue = this.syncQueue.filter((q) => q.id !== item.id);
                }
            }
        }

        this.syncInProgress = false;

        if (failedItems.length > 0) {
            logger.warn('Some sync items failed and will be retried', { failedCount: failedItems.length });
        }
    }

    /**
     * Process individual sync item
     */
    private async processSyncItem(item: SyncQueueItem): Promise<void> {
        // This would integrate with your API client
        // For now, simulate API call
        logger.info('Processing sync item', { itemId: item.id, action: item.action, endpoint: item.endpoint });
        
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 100));
        
        // Simulate occasional failures for testing
        if (Math.random() < 0.1) {
            throw new Error('Simulated network error');
        }
    }

    /**
     * Get sync queue status
     */
    getSyncQueueStatus(): {
        totalItems: number;
        pendingItems: number;
        failedItems: number;
    } {
        const totalItems = this.syncQueue.length;
        const failedItems = this.syncQueue.filter((item) => item.retryCount > 0).length;
        const pendingItems = totalItems - failedItems;

        return {
            totalItems,
            pendingItems,
            failedItems,
        };
    }

    /**
     * Clear sync queue
     */
    clearSyncQueue(): void {
        this.syncQueue = [];
        logger.info('Sync queue cleared');
    }

    /**
     * Retry failed sync items
     */
    async retryFailedItems(): Promise<void> {
        const failedItems = this.syncQueue.filter((item) => item.retryCount > 0);
        if (failedItems.length === 0) {
            return;
        }

        logger.info('Retrying failed sync items', { count: failedItems.length });
        await this.processSyncQueue();
    }
}

export class CacheManager {
    private static instance: CacheManager;
    private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
    private maxCacheSize = 100;

    static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    private constructor() {
        // Initialize cache manager
    }

    /**
     * Store data in cache
     */
    set(key: string, data: any, ttlMinutes: number = 30): void {
        const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
        const timestamp = Date.now();

        // Remove expired entries
        this.cleanExpiredEntries();

        // Remove oldest entries if cache is full
        if (this.cache.size >= this.maxCacheSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }

        this.cache.set(key, { data, timestamp, ttl });
        logger.debug('Data cached', { key, ttlMinutes });
    }

    /**
     * Retrieve data from cache
     */
    get(key: string): any | null {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }

        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            logger.debug('Cache entry expired', { key });
            return null;
        }

        logger.debug('Data retrieved from cache', { key });
        return entry.data;
    }

    /**
     * Remove data from cache
     */
    remove(key: string): void {
        this.cache.delete(key);
        logger.debug('Data removed from cache', { key });
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
        logger.info('Cache cleared');
    }

    /**
     * Clean expired entries
     */
    private cleanExpiredEntries(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
    } {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            hitRate: 0, // This would be calculated based on actual usage
        };
    }
}

// Export singleton instances
export const offlineManager = OfflineManager.getInstance();
export const cacheManager = CacheManager.getInstance();
