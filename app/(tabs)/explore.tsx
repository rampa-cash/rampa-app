import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Collapsible } from '@/components/ui/collapsible';

import { Fonts } from '@/constants/theme';

// UI components
import { AppText } from '@/components/ui/text';
import { TextVariant } from '@/components/ui/text-variants';

import { AppButton } from '@/components/ui/button';
import { ButtonVariant } from '@/components/ui/button-variants';

import { AppInput } from '@/components/ui/input';
import { InputVariant } from '@/components/ui/input-variants';

import { Toggle } from '@/components/ui/toggle';
import { ToggleCard } from '@/components/ui/toggle-card';
import { ListCard } from '@/components/ui/list-card';
import { InvestCard } from '@/components/ui/invest-card';
import { TransactionCard } from '@/components/ui/transaction-card';
import { VirtualCard } from '@/components/ui/virtual-card';
import { Amount } from '@/components/ui/amount';
import { AmountRow } from '@/components/ui/amount-row';
import { AmountSize, AmountTone } from '@/components/ui/amount-variants';

import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/icon-names';

export default function ExploreScreen() {
  // Local state for controlled examples (ToggleCard)
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [securityAlert, setSecurityAlert] = useState(false);

  // Mock data
  const txMock = [
    { id: '1', title: 'Starbucks', subtitle: 'Hoy, 09:12', amount: '€4,50', positive: false },
    { id: '2', title: 'Salario', subtitle: 'Ayer, 18:30', amount: '€2.300,00', positive: true },
  ];

  const assetsMock = [
    { id: 'btc', symbol: 'BTC', address: 'Bitcoin', price: '€61.245', change: '+1,42%', changePositive: true },
    { id: 'eth', symbol: 'ETH', address: 'Ethereum', price: '€3.245', change: '-0,85%', changePositive: false },
  ];

  const textVariants: Array<{ v: TextVariant; label: string }> = useMemo(() => [
    { v: TextVariant.H1, label: 'Text H1' },
    { v: TextVariant.H2, label: 'Text H2' },
    { v: TextVariant.BodyMedium, label: 'Body Medium' },
    { v: TextVariant.Body, label: 'Body' },
    { v: TextVariant.SecondaryMedium, label: 'Secondary Medium' },
    { v: TextVariant.Secondary, label: 'Secondary' },
    { v: TextVariant.Caption, label: 'Caption' },
    { v: TextVariant.NumH1, label: 'Num H1 123' },
    { v: TextVariant.NumH2, label: 'Num H2 123' },
    { v: TextVariant.NumH3, label: 'Num H3 123' },
    { v: TextVariant.NumBody, label: 'Num Body 123' },
    { v: TextVariant.NumSecondary, label: 'Num Secondary 123' },
  ], []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{ fontFamily: Fonts.rounded }}
        >
          Explore
        </ThemedText>
      </ThemedView>

      {/* Text */}
      <Collapsible title="Text (variants)">
        <View style={styles.section}>
          {textVariants.map(tv => (
            <AppText key={tv.label} variant={tv.v}>
              {tv.label}
            </AppText>
          ))}
        </View>
      </Collapsible>

      {/* Buttons */}
      <Collapsible title="Buttons (variants)">
        <View style={styles.section}>
          <AppButton title="Primary" variant={ButtonVariant.Primary} />
          <AppButton title="Primary Contrast" variant={ButtonVariant.PrimaryContrast} />
          <AppButton title="Secondary" variant={ButtonVariant.Secondary} />
          <AppButton title="Tertiary" variant={ButtonVariant.Tertiary} />
          <AppButton title="Disabled" variant={ButtonVariant.Primary} disabled />
        </View>
      </Collapsible>

      {/* Inputs */}
      <Collapsible title="Inputs (variants)">
        <View style={styles.section}>
          <AppInput
            label="Filled"
            placeholder="Escribe algo..."
            helperText="Texto de ayuda"
            variant={InputVariant.Filled}
          />
          <AppInput
            label="Outline con iconos"
            placeholder="Buscar"
            variant={InputVariant.Outline}
            left={<Icon name={IconName.Property1Search} size={18} />}
            right={<Icon name={IconName.Property1Delete} size={18} />}
          />
          <AppInput
            label="Underline con error"
            placeholder="Correo"
            variant={InputVariant.Underline}
            error="Campo requerido"
          />
          <AppInput
            label="Password con toggle"
            placeholder="••••••••"
            secureTextEntry
            secureToggle
            helperText="Puedes mostrar u ocultar"
          />
        </View>
      </Collapsible>

      {/* Toggle */}
      <Collapsible title="Toggle (sizes y label)">
        <View style={styles.section}>
          <Toggle defaultValue size="sm" />
          <Toggle defaultValue size="md" />
          <Toggle defaultValue size="lg" />
          <Toggle defaultValue label="Notificaciones" />
          <Toggle defaultValue label="Etiqueta derecha" labelPosition="right" />
          <Toggle disabled label="Deshabilitado" />
        </View>
      </Collapsible>

      {/* ToggleCard */}
      <Collapsible title="ToggleCard">
        <View style={styles.section}>
          <ToggleCard
            title="Ofertas y marketing"
            description="Recibir emails promocionales"
            value={marketingOptIn}
            onValueChange={setMarketingOptIn}
          />
          <ToggleCard
            title="Alertas de seguridad"
            description="Notificar transacciones sospechosas"
            value={securityAlert}
            onValueChange={setSecurityAlert}
          />
        </View>
      </Collapsible>

      {/* ListCard */}
      <Collapsible title="ListCard">
        <View style={styles.section}>
          <ListCard title="Perfil" description="Tu información personal" left={<Icon name={IconName.Property1Verify} />} />
          <ListCard title="Soporte" description="Centro de ayuda" right={<Icon name={IconName.Property1Help} />} showChevron={false} />
          <ListCard title="Tema" onPress={() => {}} left={<Icon name={IconName.Property1Theme} />} />
        </View>
      </Collapsible>

      {/* InvestCard */}
      <Collapsible title="InvestCard">
        <View style={styles.section}>
          {assetsMock.map(a => (
            <InvestCard
              key={a.id}
              symbol={a.symbol}
              address={a.address}
              price={a.price}
              change={a.change}
              changePositive={a.changePositive}
              left={<Icon name={IconName.Property1Chart} />}
            />
          ))}
        </View>
      </Collapsible>

      {/* TransactionCard */}
      <Collapsible title="TransactionCard">
        <View style={styles.section}>
          {txMock.map(tx => (
            <TransactionCard
              key={tx.id}
              title={tx.title}
              subtitle={tx.subtitle}
              amount={tx.amount}
              positive={tx.positive}
              left={<Icon name={tx.positive ? IconName.Property1ArrowReceive : IconName.Property1ArrowSend} />}
            />
          ))}
        </View>
      </Collapsible>

      {/* VirtualCard */}
      <Collapsible title="VirtualCard (variants)">
        <View style={styles.section}>
          <VirtualCard
            variant="balance"
            title="Virtual Card"
            balanceLabel="BALANCE"
            balance="€3.456,78"
            footer="+0,35% hoy"
          />
          <VirtualCard
            variant="number"
            title="Tarjeta"
            name="Nombre Apellido"
            numberMasked="1234 5678 9012 3456"
            expiry="12/27"
            cvv="123"
            footer="DEBIT CARD"
          />
        </View>
      </Collapsible>

      {/* Amount & AmountRow */}
      <Collapsible title="Amount / AmountRow (sizes & tones)">
        <View style={styles.section}>
          <Amount value={1234.56} currency="EUR" size={AmountSize.Sm} />
          <Amount value={1234.56} currency="EUR" size={AmountSize.Md} />
          <Amount value={1234.56} currency="EUR" size={AmountSize.Lg} />
          <Amount value={1234.56} currency="USD" tone={AmountTone.Accent} />
          <Amount value={1234.56} currency="USD" tone={AmountTone.Muted} />
          <AmountRow value={9876.54} currency="EUR" />
        </View>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  section: {
    gap: 12,
    paddingVertical: 8,
  },
});
