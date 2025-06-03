import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CollectionHeaderProps {
  isEditing: boolean
  onBack: () => void
}

export function CollectionHeader({ isEditing, onBack }: CollectionHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-medium">
          {isEditing ? 'Editar colección' : 'Nueva colección'}
        </h1>
      </div>
      <Button
        variant="outline"
        className="bg-gray-100 hover:bg-gray-200 rounded-md px-4 py-1 h-8 text-sm"
      >
        Ver
      </Button>
    </div>
  )
}
