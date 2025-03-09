import { Search, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DomainManagement() {
  return (
    <div className="bg-gray-100 p-4 md:p-6">
      <h1 className="text-xl md:text-xl font-medium text-gray-800 mb-6">Gestión de Dominios</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <h2 className="text-base font-medium text-gray-800 mb-1">
              Configura tu dominio personalizado
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Vincula un dominio propio o adquiere uno nuevo para darle mayor identidad y
              profesionalismo a tu tienda en Fasttify. Un dominio personalizado aumenta la confianza
              de tus clientes y mejora la visibilidad de tu marca.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-gray-800 h-9 px-4 text-sm font-medium text-white py-2 rounded-md hover:bg-gray-700 transition-colors">
                Comprar dominio
              </Button>
              <Button
                variant="outline"
                className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Conectar dominio existente
              </Button>
            </div>
          </div>
          <div className="w-24 h-24 relative flex-shrink-0">
            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
              <Globe className="text-blue-600 w-12 h-12" />
              <span className="absolute text-black font-medium text-sm">www</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador y lista de dominios */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar dominios"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Globe className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <div className="font-medium text-gray-800">mitienda.fasttify.com</div>
                <div className="text-sm text-gray-500">Dominio predeterminado</div>
              </div>
            </div>
            <div className="text-gray-700">Activo</div>
          </div>
          <div className="mt-3 pl-11">
            <a href="#" className="text-blue-600 hover:underline text-sm">
              Cambiar a un nuevo subdominio Fasttify
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
