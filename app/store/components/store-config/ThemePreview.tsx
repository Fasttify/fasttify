import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MoreHorizontal } from 'lucide-react'
import { LogoUploader } from '@/app/store/components/store-config/LogoUploader'
import useStoreDataStore from '@/zustand-states/storeDataStore'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export function ThemePreview() {
  return (
    <div className="container mx-auto p-3 max-w-5xl mt-8 space-y-5">
      <h1 className="text-xl font-semibold text-gray-800">Diseño</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main content section */}
        <div className="lg:col-span-2 space-y-5">
          {/* Current theme preview card */}
          <CurrentThemeCard />

          {/* Available themes card */}
          <AvailableThemesCard />
        </div>

        {/* Sidebar section */}
        <div className="space-y-5">
          {/* Logo upload card */}
          <LogoUploadCard />
        </div>
      </div>
    </div>
  )
}

// Current theme preview component
function CurrentThemeCard() {
  return (
    <Card className="overflow-hidden">
      <div className="p-4 relative">
        <div className="rounded-lg overflow-hidden border border-gray-200 h-72 relative">
          <Image
            src="https://images.unsplash.com/photo-1741482529153-a98d81235d06?q=80&w=2070&auto=format&fit=crop"
            alt="Amazonas theme preview"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            className="object-cover"
          />
        </div>

        <div className="flex items-center justify-between mt-4 flex-col sm:flex-row gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <h2 className="text-xl font-bold">Amazonas</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full w-fit">
              Diseño actual
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button className="bg-[#2a2a2a] h-9 px-4 text-sm font-medium text-white py-2 rounded-md hover:bg-[#3a3a3a] transition-colors flex-1 sm:flex-none">
              Editar diseño actual
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function AvailableThemesCard() {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-64">
        <Image
          src="https://images.unsplash.com/photo-1741548384019-44e405f96772?q=80&w=2070&auto=format&fit=crop"
          alt="Theme collection preview"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
          className="object-cover"
        />
      </div>

      <div className="p-6 flex items-center justify-between bg-white">
        <p className="font-bold text-lg">Más de 60 temas disponibles</p>
        <Link href="/themes">
          <Button variant="outline">Ver otros temas</Button>
        </Link>
      </div>
    </Card>
  )
}

function LogoUploadCard() {
  const { currentStore } = useStoreDataStore()

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-2 text-gray-800">Logo de tu tienda</h3>
      <p className="text-gray-600 mb-4">
        Sube el logo y muestra la imagen de tu marca en tu tienda.
      </p>

      {currentStore?.storeLogo && (
        <div className="mb-4 p-3 border border-gray-200 rounded-md">
          <div className="relative h-32 w-full">
            <Image
              src={currentStore.storeLogo}
              alt={`Logo de ${currentStore.storeName || 'la tienda'}`}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-contain"
            />
          </div>
        </div>
      )}

      <LogoUploader />
    </Card>
  )
}
