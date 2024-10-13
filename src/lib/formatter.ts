export function formatNumber(value: number) {
  return new Intl.NumberFormat('de-CH', {
    style: 'decimal',
    minimumFractionDigits: 2, // Ensures 2 decimal places
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyCHF(value: number) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
