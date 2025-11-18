import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface StepIndicatorProps {
    steps: number;
    activeStep: number;
    activeColor?: string;
    color?: string;
    height?: number;
    style?: StyleProp<ViewStyle>;
    inactiveSteps?: number[];
    allPreviousStepsActive?: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
    steps,
    activeStep,
    activeColor = '#007AFF',
    color = '#C7C7CC',
    height = 4,
    style,
    inactiveSteps,
    allPreviousStepsActive = true,
}) => {
    const indicators = Array.from({ length: steps }, (_, i) => i);

    const isStepConsideredActive = (index: number) => {
        if (allPreviousStepsActive) {
            return index < activeStep;
        }
        return index === activeStep - 1;
    };

    return (
        <View style={[styles.container, style]}>
            {indicators.map(index => {
                const isActive =
                    isStepConsideredActive(index) &&
                    !inactiveSteps?.includes(index);
                return (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            {
                                height,
                                backgroundColor: isActive ? activeColor : color,
                            },
                            isActive ? styles.activeIndicator : {},
                        ]}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    indicator: {
        flex: 1,
        borderRadius: 2,
        marginHorizontal: 2,
    },
    activeIndicator: {
        // You can add specific styles for the active indicator if needed
    },
});

export default StepIndicator;
