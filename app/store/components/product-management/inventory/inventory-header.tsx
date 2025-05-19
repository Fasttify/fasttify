import { Home } from 'lucide-react'

export default function InventoryHeader() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Home className="w-5 h-5" />
      <h1 className="text-xl font-medium text-gray-800">Inventario</h1>
    </div>
  )
}
