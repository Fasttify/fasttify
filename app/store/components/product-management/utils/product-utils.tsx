import React from 'react';
import { IProduct } from '@/app/store/hooks/data/useProducts';
import { exportProductsToCSV } from '@/app/store/components/product-management/utils/exportUtils';

export function formatInventory(quantity: number) {
  if (quantity <= 0) return <span className="text-red-500">Sin stock</span>;
  if (quantity < 5) return <span className="text-orange-500">{quantity} en stock</span>;
  return <span>{quantity} en stock</span>;
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
