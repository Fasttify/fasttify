import Image from 'next/image'
import { Check } from 'lucide-react'
import { BENEFITS } from '@/app/store/components/app-integration/constants/connectModal'

export function IntroStep() {
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <Image
            src="/svgs/mastershop-svg.svg"
            alt="Master Shop Logo"
            fill
            className="object-contain"
          />
        </div>
        <div>
          <h3 className="text-lg font-medium">Master Shop</h3>
          <p className="text-sm text-muted-foreground">
            Plataforma líder para gestión de productos e inventario
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="font-medium">Beneficios de la integración:</h4>
        <ul className="mt-2 space-y-2">
          {BENEFITS.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 text-blue-600" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
