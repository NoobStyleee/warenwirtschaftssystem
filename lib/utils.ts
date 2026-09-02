export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function isLowStock(stock: number, minStock: number): boolean {
  return stock <= minStock;
}