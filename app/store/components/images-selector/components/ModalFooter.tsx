import { Button } from '@/components/ui/button'

interface ModalFooterProps {
  onCancel: () => void
  onConfirm: () => void
  hasSelection: boolean
}

export default function ModalFooter({ onCancel, onConfirm, hasSelection }: ModalFooterProps) {
  return (
    <div className="p-4 border-t flex justify-end gap-2">
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button
        className="bg-[#2a2a2a] h-9 px-4 text-sm font-medium text-white py-2 rounded-md hover:bg-[#3a3a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onConfirm}
        disabled={!hasSelection}
      >
        Seleccionar
      </Button>
    </div>
  )
}
