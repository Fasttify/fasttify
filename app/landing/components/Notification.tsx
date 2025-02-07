import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Download,
  Package,
  TrendingUp,
  CreditCard,
  Truck,
  BarChart,
} from "lucide-react";
import Link from "next/link";

export function PurchaseHistoryDemo() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4"> 
        <div className="space-y-4 mb-12">
          <h1 className="text-5xl md:text-6xl font-normal">
            Emprende tu negocio de dropshipping hoy mismo
          </h1>
          <p className="text-lg text-gray-500">
            Miles de emprendedores y empresas de todos los tamaños han generado
            millones de dólares con nuestro sistema de ecommerce, creando
            tiendas exitosas en línea sin inventarios.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <h2 className="text-2xl font-medium">
              Lanza tu tienda de forma rápida
            </h2>
            <p className="text-gray-600">
              Con nuestra plataforma, puedes crear tu tienda en cuestión de
              horas y empezar a vender productos desde el primer día, sin
              complicaciones ni necesidad de inversión inicial.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-medium">Expande sin límites</h2>
            <p className="text-gray-600">
              Nuestro sistema de dropshipping te permite escalar tu negocio de
              forma sencilla, con acceso a miles de productos que puedes ofrecer
              a tus clientes sin tener que gestionar inventarios.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-medium">
              Supera las expectativas 
            </h2>
            <p className="text-gray-600">
              Con nuestra solución integral, puedes ofrecer a tus clientes
              productos de alta calidad y un proceso de compra rápido y seguro,
              logrando una experiencia de usuario excepcional.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl overflow-hidden">
          <Card className="p-6 md:p-8 space-y-8 rounded-3xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
              {/* Left Section with Image */}
              <div className="md:col-span-4 relative">
                <div className="relative rounded-[2rem] overflow-hidden aspect-[3/4]">
                  <Image
                    src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Ecommerce dashboard showcase"
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Sales Overview Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex items-center gap-2">
                      <Package className="text-white w-6 h-6" />
                      <span className="text-white font-medium">
                        Ventas del día: 24
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Section with Text */}
              <div className="md:col-span-4 space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">
                  Dueño de tu negocio, posee tu futuro
                </h1>
                <p className="text-gray-600">
                  Visualiza en tiempo real todas las compras registradas en
                  nuestra plataforma. Cada compra se actualiza automáticamente.
                </p>
                <Button className="bg-white hover:bg-gray-50 text-black border shadow-sm h-12 px-6 rounded-xl">
                  <span>Descargar Aplicación</span>
                  <Download className="ml-2 h-4 w-4" />
                </Button>

                {/* Stats */}
                <div className="flex flex-wrap gap-8 pt-4">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">5000+</p>
                    <p className="text-sm text-gray-600">Vendedores activos</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">30.3k</p>
                    <p className="text-sm text-gray-600">Productos</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">1200+</p>
                    <p className="text-sm text-gray-600">Reseñas</p>
                  </div>
                </div>
              </div>

              {/* Right Section with Dashboard Preview */}
              <div className="md:col-span-4">
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Panel de Control</h3>
                      <Image
                        src="/icons/fast@4x.webp"
                        alt="App icon"
                        width={30}
                        height={30}
                        className="rounded-full"
                      />
                    </div>
                    <div className="bg-black rounded-2xl p-4 relative overflow-hidden">
                      <div className="absolute inset-0">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500 rounded-full blur-2xl opacity-20" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-500 rounded-full blur-2xl opacity-20" />
                      </div>
                      <div className="relative text-white space-y-2">
                        <p className="text-sm opacity-80">Ventas Totales</p>
                        <p className="font-mono text-2xl">$12,536</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm">Historial de Ventas</p>
                        <p className="text-sm text-blue-600">Ver Todo</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">Gestión de Productos</h3>
                    <p className="text-sm text-gray-600">
                      Administra tu catálogo
                      <br />y optimiza tus ventas
                    </p>
                    <Button className="w-full  rounded-xl">
                      Agregar Producto
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <br />

          {/* Bottom Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 md:px-8 pb-6 md:pb-8">
            {/* Features Section */}
            <Card className="p-6 bg-[#ffede8] rounded-3xl">
              <h3 className="font-semibold mb-2">
                Características principales
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5" />
                  <span className="text-sm">Gestión de productos</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5" />
                  <span className="text-sm">Seguimiento de envíos</span>
                </div>
                <div className="flex items-center gap-3">
                  <BarChart className="w-5 h-5" />
                  <span className="text-sm">Estadísticas avanzadas</span>
                </div>
              </div>
              <p className="mt-4 text-sm font-medium">
                30 días de prueba gratis
              </p>
            </Card>

            {/* Platform Benefits */}
            <Card className="p-6 rounded-3xl">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-black">
                  Todas las herramientas
                  <br />
                  que necesitas en
                  <br />
                  una sola plataforma
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-gray-600">
                      Integración con múltiples pasarelas de pago
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-gray-600">
                      Sugerencias automáticas de productos
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card className="p-6 rounded-3xl">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Métricas de Rendimiento</h3>
                    <div className="flex -space-x-2 mt-2">
                      <div className="w-12 h-12 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center">
                        <BarChart className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="w-12 h-12 rounded-full border-2 border-white bg-green-100 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">+45%</p>
                    <p className="text-sm text-gray-600">vs. mes anterior</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
