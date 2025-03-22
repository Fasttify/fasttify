import { Search, Globe, Store, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChangeDomainDialog } from '@/app/store/components/domains/ChangeDomainDialog'
import { EditStoreProfileDialog } from '@/app/store/components/domains/EditStoreProfileDialog'
import { Skeleton } from '@/components/ui/skeleton'
import useStoreDataStore from '@/zustand-states/storeDataStore'
import { Amplify } from 'aws-amplify'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
})

export function DomainManagement() {
  const { currentStore, isLoading } = useStoreDataStore()
  const [openChangeDomainDialog, setOpenChangeDomainDialog] = useState(false)
  const [openEditProfileDialog, setOpenEditProfileDialog] = useState(false)

  if (isLoading) {
    return (
      <div className="bg-gray-100 p-4 md:p-6">
        <Skeleton className="h-8 w-48 mb-6" />

        {/* Skeleton for domain configuration section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-48" />
              </div>
            </div>
            <Skeleton className="w-24 h-24 rounded-full" />
          </div>
        </div>

        {/* Skeleton for store details section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-4">
            <div className="flex items-center py-2 border-t border-gray-100">
              <Skeleton className="h-5 w-5 rounded-full mr-3" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="flex items-start py-2 border-t border-gray-100">
              <Skeleton className="h-5 w-5 rounded-full mr-3 mt-0.5" />
              <div className="w-full">
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="mt-4 pt-2 pl-9">
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        {/* Skeleton for domain search and list */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="mt-3 pl-11">
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>
      </div>
    )
  }

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
              <Button className="bg-[#2a2a2a] h-9 px-4 text-sm font-medium text-white py-2 rounded-md hover:bg-[#3a3a3a] transition-colors">
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

      {/* Detalles de la tienda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-medium text-gray-800 mb-4">Detalles de la tienda</h2>

        <div className="space-y-4">
          <div className="flex items-center py-2 border-t border-gray-100">
            <Store className="h-5 w-5 text-gray-500 mr-3" />
            <span className="font-medium text-gray-800">{currentStore?.storeName}</span>
          </div>

          <div className="flex items-start py-2 border-t border-gray-100">
            <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <div className="font-medium text-gray-800">Dirección de facturación</div>
              <div className="text-sm text-gray-500">Colombia</div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-2 pl-9">
          <button
            onClick={() => setOpenEditProfileDialog(true)}
            className="text-blue-600 hover:underline text-sm text-left"
          >
            Editar detalles de la tienda
          </button>
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
                <div className="font-medium text-gray-800">{currentStore?.customDomain}</div>
                <div className="text-sm text-gray-500">Dominio predeterminado</div>
              </div>
            </div>
            <div className="text-gray-700">Activo</div>
          </div>
          <div className="mt-3 pl-11">
            <button
              onClick={() => setOpenChangeDomainDialog(true)}
              className="text-blue-600 hover:underline text-sm text-left"
            >
              Cambiar a un nuevo subdominio Fasttify
            </button>
          </div>
        </div>
      </div>

      <ChangeDomainDialog
        open={openChangeDomainDialog}
        onOpenChange={setOpenChangeDomainDialog}
        storeId={currentStore?.id || ''}
      />

      <EditStoreProfileDialog
        open={openEditProfileDialog}
        onOpenChange={setOpenEditProfileDialog}
        storeId={currentStore?.id || ''}
        initialData={{
          storeName: currentStore?.storeName,
          contactEmail: currentStore?.contactEmail || '',
          contactPhone: currentStore?.contactPhone?.toString() || '',
        }}
      />
    </div>
  )
}
