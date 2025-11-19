import { Palette } from '@/constants/theme';
import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StepIndicator from './ui/StepIndicator';

export default function CustomTabBar(
    props: BottomTabBarProps & { inactiveSteps?: number[] }
) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            <StepIndicator
                steps={props.state.routes.length}
                activeStep={props.state.index + 1}
                inactiveSteps={props.inactiveSteps}
                height={1}
                allPreviousStepsActive={false}
                color="transparent"
                activeColor={Palette.primary.flowAqua}
            />
            <BottomTabBar {...props} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fcfcfd', // fondo del tab bar + stepper
    },
});
