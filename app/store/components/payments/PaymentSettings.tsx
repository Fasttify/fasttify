import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'

export function PaymentSettings() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <h1 className="text-xl md:text-xl font-medium text-gray-800 mb-6">Configuración de Pagos</h1>

      {/* Sección de Proveedores de Pago */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-medium text-gray-800 mb-1">Pasarelas de Pago</h2>
        <p className="text-gray-600 text-sm mb-4">
          Configura las pasarelas de pago para aceptar transacciones en tu tienda Fasttify. Se
          pueden aplicar tarifas según el proveedor seleccionado.{' '}
          <Link href="#" className="text-blue-600 hover:underline">
            Selecciona un plan
          </Link>
          .
        </p>
        <Button
          variant="outline"
          className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50"
        >
          Configurar pasarela de pago
        </Button>
      </div>

      {/* Sección de Métodos de Pago */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-medium text-gray-800 mb-1">Métodos de Pago Admitidos</h2>
        <p className="text-gray-600 text-sm mb-4">
          Métodos de pago disponibles en Fasttify a través de nuestras pasarelas integradas.
        </p>

        <div className="border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">Wompi</span>
              <span className="text-sm text-gray-600">Sin cargos adicionales en Fasttify</span>
              <div className="mt-2">
                <Image
                  src="/icons/wompi.webp"
                  alt="Wompi logo"
                  width={60}
                  height={40}
                  className="object-contain"
                />
              </div>
            </div>
            <Button
              variant="outline"
              className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              Activar Wompi
            </Button>
          </div>

          <button className="w-full p-4 flex items-center text-gray-600 hover:bg-gray-50 transition-colors">
            <Plus className="w-5 h-5 mr-2 text-gray-500" />
            <span className="text-sm">Añadir nuevo método de pago</span>
          </button>
        </div>
      </div>

      {/* Sección de Método de Captura de Pago */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-medium text-gray-800 mb-1">Método de Captura de Pago</h2>
        <p className="text-gray-600 text-sm mb-2">
          Decide cómo quieres procesar los pagos cuando un cliente realice una compra:{' '}
          <Link href="#" className="text-blue-600 hover:underline">
            Más información
          </Link>
          .
        </p>

        <RadioGroup defaultValue="automatic" className="mt-4 space-y-4">
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="automatic" id="automatic" className="mt-1" />
            <div className="grid gap-1.5">
              <Label htmlFor="automatic" className="font-medium text-gray-800">
                Captura automática al momento del pago
              </Label>
              <p className="text-sm text-gray-600">
                El pago se procesa de inmediato al realizar el pedido.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="when-ready" id="when-ready" className="mt-1" />
            <div className="grid gap-1.5">
              <Label htmlFor="when-ready" className="font-medium text-gray-800">
                Captura automática cuando el pedido esté listo
              </Label>
              <p className="text-sm text-gray-600">
                Se autoriza el pago al finalizar la compra y se captura al completar el pedido.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <RadioGroupItem value="manual" id="manual" className="mt-1" />
            <div className="grid gap-1.5">
              <Label htmlFor="manual" className="font-medium text-gray-800">
                Captura manual
              </Label>
              <p className="text-sm text-gray-600">
                Se autoriza el pago al finalizar la compra y debe capturarse manualmente.
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
