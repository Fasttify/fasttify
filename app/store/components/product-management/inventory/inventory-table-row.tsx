import { TableRow, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Image } from 'lucide-react'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'
import { routes } from '@/utils/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { useProducts } from '@/app/store/hooks/useProducts'
import { UnsavedChangesAlert } from '@/components/ui/unsaved-changes-alert'

export interface InventoryRowProps {
  id: string
  name: string
  sku: string
  unavailable: number
  committed: number
  available: number
  inStock: number
  images?:
    | Array<{
        url: string
        alt?: string
      }>
    | string
}

export default function InventoryTableRow({
  id,
  name,
  sku,
  unavailable,
  committed,
  available,
  inStock,
  images,
}: InventoryRowProps) {
  const pathname = usePathname()
  const params = useParams()
  const storeId = getStoreId(params, pathname)
  const { updateProduct } = useProducts(storeId)

  const [availableValue, setAvailableValue] = useState(available)
  const [inStockValue, setInStockValue] = useState(inStock)
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleUpdateQuantity = async () => {
    try {
      await updateProduct({
        id,
        quantity: inStockValue,
      })
      toast.success('Inventario actualizado', {
        description: `El inventario de "${name}" ha sido actualizado correctamente.`,
      })
      setIsEditing(false)
      setHasUnsavedChanges(false)
    } catch (error) {
      toast.error('Error', {
        description:
          'Ha ocurrido un error al actualizar el inventario. Por favor, inténtelo de nuevo.',
      })
      // Revertir los valores en caso de error
      setAvailableValue(available)
      setInStockValue(inStock)
    }
  }

  const handleDiscardChanges = () => {
    setInStockValue(inStock)
    setIsEditing(false)
    setHasUnsavedChanges(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdateQuantity()
    } else if (e.key === 'Escape') {
      handleDiscardChanges()
    }
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <Checkbox />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {images &&
            (Array.isArray(images)
              ? images.length > 0
              : typeof images === 'string' && images !== '[]' && images !== '') ? (
              <img
                src={typeof images === 'string' ? JSON.parse(images)[0]?.url : images[0]?.url}
                alt={name}
                className="w-8 h-8 object-cover rounded"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <Image className="h-4 w-4 text-gray-500" />
              </div>
            )}
            <Link href={routes.store.products.edit(storeId, id)}>
              <Button variant="link" className="font-medium text-black">
                {name}
              </Button>
            </Link>
          </div>
        </TableCell>
        <TableCell>{sku}</TableCell>
        <TableCell>{unavailable}</TableCell>
        <TableCell>{committed}</TableCell>
        <TableCell>
          <Input
            type="number"
            className="border rounded px-2 py-1 w-16"
            value={availableValue}
            readOnly
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="border rounded px-2 py-1 w-16"
              value={inStockValue}
              onChange={e => {
                setIsEditing(true)
                setHasUnsavedChanges(true)
                setInStockValue(Number(e.target.value))
              }}
              onKeyDown={handleKeyPress}
              onBlur={() => {
                if (isEditing && !hasUnsavedChanges) {
                  handleUpdateQuantity()
                }
              }}
            />
            {isEditing && (
              <Button variant="ghost" size="sm" onClick={handleDiscardChanges}>
                Cancelar
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
      {hasUnsavedChanges && (
        <UnsavedChangesAlert onSave={handleUpdateQuantity} onDiscard={handleDiscardChanges} />
      )}
    </>
  )
}
