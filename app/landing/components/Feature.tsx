import Image from "next/image";
import { CheckCircle } from "lucide-react";

export function Feature() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-primary font-medium tracking-wider">
            CARACTERÍSTICAS
          </span>
          <h2 className="text-3xl md:text-4xl font-medium text-black mt-4 mb-6">
            Todo lo que necesitas para tu <br />
            tienda online con Fasttify
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Fasttify te ofrece las herramientas esenciales para que tu negocio
            de dropshipping crezca con facilidad y sin complicaciones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Panel de administración de Fasttify"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply" />
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-medium text-black">
                Gestión eficiente y automatizada
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Con Fasttify, administra tu tienda, productos y pedidos de
                manera fácil y rápida. Automatizamos procesos para que te
                enfoques en vender.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                "Integración con múltiples proveedores",
                "Pagos seguros con Mercado Pago y PayU",
                "Gestión de pedidos automatizada",
                "Personalización avanzada para tu tienda",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-800 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex flex-col">
            <div className="relative aspect-[4/3]  overflow-hidden mb-6">
              <Image
                src="https://images.unsplash.com/photo-1690228254548-31ef53e40cd1?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Interfaz intuitiva de Fasttify"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-grow">
              <h4 className="text-xl font-medium text-black mb-3">
                Interfaz intuitiva
              </h4>
              <p className="text-gray-600">
                Diseñada para que cualquier usuario pueda administrar su negocio
                sin complicaciones.
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="relative aspect-[4/3] overflow-hidden mb-6">
              <Image
                src="https://images.unsplash.com/photo-1571867424488-4565932edb41?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Múltiples métodos de pago"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-grow">
              <h4 className="text-xl font-medium text-black mb-3">
                Diversos métodos de pago
              </h4>
              <p className="text-gray-600">
                Acepta pagos con Mercado Pago y PayU para brindar mayor
                comodidad a tus clientes.
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:col-span-1 md:col-span-2 lg:mt-0 md:mt-8">
            <div className="relative aspect-[4/3] overflow-hidden mb-6">
              <Image
                src="https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=2006&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Automatización y escalabilidad"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-grow">
              <h4 className="text-xl font-medium text-black mb-3">
                Automatización total
              </h4>
              <p className="text-gray-600">
                Reduce el tiempo de gestión con procesos automatizados y
                escalabilidad para crecer sin límites.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
