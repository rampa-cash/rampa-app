/**
 * Infrastructure Barrel Export
 *
 * Central export point for all infrastructure providers and factories
 */

// Ports (Interfaces)
export type { AuthProvider, VerificationResult } from './ports/AuthProvider';
export type { WalletProvider } from './ports/WalletProvider';

// Adapters - Para
export { ParaAuthProvider } from './adapters/para/ParaAuthProvider';
export { initializePara, para } from './adapters/para/paraClient';
export { ParaWalletProvider } from './adapters/para/ParaWalletProvider';

// Adapters - Mock (for testing)
export { MockAuthProvider } from './adapters/mock/MockAuthProvider';
export { MockWalletProvider } from './adapters/mock/MockWalletProvider';

// Factory
export { ProviderFactory } from './factory/ProviderFactory';
export type {
    AuthProviderType,
    WalletProviderType,
} from './factory/ProviderFactory';
