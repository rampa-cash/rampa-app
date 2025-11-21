/**
 * Catch-all route for Para OAuth deep links
 *
 * Handles deep links like:
 * - rampaapp://para?status=NEW_USER
 * - rampaapp://para?status=COMPLETE
 * - rampaapp://para?method=login
 *
 * This route catches the deep link and redirects to login,
 * which will then redirect to dashboard if authenticated.
 */

import { Redirect, useLocalSearchParams } from 'expo-router';

export default function ParaDeepLinkHandler() {
    const params = useLocalSearchParams();

    // Log for debugging
    console.log('[ParaDeepLinkHandler] Caught Para deep link', {
        params,
        status: params.status,
        method: params.method,
    });

    // The OAuth flow has already completed in OAuthAuthStrategy
    // We just need to redirect to a valid route
    // AuthLayout will handle redirecting to dashboard if authenticated
    return <Redirect href="/(auth)/login" />;
}
