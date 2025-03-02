import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Icons } from '@/app/store/icons/index'

export function InventoryTracking() {
  return (
    <div className="bg-gray-100 p-3 w-full md:w-5xl mx-auto">
      <h1 className="text-xl md:text-xl font-medium text-gray-800 mb-6">Inventario</h1>
      <Card className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8 flex flex-col items-center justify-center text-center">
        <div className="flex justify-center">
          <div className=" rounded-lg p-4 flex items-center justify-center h-40 w-40 md:h-48 md:w-48">
            <Icons.Inventory />
          </div>
        </div>

        {/* Título y descripción */}
        <h2 className="text-lg md:text-xl font-medium text-gray-800 mb-2">
          Haz seguimiento de tu inventario
        </h2>
        <p className="text-gray-600 text-sm md:text-base mb-4">
          Cuando habilites el seguimiento de inventario en tus productos, podrás ver y ajustar sus
          recuentos de inventario aquí.
        </p>

        {/* Botón */}
        <Link href="/productos">
          <Button className="bg-gray-800 hover:bg-gray-700 text-white">Ir a productos</Button>
        </Link>
      </Card>
    </div>
  )
}
