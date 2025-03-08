'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Plus, Check } from 'lucide-react'
import { PaymentSettingsSkeleton } from '@/app/store/components/payments/PaymentSettingsSkeleton'
import { ApiKeyModal } from '@/app/store/components/payments/ApiKeyModal'
import { useParams } from 'next/navigation'
import {
  useUserStoreData,
  PaymentGatewayType,
} from '@/app/(without-navbar)/first-steps/hooks/useUserStoreData'

export function PaymentSettings() {
  const params = useParams()
  const storeId = params.slug as string
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayType>('mercadoPago')
  const [configuredGateways, setConfiguredGateways] = useState<PaymentGatewayType[]>([])
  const [storeRecordId, setStoreRecordId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { getStorePaymentInfo, configurePaymentGateway } = useUserStoreData()

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        if (!storeId) return

        setIsLoading(true)

        const { id, configuredGateways: gateways } = await getStorePaymentInfo(storeId)

        if (id) {
          setStoreRecordId(id)
          setConfiguredGateways(gateways)
        } else {
          console.error('No se pudo obtener el ID del registro para la tienda:', storeId)
        }
      } catch (error) {
        console.error('Error al obtener datos de la tienda:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (storeId) {
      fetchStoreData()
    }
  }, [storeId])

  const handleOpenModal = (gateway: PaymentGatewayType) => {
    setSelectedGateway(gateway)
    setModalOpen(true)
  }

  const handleSubmit = async (data: {
    gateway: PaymentGatewayType
    publicKey: string
    privateKey: string
  }): Promise<boolean> => {
    try {
      if (!storeRecordId) {
        console.error('No se encontró el ID del registro de la tienda')
        return false
      }

      let configData: any = {}

      if (data.gateway === 'wompi') {
        configData = {
          publicKey: data.publicKey,
          signature: data.privateKey,
          isActive: true,
        }
      } else {
        // Para Mercado Pago y otras pasarelas, usamos publicKey y privateKey
        configData = {
          publicKey: data.publicKey,
          privateKey: data.privateKey,
          isActive: true,
        }
      }

      // Convertir a JSON
      const configObject = JSON.stringify(configData)

      // Usamos la función especializada para configurar pasarelas de pago
      const success = await configurePaymentGateway(storeRecordId, data.gateway, configData, true)

      if (success) {
        if (!configuredGateways.includes(data.gateway)) {
          setConfiguredGateways([...configuredGateways, data.gateway])
        }
        return true
      } else {
        console.error('La configuración de la pasarela falló')
        return false
      }
    } catch (err) {
      console.error('Error al configurar la pasarela de pago:', err)
      return false
    }
  }

  const isGatewayConfigured = (gateway: PaymentGatewayType) => {
    return configuredGateways.includes(gateway)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <h1 className="text-xl md:text-xl font-medium text-gray-800 mb-6">Configuración de Pagos</h1>

      {isLoading ? (
        <PaymentSettingsSkeleton />
      ) : (
        <>
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
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50"
                onClick={() => handleOpenModal('mercadoPago')}
              >
                Configurar Mercado Pago
              </Button>
              <Button
                variant="outline"
                className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50"
                onClick={() => handleOpenModal('wompi')}
              >
                Configurar Wompi
              </Button>
            </div>
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
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800">Wompi</span>
                    {isGatewayConfigured('wompi') && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Activo
                      </span>
                    )}
                  </div>
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
                  onClick={() => handleOpenModal('wompi')}
                >
                  {isGatewayConfigured('wompi') ? 'Reconfigurar' : 'Activar Wompi'}
                </Button>
              </div>

              <button className="w-full p-4 flex items-center text-gray-600 hover:bg-gray-50 transition-colors">
                <Plus className="w-5 h-5 mr-2 text-gray-500" />
                <span className="text-sm">Añadir nuevo método de pago</span>
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg mt-4">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800">Mercado Pago</span>
                    {isGatewayConfigured('mercadoPago') && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Activo
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">Sin cargos adicionales en Fasttify</span>
                  <div className="mt-2">
                    <Image
                      src="/icons/mercadopago-logo.webp"
                      alt="Mercado Pago logo"
                      width={60}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50"
                  onClick={() => handleOpenModal('mercadoPago')}
                >
                  {isGatewayConfigured('mercadoPago') ? 'Reconfigurar' : 'Activar Mercado Pago'}
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
        </>
      )}

      <ApiKeyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        gateway={selectedGateway}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
