import { PaymentGatewayType } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData'
import { PaymentGatewayCard } from '@/app/store/components/payments/PaymentGatewayCard'

interface PaymentMethodsSectionProps {
  configuredGateways: PaymentGatewayType[]
  onOpenModal: (gateway: PaymentGatewayType) => void
}

export function PaymentMethodsSection({
  configuredGateways,
  onOpenModal,
}: PaymentMethodsSectionProps) {
  const isGatewayConfigured = (gateway: PaymentGatewayType) => {
    return configuredGateways.includes(gateway)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-base font-medium text-gray-800 mb-1">Métodos de Pago Admitidos</h2>
      <p className="text-gray-600 text-sm mb-4">
        Métodos de pago disponibles en Fasttify a través de nuestras pasarelas integradas.
      </p>

      <div className="space-y-4">
        <PaymentGatewayCard
          gateway="wompi"
          isConfigured={isGatewayConfigured('wompi')}
          onActivate={onOpenModal}
        />

        <PaymentGatewayCard
          gateway="mercadoPago"
          isConfigured={isGatewayConfigured('mercadoPago')}
          onActivate={onOpenModal}
        />
      </div>
    </div>
  )
}
