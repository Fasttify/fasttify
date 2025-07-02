import Image from 'next/image';
import { Star } from 'lucide-react';

export function Testimonials() {
  return (
    <section className="py-24 ">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-primary font-medium tracking-wider">TESTIMONIOS</span>
          <h2 className="text-3xl md:text-4xl font-medium text-black mt-4 mb-6">
            Lo que dicen nuestros usuarios de Fasttify
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Emprendedores y dueños de tiendas han confiado en Fasttify para llevar sus negocios al siguiente nivel.
            ¡Descubre sus experiencias!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1664575599618-8f6bd76fc670?q=80&w=2070&auto=format&fit=crop"
              alt="Usuario de Fasttify"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-8">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="text-xl text-gray-900 font-medium italic">
              "Fasttify me ha permitido lanzar mi tienda online sin complicaciones. La integración con proveedores y
              pagos es increíblemente sencilla. ¡Totalmente recomendado!"
            </blockquote>
            <div>
              <p className="font-medium text-gray-900">María Gómez</p>
              <p className="text-gray-600">Dueña de tienda / Usuaria por 6 meses</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              comment: 'Configurar mi tienda fue rápido y sin estrés. La automatización me ha ahorrado mucho tiempo.',
              name: 'Carlos Pérez',
              role: 'Emprendedor',
              period: 'Usuario por 1 año',
            },
            {
              comment: 'Las herramientas de gestión son súper intuitivas. Ahora manejo mi inventario sin problemas.',
              name: 'Ana Torres',
              role: 'Vendedora online',
              period: 'Usuario por 8 meses',
            },
            {
              comment:
                'Fasttify ha cambiado la forma en que manejo mis ventas. Todo está centralizado y fácil de administrar.',
              name: 'Luis Fernández',
              role: 'Dropshipper',
              period: 'Usuario por 4 meses',
            },
          ].map((review, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">"{review.comment}"</p>
              <div>
                <p className="font-medium text-gray-900">{review.name}</p>
                <p className="text-sm text-gray-600">
                  {review.role} / {review.period}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
