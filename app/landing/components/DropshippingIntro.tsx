import { Button } from '@/components/ui/button'
import { Download, Rocket, TrendingUp, Trophy, Users, Package, Star } from 'lucide-react'

export function DropshippingIntro() {
  const features = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: 'Lanza tu tienda de forma rápida',
      description:
        'Con nuestra plataforma, puedes crear tu tienda en cuestión de horas y empezar a vender productos desde el primer día, sin complicaciones ni necesidad de inversión inicial.',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Expande sin límites',
      description:
        'Nuestro sistema de dropshipping te permite escalar tu negocio de forma sencilla, con acceso a miles de productos que puedes ofrecer a tus clientes sin tener que gestionar inventarios.',
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Supera las expectativas',
      description:
        'Con nuestra solución integral, puedes ofrecer a tus clientes productos de alta calidad y un proceso de compra rápido y seguro, logrando una experiencia de usuario excepcional.',
    },
  ]

  const stats = [
    {
      icon: <Users className="w-6 h-6" />,
      value: '5000+',
      label: 'Vendedores activos',
    },
    {
      icon: <Package className="w-6 h-6" />,
      value: '30.3k',
      label: 'Productos',
    },
    {
      icon: <Star className="w-6 h-6" />,
      value: '1200+',
      label: 'Reseñas',
    },
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-black mt-4 mb-6">
            Emprende tu negocio de dropshipping hoy mismo
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Miles de emprendedores y empresas de todos los tamaños han generado millones de dólares
            con nuestro sistema de ecommerce, creando tiendas exitosas en línea sin inventarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="p-8 rounded-xl shadow-lg">
              <div className="w-20 h-20 bg-blue-50  rounded-full flex items-center justify-center mx-auto mb-6">
                {feature.icon}
              </div>
              <h4 className="text-xl font-medium text-black mb-3">{feature.title}</h4>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl overflow-hidden mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-medium text-black">
                Dueño de tu negocio, posee tu futuro
              </h3>
              <p className="text-gray-600">
                Visualiza en tiempo real todas las compras registradas en nuestra plataforma. Cada
                compra se actualiza automáticamente.
              </p>
              <Button variant="outline">
                Descargar Aplicación
                <Download className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center ">
                  <div className="flex justify-center mb-2">{stat.icon}</div>
                  <div className="text-3xl font-medium text-black">{stat.value}</div>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
