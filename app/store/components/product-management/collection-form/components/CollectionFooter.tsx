import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'

interface CollectionFooterProps {
  isEditing: boolean
  isSubmitting: boolean
  onSave: () => void
  onDelete?: () => void
}

export function CollectionFooter({
  isEditing,
  isSubmitting,
  onSave,
  onDelete,
}: CollectionFooterProps) {
  return (
    <div className="flex justify-end gap-2 mt-6">
      {isEditing && onDelete && (
        <Button
          variant="destructive"
          className="bg-red-600 hover:bg-red-700"
          onClick={onDelete}
          disabled={isSubmitting}
        >
          Eliminar colección
        </Button>
      )}
      <Button
        className="bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
        onClick={onSave}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader color="white" />
            Guardando...
          </>
        ) : (
          'Guardar'
        )}
      </Button>
    </div>
  )
}
