import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { PaymentGatewayType } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData'
import {
  WompiPaymentIcons,
  MercadoPagoIcons,
} from '@/app/store/components/payments/PaymentMethodIcons'

interface PaymentGatewayCardProps {
  gateway: PaymentGatewayType
  isConfigured: boolean
  onActivate: (gateway: PaymentGatewayType) => void
}

export function PaymentGatewayCard({ gateway, isConfigured, onActivate }: PaymentGatewayCardProps) {
  const gatewayConfig = {
    wompi: {
      name: 'Wompi',
      logo: '/icons/wompi.webp',
      PaymentIcons: WompiPaymentIcons,
    },
    mercadoPago: {
      name: 'Mercado Pago',
      logo: '/icons/mercadopago-logo.webp',
      PaymentIcons: MercadoPagoIcons,
    },
  }

  const config = gatewayConfig[gateway]

  return (
    <div className="border border-gray-200 rounded-lg mt-4">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="font-medium text-gray-800">{config.name}</span>
            {isConfigured && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                <Check className="w-3 h-3 mr-1" />
                Activo
              </span>
            )}
          </div>
          <span className="text-sm text-gray-600">Sin cargos adicionales en Fasttify</span>
          <div className="mt-2">
            <Image
              src={config.logo}
              alt={`${config.name} logo`}
              width={60}
              height={40}
              className="object-contain"
            />
          </div>
        </div>
        <Button
          variant="outline"
          className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50"
          onClick={() => onActivate(gateway)}
        >
          {isConfigured ? `Reconfigurar` : `Activar ${config.name}`}
        </Button>
      </div>

      <div className="w-full p-4 flex flex-col text-gray-600 hover:bg-gray-50 transition-colors">
        <span className="text-sm mb-2">Métodos de pago</span>
        <config.PaymentIcons />
      </div>
    </div>
  )
}
