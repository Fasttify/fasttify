import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Rocket, CreditCard, Package } from 'lucide-react'

export function AboutUs() {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center mb-16">
          <span className="text-primary font-medium tracking-wider">SOBRE FASTTIFY</span>
          <h2 className="text-3xl md:text-4xl font-medium text-black mt-4 mb-6">
            Impulsando el comercio digital
            <br />
            con tecnología y facilidad.
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Fasttify nace con el propósito de ayudar a emprendedores a lanzar y gestionar sus
            tiendas online de manera rápida y eficiente, eliminando las barreras técnicas y
            optimizando la experiencia de compra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl w-full h-[500px] overflow-hidden">
            <Image
              src="/imgs/landing/sdsd@4x.webp"
              alt="Empresario gestionando su tienda online"
              fill
              className="object-contain"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-medium text-black">
              Construye, escala y vende sin límites.
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Con Fasttify, cualquier persona puede crear su propio negocio de dropshipping sin
              necesidad de conocimientos técnicos. Nuestra plataforma ofrece herramientas
              automatizadas, integración con múltiples proveedores y pasarelas de pago seguras.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Nos encargamos de la tecnología para que puedas enfocarte en lo más importante: hacer
              crecer tu negocio.
            </p>
            <Button variant="outline" className="mt-4">
              Conoce nuestra historia
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <Rocket className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-medium text-black">Crecimiento acelerado</h4>
            <p className="text-gray-600">
              Herramientas diseñadas para escalar tu negocio rápidamente.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-medium text-black">Pagos seguros</h4>
            <p className="text-gray-600">
              Integración con Mercado Pago y PayU para transacciones confiables.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-medium text-black">Gestión simplificada</h4>
            <p className="text-gray-600">
              Logística y proveedores gestionados desde una sola plataforma.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
