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

    // Return original path for all other deeplinks
    return path;
}

