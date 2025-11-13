import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/theme';
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';
import { ListCard } from '@/components/ui/list-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import ModalScaffold from './ModalScaffold';

export type StepStatus = 'done' | 'current' | 'pending';

export type CompletionStep = {
  id: string;
  title: string;
  subtitle?: string;
  status: StepStatus;
  onPress?: () => void;
};

export type AccountCompletionModalProps = {
  title?: string;
  description?: string;
  steps: CompletionStep[];
};

export function AccountCompletionModal({
  title = 'Get your account ready',
  description = 'Complete your account to unlock all features',
  steps,
}: AccountCompletionModalProps) {
  const t = useTheme();

  const progress = useMemo(() => {
    const total = steps.length || 1;
    const done = steps.filter(s => s.status === 'done').length;
    return Math.round((done / total) * 100);
  }, [steps]);

  return (
    <ModalScaffold>
      <AppText variant={TextVariant.BodyMedium}>{title}</AppText>
      <AppText variant={TextVariant.Secondary} color={'lessEmphasis' as any}>
        {description}
      </AppText>

      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: t.primary.signalViolet }]} />
      </View>

      <View style={{ gap: 10 }}>
        {steps.map(s => (
          <ListCard
            key={s.id}
            title={s.title}
            description={s.subtitle}
            onPress={s.onPress}
            left={
              s.status === 'done' ? (
                <Icon name={IconName.Property1Verify} />
              ) : (
                <View style={[styles.bullet, { borderColor: t.outline.outline2, backgroundColor: s.status === 'current' ? t.primary.signalViolet : 'transparent' }]} />
              )
            }
            right={s.status === 'done' ? undefined : undefined}
          />
        ))}
      </View>
    </ModalScaffold>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  bullet: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
});

export default AccountCompletionModal;
