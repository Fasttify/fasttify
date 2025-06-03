import Link from 'next/link'
import { WompiGuide } from '@/app/store/components/payments/components/WompiGuide'
import { MercadoPagoGuide } from '@/app/store/components/payments/components/MercadoPagoGuide'

export function PaymentProvidersSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-base font-medium text-gray-800 mb-1">Pasarelas de Pago</h2>
      <p className="text-gray-600 text-sm mb-4">
        Configura las pasarelas de pago para aceptar transacciones en tu tienda Fasttify. Se pueden
        aplicar tarifas según el proveedor seleccionado.{' '}
        <Link href="#" className="text-blue-600 hover:underline">
          Selecciona un plan
        </Link>
        .
      </p>
      <div className="flex flex-wrap gap-2">
        <MercadoPagoGuide />
        <WompiGuide />
      </div>
    </div>
  )
}
