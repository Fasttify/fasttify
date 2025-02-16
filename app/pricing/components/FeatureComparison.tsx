'use client'

import { Trophy, Store, Share2, BarChart3, AppWindowIcon as Apps } from 'lucide-react'
import SpotlightCard from '@/components/ui/reactbits/SpotlightCard'
import { Separator } from '@/components/ui/separator'
import FlowingMenu from '@/components/ui/reactbits/FlowingMenu'

const demoItems = [
  {
    text: 'Vuela sin límites',
    image: 'https://picsum.photos/600/400?random=1',
  },
  {
    text: 'Innova el futuro es hoy',
    image: 'https://picsum.photos/600/400?random=2',
  },
  {
    text: 'Impulsa acelera tu éxito',
    image: 'https://picsum.photos/600/400?random=3',
  },
]

export function FeatureComparison() {
  return (
    <div className="py-12 px-2">
      <h2 className="font-normal text-4xl md:text-5xl lg:text-6xl  text-black text-center mb-16">
        Beneficios de cada plan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
        <SpotlightCard
          className="custom-spotlight-card p-6 h-[290px]"
          spotlightColor="rgba(0, 229, 255, 0.2)"
        >
          <div className="flex flex-col gap-4">
            <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-normal mb-2 text-black">Pagos sin complicaciones</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Fasttify te ofrece pagos rápidos y seguros con Mercado Pago y PayU.
              </p>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard
          className="custom-spotlight-card p-6 h-[290px]"
          spotlightColor="rgba(0, 229, 255, 0.2)"
        >
          <div className="flex flex-col items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-50">
              <Store className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-normal text-black">Tu tienda en minutos</h3>
            <p className="text-gray-600 text-base">
              Crea y personaliza tu ecommerce sin conocimientos técnicos.
            </p>
          </div>
        </SpotlightCard>

        <SpotlightCard
          className="custom-spotlight-card p-6 h-[290px]"
          spotlightColor="rgba(0, 229, 255, 0.2)"
        >
          <div className="flex flex-col items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-50">
              <Share2 className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-normal text-black">Múltiples canales de venta</h3>
            <p className="text-gray-600 text-base">
              Vende en redes sociales, marketplaces y más con integración automática.
            </p>
          </div>
        </SpotlightCard>

        <SpotlightCard
          className="custom-spotlight-card p-6 h-[290px] "
          spotlightColor="rgba(0, 229, 255, 0.2)"
        >
          <div className="flex flex-col items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-50">
              <BarChart3 className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-normal text-black">Análisis y reportes en tiempo real</h3>
            <p className="text-gray-600 text-base">
              Obtén información clave para mejorar tu negocio y aumentar tus ventas.
            </p>
          </div>
        </SpotlightCard>

        <SpotlightCard
          className="custom-spotlight-card p-6 h-[290px]"
          spotlightColor="rgba(0, 229, 255, 0.2)"
        >
          <div className="flex flex-col items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-50">
              <Apps className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-normal text-black">Integraciones y personalización</h3>
            <p className="text-gray-600 text-base">
              Conecta herramientas y apps para mejorar la experiencia de tu tienda.
            </p>
          </div>
        </SpotlightCard>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 text-black">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-blue-50">
              <span className="block w-6 h-6 text-blue-500">🔒</span>
            </div>
            <h3 className="text-lg font-normal">Seguridad y protección de datos</h3>
          </div>
        </div>

        <div className="p-6 text-black">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-blue-50">
              <span className="block w-6 h-6 text-blue-500">🔄</span>
            </div>
            <h3 className="text-lg font-normal">Pagos seguros y confiables</h3>
          </div>
        </div>

        <div className="p-6 text-black">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-blue-50">
              <span className="block w-6 h-6 text-blue-500">🛡️</span>
            </div>
            <h3 className="text-lg font-normal">Infraestructura robusta y escalable</h3>
          </div>
        </div>
      </div>
      <div className="max-w-full" style={{ height: '600px', position: 'relative' }}>
        <FlowingMenu items={demoItems} />
      </div>
    </div>
  )
}
