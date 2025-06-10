export function formatInventory(quantity: number): string {
  if (quantity > 0) {
    return `${quantity} en stock`
  }
  return 'Agotado'
}

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return '$0'
  }
  return `$${Number(price).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

export function handleExportProducts(products: any[], selectedProducts: string[]): void {
  console.log('Exporting products...', { products, selectedProducts })
  // Aquí se podría implementar la lógica para exportar a CSV, por ejemplo.
}
