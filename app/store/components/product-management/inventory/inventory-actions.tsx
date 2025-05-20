import { Button } from '@/components/ui/button'

export default function InventoryActions() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        Exportar
      </Button>
      <Button variant="outline" size="sm">
        Importar
      </Button>
    </div>
  )
}
