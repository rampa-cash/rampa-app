/**
 * Error Handler
 *
 * Utility functions for extracting and formatting error information
 * from Para SDK errors
 */

export interface ErrorInfo {
    message: string;
    statusCode?: number;
    errorCode?: string;
    originalError?: any;
}

export class ParaErrorHandler {
    /**
     * Extract error information from Para SDK error
     */
    static extractErrorInfo(error: any): ErrorInfo {
        let errorMessage = 'Unknown error';

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (error?.message) {
            errorMessage = error.message;
        }

        const statusCode = error?.status || error?.statusCode;
        const errorCode = error?.code;

        return {
            message: errorMessage,
            statusCode,
            errorCode,
            originalError: error,
        };
    }

    /**
     * Build a detailed error message with status code and error code
     */
    static buildErrorMessage(errorInfo: ErrorInfo): string {
        let message = errorInfo.message;

        if (errorInfo.statusCode) {
            message = `${message} (Status: ${errorInfo.statusCode})`;
        }

        if (errorInfo.errorCode) {
            message = `${message} (Code: ${errorInfo.errorCode})`;
        }

        return message;
    }

    /**
     * Create an authentication error with context
     */
    static createAuthError(method: string, errorInfo: ErrorInfo): Error {
        const detailedMessage = this.buildErrorMessage(errorInfo);
        const authError = new Error(
            `${method} authentication failed: ${detailedMessage}`
        );

        // Preserve original error details
        (authError as any).originalError = errorInfo.originalError;
        (authError as any).statusCode = errorInfo.statusCode;
        (authError as any).errorCode = errorInfo.errorCode;

        return authError;
    }

    /**
     * Check if error is SMS-related
     */
    static isSmsError(error: any): boolean {
        const errorString = JSON.stringify(error).toLowerCase();
        const statusCode = error?.status || error?.statusCode;

        return (
            errorString.includes('sms') ||
            errorString.includes('verification code') ||
            errorString.includes('phone') ||
            statusCode === 400 || // Bad request might indicate phone format issue
            statusCode === 422 // Unprocessable entity might indicate phone validation issue
        );
    }

    /**
     * Check if error is a cancellation
     */
    static isCancellationError(error: any): boolean {
        return (
            error?.isCancelled === true ||
            error?.message?.toLowerCase().includes('cancelled') ||
            error?.message?.toLowerCase().includes('cancel')
        );
    }
}
