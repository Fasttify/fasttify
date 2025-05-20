import { Button } from '@/components/ui/button'

export default function InventoryFilter() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Button variant="outline" size="sm">
        Todo
      </Button>
      <Button variant="ghost" size="sm">
        +
      </Button>
    </div>
  )
}
