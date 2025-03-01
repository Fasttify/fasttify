import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Download, Grid3X3, List } from 'lucide-react'
import Image from 'next/image'

export function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-xl font-medium text-gray-800 mb-6">Productos</h1>

      <Card className="border rounded-lg shadow-sm overflow-hidden">
        <div className="border-b p-2 flex items-center justify-between bg-white">
          <div className="flex items-center">
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
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
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

        <div className="p-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
              <div className="space-y-2">
                <h2 className="text-xl font-medium text-gray-800">Añade tus productos</h2>
                <p className="text-gray-600">
                  Comienza abasteciendo tu tienda con productos que tus clientes amarán
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

              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-48 w-48">
                <Image
                  src="https://images.unsplash.com/vector-1738237080330-b9d0755ede07?q=80&w=2148&auto=format&fit=crop"
                  alt="Imagen combinada"
                  width={192}
                  height={192}
                  className="object-contain"
                />
              </div>
            </div>

            <div className="border-t pt-8">
              <h2 className="text-xl font-medium text-gray-800 mb-2">
                Encontrar productos para vender
              </h2>
              <p className="text-gray-600 mb-4">
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
