/**
 * Para Authentication Provider (Adapter)
 *
 * Implements AuthProvider interface using Para SDK
 */

import { ParaMobile } from '@getpara/react-native-wallet';
import { AuthProvider, VerificationResult } from '../../ports/AuthProvider';
import { para } from './paraClient';

export class ParaAuthProvider implements AuthProvider {
    constructor(private paraClient: ParaMobile = para) {}

    async initialize(): Promise<void> {
        try {
            await this.paraClient.init();
        } catch (error) {
            console.error('Failed to initialize Para SDK:', error);
            throw new Error('Para SDK initialization failed');
        }
    }

    async checkUserExists(email: string): Promise<boolean> {
        try {
            // TODO: Implement with actual Para SDK API
            // Check Para SDK documentation for the correct method to check if user exists
            // Example: const result = await this.paraClient.checkIfUserExists({ email });

            // Temporary: throw error until Para SDK integration is complete
            throw new Error(
                'Para SDK integration pending: checkUserExists needs implementation'
            );
        } catch (error) {
            console.error('Failed to check if user exists:', error);
            throw new Error('Failed to check user existence');
        }
    }

    async verifyEmail(verificationCode: string): Promise<VerificationResult> {
        try {
            // TODO: Implement with actual Para SDK API
            // Check Para SDK documentation for the correct method to verify email
            // Example: await this.paraClient.verifyEmail({ verificationCode });

            // Temporary: throw error until Para SDK integration is complete
            throw new Error(
                'Para SDK integration pending: verifyEmail needs implementation'
            );
        } catch (error) {
            console.error('Failed to verify email:', error);
            return {
                success: false,
            };
        }
    }

    async isSessionActive(): Promise<boolean> {
        try {
            // TODO: Implement with actual Para SDK API
            // Check Para SDK documentation for the correct method to check session status
            // Example: return await this.paraClient.isSessionActive();

            // Temporary: return false until Para SDK integration is complete
            console.warn(
                'Para SDK integration pending: isSessionActive needs implementation'
            );
            return false;
        } catch (error) {
            console.error('Failed to check session status:', error);
            return false;
        }
    }

    async getUserId(): Promise<string | null> {
        try {
            // TODO: Implement with actual Para SDK API
            // Check Para SDK documentation for the correct method to get user ID
            // Example: return this.paraClient.getUserId() || null;

            // Temporary: return null until Para SDK integration is complete
            console.warn(
                'Para SDK integration pending: getUserId needs implementation'
            );
            return null;
        } catch (error) {
            console.error('Failed to get user ID:', error);
            return null;
        }
    }

    async getEmail(): Promise<string | null> {
        try {
            // TODO: Implement with actual Para SDK API
            // Check Para SDK documentation for the correct method to get email
            // Example: return this.paraClient.getEmail() || null;

            // Temporary: return null until Para SDK integration is complete
            console.warn(
                'Para SDK integration pending: getEmail needs implementation'
            );
            return null;
        } catch (error) {
            console.error('Failed to get email:', error);
            return null;
        }
    }

    async getSessionToken(): Promise<string | null> {
        try {
            // TODO: Implement with actual Para SDK API
            // Check Para SDK documentation for the correct method to get session token
            // Example: return this.paraClient.getSessionToken() || null;

            // Temporary: return null until Para SDK integration is complete
            console.warn(
                'Para SDK integration pending: getSessionToken needs implementation'
            );
            return null;
        } catch (error) {
            console.error('Failed to get session token:', error);
            return null;
        }
    }

    async logout(): Promise<void> {
        try {
            // TODO: Implement with actual Para SDK API
            // Check Para SDK documentation for the correct method to logout
            // Example: await this.paraClient.logout();

            // Temporary: throw error until Para SDK integration is complete
            throw new Error(
                'Para SDK integration pending: logout needs implementation'
            );
        } catch (error) {
            console.error('Failed to logout:', error);
            throw new Error('Logout failed');
        }
    }
}
