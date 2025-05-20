import { InventoryRowProps } from './inventory-table-row'
import { Image } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'
import { useProducts } from '@/app/store/hooks/useProducts'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'
import { UnsavedChangesAlert } from '@/components/ui/unsaved-changes-alert'

interface InventoryCardMobileProps {
  data: InventoryRowProps[]
}

export function InventoryCardMobile({ data }: InventoryCardMobileProps) {
  const pathname = usePathname()
  const params = useParams()
  const storeId = getStoreId(params, pathname)
  const { updateProduct } = useProducts(storeId)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [inStockValues, setInStockValues] = useState<Record<string, number>>(
    data.reduce((acc, item) => ({ ...acc, [item.id]: item.inStock }), {})
  )
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<Record<string, boolean>>({})

  const handleUpdateQuantity = async (id: string, name: string) => {
    try {
      await updateProduct({
        id,
        quantity: inStockValues[id],
      })
      toast.success('Inventario actualizado', {
        description: `El inventario de "${name}" ha sido actualizado correctamente.`,
      })
      setEditingId(null)
      setHasUnsavedChanges(prev => ({ ...prev, [id]: false }))
    } catch (error) {
      toast.error('Error', {
        description:
          'Ha ocurrido un error al actualizar el inventario. Por favor, inténtelo de nuevo.',
      })
      // Revertir el valor en caso de error
      setInStockValues(prev => ({ ...prev, [id]: data.find(item => item.id === id)?.inStock || 0 }))
    }
  }

  const handleDiscardChanges = (id: string) => {
    setInStockValues(prev => ({
      ...prev,
      [id]: data.find(item => item.id === id)?.inStock || 0,
    }))
    setEditingId(null)
    setHasUnsavedChanges(prev => ({ ...prev, [id]: false }))
  }

  return (
    <div className="flex flex-col gap-3 sm:hidden">
      {data.map(item => (
        <div key={item.id} className="border rounded-md p-3 bg-white shadow">
          <div className="flex items-center gap-2">
            {item.images &&
            (Array.isArray(item.images)
              ? item.images.length > 0
              : typeof item.images === 'string' && item.images !== '[]' && item.images !== '') ? (
              <img
                src={
                  typeof item.images === 'string'
                    ? JSON.parse(item.images)[0]?.url
                    : item.images[0]?.url
                }
                alt={item.name}
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                <Image className="h-6 w-6 text-gray-500" />
              </div>
            )}
            <div>
              <div className="font-medium text-black">{item.name}</div>
              <div className="text-sm text-gray-600">SKU: {item.sku}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col">
              <span className="text-gray-500">No disponible</span>
              <span className="font-medium">{item.unavailable}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">Comprometido</span>
              <span className="font-medium">{item.committed}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">Disponible</span>
              <span className="font-medium">{item.available}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">En stock</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="border rounded px-2 py-1 w-16"
                  value={inStockValues[item.id]}
                  onChange={e => {
                    setEditingId(item.id)
                    setHasUnsavedChanges(prev => ({ ...prev, [item.id]: true }))
                    setInStockValues(prev => ({
                      ...prev,
                      [item.id]: Number(e.target.value),
                    }))
                  }}
                  onBlur={() => {
                    if (editingId === item.id && !hasUnsavedChanges[item.id]) {
                      handleUpdateQuantity(item.id, item.name)
                    }
                  }}
                />
                {editingId === item.id && (
                  <Button variant="ghost" size="sm" onClick={() => handleDiscardChanges(item.id)}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </div>
          {hasUnsavedChanges[item.id] && (
            <UnsavedChangesAlert
              onSave={() => handleUpdateQuantity(item.id, item.name)}
              onDiscard={() => handleDiscardChanges(item.id)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
