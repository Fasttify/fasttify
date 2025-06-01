import Link from 'next/link'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

export function PaymentCaptureSection() {
  return (
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
  )
}
