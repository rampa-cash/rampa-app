import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/theme';
import { ListCard } from '@/components/ui/list-card';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';
import { AppButton } from '@/components/ui/button';
import { ButtonVariant } from '@/components/ui/button-variants';
import ModalScaffold from './ModalScaffold';

export type AddMethod = {
  id: string;
  title: string;
  subtitle: string;
  icon?: IconName;
  highlighted?: boolean;
  onPress?: () => void;
};

export type AddFundsMethodModalProps = {
  title?: string;
  methods: AddMethod[];
  onDone?: () => void;
};

export function AddFundsMethodModal({
  title = 'Change add funds method',
  methods,
  onDone,
}: AddFundsMethodModalProps) {
  const t = useTheme();
  return (
    <ModalScaffold>
      <View style={{ gap: 10 }}>
        {methods.map(m => (
          <ListCard
            key={m.id}
            title={m.title}
            description={m.subtitle}
            onPress={m.onPress}
            left={<Icon name={m.icon ?? IconName.Property1Bank} />}
            style={m.highlighted ? [{ borderColor: t.primary.signalViolet }] : undefined}
          />
        ))}
      </View>
      <AppButton title="Done" variant={ButtonVariant.PrimaryContrast} onPress={onDone} />
    </ModalScaffold>
  );
}

const styles = StyleSheet.create({});

export default AddFundsMethodModal;

