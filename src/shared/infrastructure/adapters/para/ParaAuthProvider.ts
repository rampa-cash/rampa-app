import { ParaMobile } from '@getpara/react-native-wallet';
import {
    AuthProvider,
    AuthState,
    SessionImportResult,
    VerificationResult,
} from '../../ports/AuthProvider';
import { para } from './paraClient';
import { BrowserAuthService } from './services/BrowserAuthService';
import { ParaErrorHandler } from './services/ErrorHandler';
import { PasskeyService } from './services/PasskeyService';
import { SessionService } from './services/SessionService';
import { VerificationService } from './services/VerificationService';
import { EmailAuthStrategy } from './strategies/EmailAuthStrategy';
import { OAuthAuthStrategy } from './strategies/OAuthAuthStrategy';
import { PhoneAuthStrategy } from './strategies/PhoneAuthStrategy';

export class ParaAuthProvider implements AuthProvider {
    private emailStrategy: EmailAuthStrategy;
    private phoneStrategy: PhoneAuthStrategy;
    private oauthStrategy: OAuthAuthStrategy;
    private browserAuth: BrowserAuthService;
    private sessionService: SessionService;
    private verificationService: VerificationService;
    private passkeyService: PasskeyService;

    constructor(private paraClient: ParaMobile = para) {
        // Initialize services
        this.browserAuth = new BrowserAuthService(paraClient);
        this.sessionService = new SessionService(paraClient);
        this.passkeyService = new PasskeyService(
            paraClient,
            this.sessionService
        );
        this.verificationService = new VerificationService(
            paraClient,
            this.sessionService,
            this.passkeyService
        );

        // Initialize strategies with shared services
        this.emailStrategy = new EmailAuthStrategy(
            paraClient,
            this.browserAuth,
            this.sessionService
        );
        this.phoneStrategy = new PhoneAuthStrategy(
            paraClient,
            this.browserAuth,
            this.sessionService
        );
        this.oauthStrategy = new OAuthAuthStrategy(
            paraClient,
            this.browserAuth,
            this.sessionService
        );
    }

    async initialize(): Promise<void> {
        try {
            await this.paraClient.init();
        } catch (error) {
            console.error('Failed to initialize Para SDK:', error);
            throw new Error('Para SDK initialization failed');
        }
    }

    async signUpOrLogInWithEmail(email: string): Promise<AuthState> {
        return this.emailStrategy.signUpOrLogIn(email);
    }

    async signUpOrLogInWithPhone(phoneNumber: string): Promise<AuthState> {
        return this.phoneStrategy.signUpOrLogIn(phoneNumber);
    }

    async signUpOrLogInWithOAuth(
        provider: 'google' | 'apple'
    ): Promise<AuthState> {
        return this.oauthStrategy.signUpOrLogIn(provider);
    }

    async verifyNewAccount(
        verificationCode: string,
        authState?: any
    ): Promise<VerificationResult> {
        return this.verificationService.verifyNewAccount(
            verificationCode,
            authState
        );
    }

    async resendVerificationCode(): Promise<void> {
        try {
            console.log('[ParaAuthProvider] Resending verification code', {
                type: 'SIGNUP',
            });

            // Para SDK: para.resendVerificationCode({ type?: 'SIGNUP' | 'LINK_ACCOUNT' | 'LOGIN' })
            // For new account verification, we use 'SIGNUP'
            await this.paraClient.resendVerificationCode({ type: 'SIGNUP' });

            console.log(
                '[ParaAuthProvider] Verification code resend completed successfully'
            );
        } catch (error: any) {
            console.error(
                '[ParaAuthProvider] Failed to resend verification code',
                {
                    error,
                    errorMessage: error?.message,
                    errorStack: error?.stack,
                    statusCode: error?.status || error?.statusCode,
                    errorCode: error?.code,
                }
            );

            // Use ErrorHandler to extract and format error
            const errorInfo = ParaErrorHandler.extractErrorInfo(error);
            const errorMessage = ParaErrorHandler.buildErrorMessage(errorInfo);

            throw new Error(
                `Failed to resend verification code: ${errorMessage}`
            );
        }
    }

    async registerPasskey(authState: any): Promise<VerificationResult> {
        return this.passkeyService.registerPasskey(authState);
    }

    async loginWithPasskey(): Promise<VerificationResult> {
        return this.passkeyService.loginWithPasskey();
    }

    // Session management methods - delegate to SessionService
    async isSessionActive(): Promise<boolean> {
        return this.sessionService.isSessionActive();
    }

    async keepSessionAlive(): Promise<boolean> {
        return this.sessionService.keepSessionAlive();
    }

    exportSession(options?: { excludeSigners?: boolean }): string {
        return this.sessionService.exportSession(options);
    }

    async importSessionToBackend(): Promise<SessionImportResult> {
        return this.sessionService.importSessionToBackend();
    }

    // Browser flow methods - delegate to BrowserAuthService and SessionService
    async touchSession(): Promise<void> {
        return this.sessionService.touchSession();
    }

    async waitForLogin(): Promise<void> {
        return this.browserAuth.waitForLogin();
    }

    async waitForSignup(): Promise<void> {
        return this.browserAuth.waitForSignup();
    }

    async waitForWalletCreation(): Promise<void> {
        return this.browserAuth.waitForWalletCreation();
    }

    async logout(): Promise<void> {
        try {
            await this.paraClient.logout();
        } catch (error) {
            console.error('Failed to logout:', error);
            throw new Error('Logout failed');
        }
    }
}
