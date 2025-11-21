import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Image,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/buttons/button';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { ScreenContainer } from '@/components/ui/screen-container';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { StorageKeys } from '@/constants/storage';
import { Palette } from '@/constants/theme';
import { useTheme, useThemeMode } from '@/hooks/theme';

type Slide = {
    id: string;
    title: string;
    description?: string;
    image: { uri: string };
};

const slides: Slide[] = [
    {
        id: '1',
        title: 'Send money home in seconds, no banks, no borders.',
        description:
            'Track every transfer with real-time updates and trusted partners.',
        image: {
            uri: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=640&q=80',
        },
    },
    {
        id: '2',
        title: 'Move funds confidently wherever you are.',
        description:
            'Designed for busy people who need speed, transparency and support.',
        image: {
            uri: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=640&q=80',
        },
    },
    {
        id: '3',
        title: 'Your community, connected through Rampa.',
        description:
            'Enjoy better rates, reliable payouts, and friendly help whenever you need it.',
        image: {
            uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=640&q=80',
        },
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const flatListRef = useRef<FlatList<Slide>>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [listWidth, setListWidth] = useState(0);

    const t = useTheme();
    const { isDark } = useThemeMode();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (!listWidth) return;

        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => {
                const nextIndex = (prevIndex + 1) % slides.length;
                flatListRef.current?.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                });
                return nextIndex;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [listWidth]);

    const handleMomentumScrollEnd = (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => {
        if (!listWidth) return;
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / listWidth);
        const clampedIndex = Math.min(Math.max(index, 0), slides.length - 1);
        setCurrentIndex(clampedIndex);
    };

    const handleLayout = (event: LayoutChangeEvent) => {
        const width = event.nativeEvent.layout.width;
        if (width !== listWidth) {
            setListWidth(width);
        }
    };

    const markOnboardingSeen = async () => {
        try {
            await AsyncStorage.setItem(StorageKeys.onboardingSeen, 'true');
        } catch {
            // Non-blocking if persisting flag fails
        }
    };

    const handleGetStarted = async () => {
        await markOnboardingSeen();
        router.replace('/(auth)/login');
    };

    const renderItem = ({ item }: { item: Slide }) => {
        const width = listWidth || undefined;
        return (
            <View style={[styles.slide, { width }]}>
                <AppText variant={TextVariant.H1} style={styles.title}>
                    {item.title}
                </AppText>
                {item.description ? (
                    <AppText
                        variant={TextVariant.Body}
                        style={[styles.description, { color: t.text.normal2 }]}
                    >
                        {item.description}
                    </AppText>
                ) : null}
                <Image source={item.image} style={styles.image} />
            </View>
        );
    };

    return (
        <ScreenContainer
            variant="base"
            style={{
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 24,
            }}
        >
            <View style={styles.header}>
                <View style={styles.stepper}>
                    {slides.map((slide, index) => (
                        <View
                            key={slide.id}
                            style={[
                                styles.step,
                                {
                                    backgroundColor:
                                        index === currentIndex
                                            ? Palette.primary.flowAqua
                                            : isDark
                                              ? t.background.light
                                              : t.background.inactive,
                                },
                            ]}
                        />
                    ))}
                </View>
                <View style={styles.logoRow}>
                    <Icon
                        name={IconName.Property1RampaSolid}
                        size={28}
                        color={isDark ? t.neutral.white : t.neutral.black}
                    />
                    <AppText
                        variant={TextVariant.BodyMedium}
                        style={{ color: t.text.normal }}
                    >
                        Meet Rampa
                    </AppText>
                </View>
            </View>

            <View style={styles.carouselWrapper} onLayout={handleLayout}>
                <FlatList
                    ref={flatListRef}
                    data={slides}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleMomentumScrollEnd}
                    getItemLayout={(_, index) => ({
                        length: listWidth || 1,
                        offset: (listWidth || 1) * index,
                        index,
                    })}
                    bounces={false}
                    decelerationRate="fast"
                    snapToInterval={listWidth || undefined}
                    disableIntervalMomentum
                />
            </View>

            <View style={styles.footer}>
                <AppButton
                    title="Get started with Rampa"
                    onPress={handleGetStarted}
                    backgroundColor={Palette.primary.signalViolet}
                    style={styles.cta}
                    textStyle={{ color: t.text.onPrimaryBackground }}
                />
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 24,
        gap: 16,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    stepper: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    step: {
        flex: 1,
        height: 3,
        borderRadius: 2,
    },
    carouselWrapper: {
        flex: 1,
        paddingHorizontal: 24,
    },
    slide: {
        flex: 1,
        gap: 16,
        justifyContent: 'flex-start',
    },
    title: {
        marginTop: 12,
    },
    description: {
        fontSize: 16,
        lineHeight: 22,
    },
    image: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 16,
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    cta: {
        minHeight: 52,
        borderRadius: 26,
    },
});
