import { IProduct } from '@/app/store/hooks/data/useProducts';
import { exportProductsToCSV } from '@/app/store/components/product-management/utils/exportUtils';

export function formatInventory(quantity: number): {
  text: string;
  tone: 'critical' | 'warning' | 'success' | 'subdued';
} {
  if (quantity <= 0) return { text: 'Sin stock', tone: 'critical' };
  if (quantity < 5) return { text: `${quantity} en stock`, tone: 'warning' };
  return { text: `${quantity} en stock`, tone: 'success' };
}

export function handleExportProducts(
  products: IProduct[],
  selectedIds: string[],
  showToast: (message: string, isError?: boolean) => void
) {
  const productsToExport =
    selectedIds.length > 0 ? products.filter((product) => selectedIds.includes(product.id)) : products;

  if (productsToExport.length === 0) {
    showToast('No hay productos para exportar', true);
    return;
  }

  const date = new Date().toISOString().split('T')[0];
  const fileName = `productos-${date}.csv`;

  const success = exportProductsToCSV(productsToExport, fileName);

  if (success) {
    showToast('Productos exportados correctamente');
  } else {
    showToast('Error al exportar productos', true);
  }
}
