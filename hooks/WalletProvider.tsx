import { SupportedCurrency } from '@/constants/currency';
import React, {
    createContext,
    useContext,
    useMemo,
    useState,
} from 'react';

export type WalletCurrency = 'EURC' | 'USDC' | 'SOL';

type WalletMeta = {
    ticker: WalletCurrency;
    label: string;
    symbol: string;
    isoCurrency?: SupportedCurrency;
};

const WALLET_META: Record<WalletCurrency, WalletMeta> = {
    EURC: {
        ticker: 'EURC',
        label: 'Euro Coin',
        symbol: '€',
        isoCurrency: 'EUR',
    },
    USDC: {
        ticker: 'USDC',
        label: 'USD Coin',
        symbol: '$',
        isoCurrency: 'USD',
    },
    SOL: {
        ticker: 'SOL',
        label: 'Solana',
        symbol: 'SOL',
        isoCurrency: 'USD',
    },
};

type WalletContextValue = {
    currency: WalletCurrency;
    setCurrency: (currency: WalletCurrency) => void;
    meta: WalletMeta;
};

const WalletContext = createContext<WalletContextValue | undefined>(
    undefined
);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState<WalletCurrency>('EURC');

    const value = useMemo(
        () => ({
            currency,
            setCurrency,
            meta: WALLET_META[currency],
        }),
        [currency]
    );

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const ctx = useContext(WalletContext);
    if (!ctx) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return ctx;
}

export { WALLET_META };

