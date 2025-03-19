import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Image from 'next/image'
import { ConnectModal } from '@/app/store/components/app-integration/ConnectModal'

export function AppIntegrationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-xl md:text-xl font-medium text-gray-800 mb-6">Apps & Integraciones</h1>
        <p className="text-gray-600 mt-2">
          Conecta tu tienda con aplicaciones externas para importar productos y expandir tu negocio.
        </p>
      </div>

      <div className="grid gap-6">
        <h2 className="text-xl md:text-lg font-medium text-gray-800 mb-6">
          Aplicaciones Disponibles
        </h2>

        <Card className="overflow-hidden border-2">
          <div className="grid md:grid-cols-[1fr_2fr]">
            <div className="flex items-center justify-center bg-muted p-6">
              <div className="relative h-48 w-48 ">
                <Image
                  src="/icons/mastershop-logo.png"
                  alt="Master Shop Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="p-6">
              <CardHeader className="p-0 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Master Shop</CardTitle>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Popular
                  </span>
                </div>
                <CardDescription className="mt-2 text-base text-gray-600">
                  Importa productos directamente desde Master Shop a tu tienda Fasttify. Sincroniza
                  inventario, precios y detalles de productos automáticamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 pb-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs">
                    Importación de productos
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs">
                    Sincronización de inventario
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs">
                    Actualización automática
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-0">
                <Button
                  className="bg-[#2a2a2a] h-9 px-4 text-sm font-medium text-white py-2 rounded-md hover:bg-[#3a3a3a] transition-colors"
                  onClick={() => setIsModalOpen(true)}
                >
                  Conectar
                </Button>
              </CardFooter>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="opacity-60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="relative h-10 w-10 rounded-md bg-muted">
                    <Image
                      src={`/placeholder.svg?height=40&width=40`}
                      alt={`App ${i} Logo`}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <CardTitle className="text-lg">Próximamente</CardTitle>
                </div>
                <CardDescription>Nuevas integraciones estarán disponibles pronto.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" disabled>
                  Próximamente
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <ConnectModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
