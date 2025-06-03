import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PublicationSection } from '@/app/store/components/product-management/collection-form/publication-section'
import { ImageSection } from '@/app/store/components/product-management/collection-form/image-section'

interface CollectionSidebarProps {
  isActive: boolean
  imageUrl: string
  onActiveChange: (value: boolean) => void
  onImageChange: (url: string) => void
}

export function CollectionSidebar({
  isActive,
  imageUrl,
  onActiveChange,
  onImageChange,
}: CollectionSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Publication Section */}
      <PublicationSection isActive={isActive} onActiveChange={onActiveChange} />

      {/* Image Section */}
      <ImageSection imageUrl={imageUrl} onImageChange={onImageChange} />

      {/* Theme Template Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-medium mb-4">Plantilla de tema</h2>
        <Select defaultValue="coleccion">
          <SelectTrigger className="border-gray-300">
            <SelectValue placeholder="Seleccionar plantilla" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="coleccion">Colección predeterminada</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
