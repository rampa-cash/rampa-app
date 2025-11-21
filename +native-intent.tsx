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
    // Log all incoming paths for debugging
    console.log('[DeepLink] redirectSystemPath called', {
        path,
        initial,
        pathLength: path.length,
    });

    // Skip handling on initial load (app launch)
    if (initial) {
        return path;
    }

    // Normalize path for matching (handle different formats)
    const normalizedPath = path.toLowerCase();

    // Check for Para deep links in multiple formats:
    // - rampaapp://para?method=login
    // - rampaapp://para?status=NEW_USER
    // - rampaapp://para?status=COMPLETE
    // - rampaapp://para (generic)
    // - para?status=... (without scheme, might happen on Android)
    // - /para?status=... (with leading slash)
    // - /para (just /para)
    // Be very aggressive in matching - any path containing "para" with query params or just "para"
    const isParaDeepLink =
        normalizedPath.includes('rampaapp://para') ||
        normalizedPath.includes('para?') ||
        normalizedPath.includes('/para?') ||
        normalizedPath === '/para' ||
        normalizedPath === 'para' ||
        (normalizedPath.includes('para') &&
            (normalizedPath.includes('status=') ||
                normalizedPath.includes('method=') ||
                normalizedPath.includes('?')));

    if (isParaDeepLink) {
        // Parse URL to check for status or method parameters
        try {
            // Ensure path has a scheme for URL parsing
            let urlPath = path;

            // Handle different path formats
            if (!urlPath.includes('://')) {
                // No scheme - add it
                if (urlPath.startsWith('/')) {
                    urlPath = `rampaapp://${urlPath.substring(1)}`;
                } else {
                    urlPath = `rampaapp://${urlPath}`;
                }
            } else if (urlPath.startsWith('/')) {
                // Has scheme but leading slash - remove it
                urlPath = urlPath.replace(/^\/+/, '');
            }

            const url = new URL(urlPath);
            const status = url.searchParams.get('status');
            const method = url.searchParams.get('method');

            // Log for debugging
            console.log('[DeepLink] Para redirect received and handled', {
                originalPath: path,
                normalizedPath: urlPath,
                status,
                method,
            });

            // All Para OAuth redirects should go to login
            // AuthLayout will handle redirecting to dashboard if authenticated
            // The OAuth flow has already completed in OAuthAuthStrategy,
            // so we just need to navigate to a valid route
            return '/(auth)/login';
        } catch (error) {
            // If URL parsing fails, still redirect to login as fallback
            // This handles cases where the path might not be a valid URL format
            console.warn(
                '[DeepLink] Failed to parse Para URL, using fallback',
                {
                    originalPath: path,
                    error:
                        error instanceof Error ? error.message : String(error),
                }
            );
            return '/(auth)/login';
        }
    }

    // Handle generic rampaapp:// redirects (phone OTP, etc.)
    // Para might redirect to rampaapp:// after OTP verification
    if (normalizedPath === 'rampaapp://' || normalizedPath === '/rampaapp://') {
        console.log('[DeepLink] Generic rampaapp:// redirect handled');
        // Redirect to auth entry point - the phone OTP flow will handle the rest
        // The waitForLogin() call in ParaAuthProvider will complete the authentication
        return '/(auth)/login';
    }

    // Return original path for all other deeplinks
    console.log('[DeepLink] Path not matched, returning original', { path });
    return path;
}
