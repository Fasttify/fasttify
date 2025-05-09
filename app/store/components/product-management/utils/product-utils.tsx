import { toast } from 'sonner'
import type { IProduct } from '@/app/store/hooks/useProducts'
import { exportProductsToCSV } from '@/app/store/components/product-management/utils/exportUtils'

export function formatInventory(quantity: number) {
  if (quantity <= 0) return <span className="text-red-500">Sin stock</span>
  if (quantity < 5) return <span className="text-orange-500">{quantity} en stock</span>
  return <span>{quantity} en stock</span>
}

export function handleExportProducts(products: IProduct[], selectedIds: string[]) {
  // Use the filtered products or selected products
  const productsToExport =
    selectedIds.length > 0 ? products.filter(product => selectedIds.includes(product.id)) : products

  if (productsToExport.length === 0) {
    toast.error('No hay productos para exportar')
    return
  }

  const date = new Date().toISOString().split('T')[0]
  const fileName = `productos-${date}.csv`

  exportProductsToCSV(productsToExport, fileName)

  // Show a success message
  toast.success(`${productsToExport.length} productos exportados correctamente`)
}
