import React from 'react';
import { View, ViewStyle } from 'react-native';

import { SupportedCurrency } from '@/constants/currency';
import { Amount } from './amount';
import { AmountSize, AmountTone } from './amount-variants';

export type AmountRowProps = {
    value: number;
    currency: SupportedCurrency;
    tone?: AmountTone; // controls the color of amount
    size?: AmountSize;
    showDivider?: boolean; // central thin divider
    useIcon?: boolean;
    containerStyle?: ViewStyle | ViewStyle[];
};

export function AmountRow({
    value,
    currency,
    tone = AmountTone.Default,
    size = AmountSize.Lg,
    showDivider = true,
    useIcon,
    containerStyle,
}: AmountRowProps) {
    return (
        <View style={[containerStyle as any]}>
            <Amount
                value={value}
                currency={currency}
                size={size}
                tone={tone}
                useIcon={useIcon}
            />
        </View>
    );
}

export default AmountRow;
