import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";

export function PurchaseHistoryDemo() {
  return (
    <section className="py-2">
      <div className="container mx-auto px-4 ">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-black mt-4 mb-6">
            Emprende tu negocio de dropshipping hoy mismo
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Miles de emprendedores y empresas de todos los tamaños han generado
            millones de dólares con nuestro sistema de ecommerce, creando
            tiendas exitosas en línea sin inventarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">🚀</span>
            </div>
            <h4 className="text-xl font-medium text-black">
              Lanza tu tienda de forma rápida
            </h4>
            <p className="text-gray-600">
              Con nuestra plataforma, puedes crear tu tienda en cuestión de
              horas y empezar a vender productos desde el primer día, sin
              complicaciones ni necesidad de inversión inicial.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">📈</span>
            </div>
            <h4 className="text-xl font-medium text-black">
              Expande sin límites
            </h4>
            <p className="text-gray-600">
              Nuestro sistema de dropshipping te permite escalar tu negocio de
              forma sencilla, con acceso a miles de productos que puedes ofrecer
              a tus clientes sin tener que gestionar inventarios.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">🏆</span>
            </div>
            <h4 className="text-xl font-medium text-black">
              Supera las expectativas
            </h4>
            <p className="text-gray-600">
              Con nuestra solución integral, puedes ofrecer a tus clientes
              productos de alta calidad y un proceso de compra rápido y seguro,
              logrando una experiencia de usuario excepcional.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div>
              <h3 className="text-2xl font-medium text-black mb-4">
                Dueño de tu negocio, posee tu futuro
              </h3>
              <p className="text-gray-600 mb-6">
                Visualiza en tiempo real todas las compras registradas en
                nuestra plataforma. Cada compra se actualiza automáticamente.
              </p>
              <Button className="bg-primary text-white">
                Descargar Aplicación
                <Download className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-medium text-primary">5000+</div>
                <p className="text-sm text-gray-600">Vendedores activos</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-medium text-primary">30.3k</div>
                <p className="text-sm text-gray-600">Productos</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-medium text-primary">1200+</div>
                <p className="text-sm text-gray-600">Reseñas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h4 className="text-xl font-medium text-black mb-4">
              Panel de Control
            </h4>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Ventas Totales</p>
              <p className="text-3xl font-bold text-primary">$12,536</p>
            </div>
            <Button variant="outline" className="w-full">
              Historial de Ventas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h4 className="text-xl font-medium text-black mb-4">
              Gestión de Productos
            </h4>
            <p className="text-gray-600 mb-4">
              Administra tu catálogo y optimiza tus ventas
            </p>
            <Button className="w-full bg-primary text-white">
              Agregar Producto
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
