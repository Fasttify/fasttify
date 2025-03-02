import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Download, Grid3X3, List } from 'lucide-react'
import { Icons } from '@/app/store/icons/index'
import Image from 'next/image'

export function ProductsPage() {
  return (
    <div className="bg-gray-100 p-3 w-full md:w-5xl mx-auto">
      <h1 className="text-xl md:text-xl font-medium text-gray-800 mb-6">Productos</h1>

      <Card className="border rounded-lg shadow-sm overflow-hidden">
        {/* Header de navegación */}
        <div className="border-b p-2 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white">
          <div className="flex items-center justify-between w-full sm:w-auto mb-2 sm:mb-0">
            <Tabs defaultValue="all" className="w-auto">
              <TabsList className="bg-transparent h-9">
                <TabsTrigger
                  value="all"
                  className="px-4 py-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm"
                >
                  All
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full ml-2">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-4 sm:p-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
              <div className="space-y-2">
                <h2 className="text-lg md:text-xl font-medium text-gray-800">
                  Añade tus productos
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Comienza abasteciendo tu tienda con productos que tus clientes amarán.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button className="bg-gray-800 hover:bg-gray-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir producto
                  </Button>
                  <Button variant="outline" className="border-gray-300">
                    <Download className="h-4 w-4 mr-2" />
                    Importar
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className=" rounded-lg p-4 flex items-center justify-center h-40 w-40 md:h-48 md:w-48">
                 <Icons.Products/>
                </div>
              </div>
            </div>

            <div className="border-t pt-8">
              <h2 className="text-lg md:text-xl font-medium text-gray-800 mb-2">
                Encontrar productos para vender
              </h2>
              <p className="text-gray-600 text-sm md:text-base mb-4">
                Haz que los productos de dropshipping o print on demand se envíen directamente del
                proveedor a tu cliente, y paga solo por lo que vendas.
              </p>
              <Button variant="outline" className="border-gray-300">
                Explorar apps de abastecimiento de productos
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
