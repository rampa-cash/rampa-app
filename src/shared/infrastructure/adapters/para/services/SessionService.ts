/**
 * Session Service
 *
 * Handles Para SDK session management operations
 * - Checking session status
 * - Extending sessions
 * - Exporting sessions
 * - Importing sessions to backend
 */

import { ParaMobile } from '@getpara/react-native-wallet';
import { authApiClient } from '../../../../../domain/auth/apiClient';
import { SessionImportResult } from '../../../ports/AuthProvider';

export class SessionService {
    constructor(private paraClient: ParaMobile) {}

    /**
     * Check if current session is active
     */
    async isSessionActive(): Promise<boolean> {
        try {
            return await this.paraClient.isSessionActive();
        } catch (error) {
            console.error(
                '[SessionService] Failed to check session status:',
                error
            );
            return false;
        }
    }

    /**
     * Extend an active session without requiring full reauthentication
     */
    async keepSessionAlive(): Promise<boolean> {
        try {
            return await this.paraClient.keepSessionAlive();
        } catch (error) {
            console.error(
                '[SessionService] Failed to keep session alive:',
                error
            );
            return false;
        }
    }

    /**
     * Export session state to send to server
     * @param excludeSigners - If true, excludes signing capabilities for enhanced security
     */
    exportSession(options?: { excludeSigners?: boolean }): string {
        try {
            return this.paraClient.exportSession(options || {});
        } catch (error) {
            console.error('[SessionService] Failed to export session:', error);
            throw new Error('Failed to export session');
        }
    }

    /**
     * Restore/refresh the session after browser-based authentication flows
     * Should be called after waitForLogin() or waitForSignup()
     */
    async touchSession(): Promise<void> {
        try {
            await this.paraClient.touchSession();
        } catch (error) {
            console.error('[SessionService] Failed to touch session:', error);
            throw error;
        }
    }

    /**
     * Import Para session to backend and get backend session token
     *
     * Flow:
     * 1. Verifies session is active
     * 2. Exports Para session using exportSession()
     * 3. POSTs to /auth/session/import endpoint
     * 4. Returns backend sessionToken, user, and expiresAt
     */
    async importSessionToBackend(): Promise<SessionImportResult> {
        try {
            // 1. Verify session is active before exporting
            const isActive = await this.isSessionActive();
            if (!isActive) {
                throw new Error('Cannot export session: session is not active');
            }

            // 2. Export Para session
            const serializedSession = this.exportSession({
                excludeSigners: true,
            });

            // Validate exported session
            if (!serializedSession || serializedSession.trim().length === 0) {
                throw new Error('Exported session is empty or invalid');
            }

            // 3. Import session to backend via API
            const result = await authApiClient.importSession(serializedSession);

            // 4. Return backend session token, user, and expiration
            return {
                sessionToken: result.sessionToken,
                user: result.user,
                expiresAt: result.expiresAt,
            };
        } catch (error) {
            console.error(
                '[SessionService] Failed to import session to backend:',
                error
            );

            // Extract more detailed error information
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (
                error &&
                typeof error === 'object' &&
                'message' in error
            ) {
                errorMessage = String(error.message);
            }

            // Check if it's a 401 error specifically
            const statusCode =
                (error as any)?.status || (error as any)?.statusCode;
            if (statusCode === 401) {
                errorMessage = `Session import unauthorized (401). The Para session may be invalid or expired. Original: ${errorMessage}`;
            }

            throw new Error(`Session import failed: ${errorMessage}`);
        }
    }
}
