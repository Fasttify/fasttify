import Image from 'next/image'
import { LegacyStack, Text, Button, Badge } from '@shopify/polaris'
import { PaymentGatewayType } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData'
import {
  WompiPaymentIcons,
  MercadoPagoIcons,
} from '@/app/store/components/payments/components/PaymentMethodIcons'

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
    <div className="border border-gray-200 rounded-lg">
      <div className="p-4">
        <LegacyStack distribution="equalSpacing" alignment="center">
          <LegacyStack alignment="center" spacing="loose">
            <Image
              src={config.logo}
              alt={`${config.name} logo`}
              width={40}
              height={40}
              className="object-contain"
            />
            <LegacyStack vertical spacing="extraTight">
              <LegacyStack alignment="center">
                <Text variant="headingSm" as="h3">
                  {config.name}
                </Text>
                {isConfigured && <Badge tone="success">Activo</Badge>}
              </LegacyStack>
              <Text as="p" tone="subdued">
                Sin cargos adicionales en Fasttify
              </Text>
            </LegacyStack>
          </LegacyStack>

          <Button onClick={() => onActivate(gateway)}>
            {isConfigured ? 'Reconfigurar' : `Activar ${config.name}`}
          </Button>
        </LegacyStack>
      </div>

      <div className="w-full p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <LegacyStack vertical spacing="tight">
          <Text as="p" tone="subdued" variant="bodySm">
            Métodos de pago
          </Text>
          <config.PaymentIcons />
        </LegacyStack>
      </div>
    </div>
  )
}
