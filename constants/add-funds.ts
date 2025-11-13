import { IconName } from '@/components/ui/icons/icon-names';

export type AddFundsMethodId = 'bank' | 'card' | 'stablecoins';

export type AddFundsMethod = {
    id: AddFundsMethodId;
    title: string;
    subtitle: string;
    icon: IconName;
};

export const ADD_FUNDS_METHODS: AddFundsMethod[] = [
    {
        id: 'bank',
        title: 'Bank transfer',
        subtitle: 'Top up instantly',
        icon: IconName.Property1Bank,
    },
    {
        id: 'card',
        title: 'Credit or debit card',
        subtitle: 'Use your Visa or Mastercard',
        icon: IconName.Property1ATMCard,
    },
    {
        id: 'stablecoins',
        title: 'Stablecoins',
        subtitle: 'Deposit USDC or USDT from your crypto wallet',
        icon: IconName.Property1CurrencyDollar,
    },
];

export function getAddFundsMethod(id?: string) {
    if (!id) return ADD_FUNDS_METHODS[0];
    return ADD_FUNDS_METHODS.find(method => method.id === id) ?? ADD_FUNDS_METHODS[0];
}

