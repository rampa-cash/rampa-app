export type SupportedCurrency = 'USD' | 'EUR';

export const CurrencySymbol: Record<SupportedCurrency, string> = {
  USD: '$',
  EUR: '€',
};

export function formatCurrency(
  value: number,
  currency: SupportedCurrency,
  locale?: string,
  opts?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
) {
  const nf = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: opts?.minimumFractionDigits ?? 2,
    maximumFractionDigits: opts?.maximumFractionDigits ?? 2,
  });
  return nf.format(value);
}

