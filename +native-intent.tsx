/**
 * Expo Router deeplink handler for Para OAuth redirects
 * 
 * This file handles deeplinks from OAuth providers (Google, Apple) back to the app.
 * Required for Expo Router apps using Para OAuth authentication.
 * 
 * Reference: https://docs.getpara.com/v2/react-native/guides/social-login#expo
 */

export function redirectSystemPath({
    path,
    initial,
}: {
    path: string;
    initial: boolean;
}) {
    // Handle Para OAuth redirects
    // Para redirects use format: rampaapp://para?method=login
    if (path.includes('para?method=login') && !initial) {
        // Redirect to auth entry point - the OAuth flow will handle the rest
        return '/(auth)/login';
    }

    // Handle Para phone OTP redirects
    // Para might redirect to rampaapp://para or rampaapp:// after OTP verification
    if ((path.includes('rampaapp://para') || path === 'rampaapp://') && !initial) {
        // Redirect to auth entry point - the phone OTP flow will handle the rest
        // The waitForLogin() call in ParaAuthProvider will complete the authentication
        return '/(auth)/login';
    }

    // Return original path for all other deeplinks
    return path;
}

