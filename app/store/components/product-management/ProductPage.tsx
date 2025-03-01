import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, LayoutGrid } from 'lucide-react'
import Image from 'next/image'

export function ProductsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Productos</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tab navigation */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <Tabs defaultValue="all" className="w-auto">
            <TabsList className="bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="px-3 py-2 h-9 rounded-md data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-gray-800"
              >
                All
              </TabsTrigger>
              <TabsTrigger value="add" className="w-8 h-8 p-0">
                <Plus className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="h-4 w-4" />
            </Button>
            <div className="border-l border-gray-200 h-6 mx-1"></div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="p-8">
          {/* Add products section */}
          <div className="mb-12 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-medium text-gray-800 mb-1">Añade tus productos</h2>
              <p className="text-gray-600">
                Comienza abasteciendo tu tienda con productos que tus clientes amarán
              </p>

              <div className="flex gap-3 mt-4">
                <Button className="bg-gray-800 hover:bg-gray-700 text-white gap-2">
                  <Plus className="h-4 w-4" />
                  Añadir producto
                </Button>
                <Button variant="outline" className="gap-2">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 4V20M4 12H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Importar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Image
                  src="/placeholder.svg?height=80&width=120"
                  alt="Sneaker"
                  width={120}
                  height={80}
                  className="object-contain"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Image
                  src="/placeholder.svg?height=80&width=120"
                  alt="Vase"
                  width={120}
                  height={80}
                  className="object-contain"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Image
                  src="/placeholder.svg?height=80&width=120"
                  alt="Wooden item"
                  width={120}
                  height={80}
                  className="object-contain"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Image
                  src="/placeholder.svg?height=80&width=120"
                  alt="Sunglasses"
                  width={120}
                  height={80}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Find products section */}
          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-1">
              Encontrar productos para vender
            </h2>
            <p className="text-gray-600 mb-4">
              Haz que los productos de dropshipping o print on demand se envíen directamente del
              proveedor a tu cliente, y paga solo por lo que vendas.
            </p>

            <Button variant="outline" className="rounded-full">
              Explorar apps de abastecimiento de productos
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
