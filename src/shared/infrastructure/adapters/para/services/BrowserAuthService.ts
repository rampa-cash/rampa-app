/**
 * Browser Authentication Service
 *
 * Handles browser-based authentication flows for Para SDK
 * - Opening auth sessions
 * - Waiting for login/signup/wallet creation
 */

import { ParaMobile } from '@getpara/react-native-wallet';
import * as WebBrowser from 'expo-web-browser';

// App scheme for OAuth redirects (must match app.json scheme)
const APP_SCHEME = 'rampaapp';
const APP_SCHEME_REDIRECT_URL = `${APP_SCHEME}://para`;

export class BrowserAuthService {
    constructor(private paraClient: ParaMobile) {}

    /**
     * Open an authentication session in the browser
     * @param url - The URL to open
     * @param redirectUrl - Optional redirect URL (defaults to APP_SCHEME_REDIRECT_URL)
     * @returns WebBrowser result
     */
    async openAuthSession(
        url: string,
        redirectUrl: string = APP_SCHEME_REDIRECT_URL
    ): Promise<WebBrowser.WebBrowserAuthSessionResult> {
        const authUrl = new URL(url);
        authUrl.searchParams.set('nativeCallbackUrl', redirectUrl);

        return await WebBrowser.openAuthSessionAsync(
            authUrl.toString(),
            redirectUrl,
            { preferEphemeralSession: false }
        );
    }

    /**
     * Wait for login to complete after browser-based authentication
     */
    async waitForLogin(): Promise<void> {
        try {
            await this.paraClient.waitForLogin({});
        } catch (error) {
            console.error(
                '[BrowserAuthService] Failed to wait for login:',
                error
            );
            throw error;
        }
    }

    /**
     * Wait for signup to complete after browser-based authentication
     */
    async waitForSignup(): Promise<void> {
        try {
            await this.paraClient.waitForSignup({});
        } catch (error) {
            console.error(
                '[BrowserAuthService] Failed to wait for signup:',
                error
            );
            throw error;
        }
    }

    /**
     * Wait for wallet creation to complete after password creation in browser
     */
    async waitForWalletCreation(): Promise<void> {
        try {
            await this.paraClient.waitForWalletCreation({});
        } catch (error) {
            console.error(
                '[BrowserAuthService] Failed to wait for wallet creation:',
                error
            );
            throw error;
        }
    }
}
