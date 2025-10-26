/**
 * Error Handling and Logging Utilities
 * 
 * Provides comprehensive error handling, logging, and crash reporting
 * All errors are logged securely and reported appropriately
 */

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    CRITICAL = 'critical',
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: Record<string, any>;
    userId?: string;
    sessionId?: string;
}

export class Logger {
    private static instance: Logger;
    private logs: LogEntry[] = [];
    private maxLogs = 1000;

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private constructor() {
        // Initialize logger
    }

    /**
     * Log a debug message
     */
    debug(message: string, context?: Record<string, any>): void {
        this.log(LogLevel.DEBUG, message, context);
    }

    /**
     * Log an info message
     */
    info(message: string, context?: Record<string, any>): void {
        this.log(LogLevel.INFO, message, context);
    }

    /**
     * Log a warning message
     */
    warn(message: string, context?: Record<string, any>): void {
        this.log(LogLevel.WARN, message, context);
    }

    /**
     * Log an error message
     */
    error(message: string, context?: Record<string, any>): void {
        this.log(LogLevel.ERROR, message, context);
    }

    /**
     * Log a critical message
     */
    critical(message: string, context?: Record<string, any>): void {
        this.log(LogLevel.CRITICAL, message, context);
    }

    /**
     * Internal logging method
     */
    private log(level: LogLevel, message: string, context?: Record<string, any>): void {
        const logEntry: LogEntry = {
            level,
            message,
            timestamp: new Date(),
            context,
        };

        // Add to in-memory logs
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console logging for development
        if (__DEV__) {
            const logMessage = `[${level.toUpperCase()}] ${message}`;
            switch (level) {
                case LogLevel.DEBUG:
                    console.debug(logMessage, context);
                    break;
                case LogLevel.INFO:
                    console.info(logMessage, context);
                    break;
                case LogLevel.WARN:
                    console.warn(logMessage, context);
                    break;
                case LogLevel.ERROR:
                case LogLevel.CRITICAL:
                    console.error(logMessage, context);
                    break;
            }
        }

        // In production, send to crash reporting service
        if (!__DEV__ && (level === LogLevel.ERROR || level === LogLevel.CRITICAL)) {
            this.reportError(logEntry);
        }
    }

    /**
     * Report error to crash reporting service
     */
    private async reportError(logEntry: LogEntry): Promise<void> {
        try {
            // This would integrate with crash reporting service
            // For now, just log to console in development
            console.error('Error reported:', logEntry);
        } catch (error) {
            console.error('Failed to report error:', error);
        }
    }

    /**
     * Get recent logs
     */
    getRecentLogs(count: number = 50): LogEntry[] {
        return this.logs.slice(-count);
    }

    /**
     * Clear all logs
     */
    clearLogs(): void {
        this.logs = [];
    }
}

export class ErrorHandler {
    private static logger = Logger.getInstance();

    /**
     * Handle and log errors consistently
     */
    static handleError(error: Error, context?: Record<string, any>): void {
        const errorContext = {
            ...context,
            errorMessage: error.message,
            errorStack: error.stack,
            errorName: error.name,
        };

        this.logger.error(`Unhandled error: ${error.message}`, errorContext);

        // In production, report to crash reporting service
        if (!__DEV__) {
            this.reportCrash(error, errorContext);
        }
    }

    /**
     * Handle API errors specifically
     */
    static handleApiError(error: any, endpoint: string, context?: Record<string, any>): void {
        const apiContext = {
            ...context,
            endpoint,
            statusCode: error.status || error.statusCode,
            response: error.response?.data || error.data,
        };

        this.logger.error(`API Error: ${endpoint}`, apiContext);
    }

    /**
     * Handle authentication errors
     */
    static handleAuthError(error: Error, context?: Record<string, any>): void {
        const authContext = {
            ...context,
            errorType: 'authentication',
        };

        this.logger.error(`Auth Error: ${error.message}`, authContext);
    }

    /**
     * Handle transaction errors
     */
    static handleTransactionError(error: Error, transactionId?: string, context?: Record<string, any>): void {
        const transactionContext = {
            ...context,
            transactionId,
            errorType: 'transaction',
        };

        this.logger.error(`Transaction Error: ${error.message}`, transactionContext);
    }

    /**
     * Report crash to crash reporting service
     */
    private static async reportCrash(error: Error, context: Record<string, any>): Promise<void> {
        try {
            // This would integrate with crash reporting service like Sentry
            console.error('Crash reported:', { error, context });
        } catch (reportError) {
            console.error('Failed to report crash:', reportError);
        }
    }
}

export class NetworkErrorHandler {
    private static logger = Logger.getInstance();

    /**
     * Handle network connectivity issues
     */
    static handleNetworkError(error: Error, context?: Record<string, any>): void {
        const networkContext = {
            ...context,
            errorType: 'network',
            isOnline: navigator.onLine,
        };

        this.logger.error(`Network Error: ${error.message}`, networkContext);
    }

    /**
     * Handle timeout errors
     */
    static handleTimeoutError(endpoint: string, timeout: number, context?: Record<string, any>): void {
        const timeoutContext = {
            ...context,
            endpoint,
            timeout,
            errorType: 'timeout',
        };

        this.logger.error(`Timeout Error: ${endpoint}`, timeoutContext);
    }
}

// Global error handler
export const setupGlobalErrorHandling = (): void => {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
        window.addEventListener('unhandledrejection', (event) => {
            ErrorHandler.handleError(
                new Error(event.reason?.message || 'Unhandled promise rejection'),
                { reason: event.reason }
            );
        });
    }

    // Handle uncaught errors
    if (typeof window !== 'undefined') {
        window.addEventListener('error', (event) => {
            ErrorHandler.handleError(
                new Error(event.message || 'Uncaught error'),
                { filename: event.filename, lineno: event.lineno, colno: event.colno }
            );
        });
    }
};

// Export logger instance
export const logger = Logger.getInstance();
