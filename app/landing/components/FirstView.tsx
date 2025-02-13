import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import RotatingText from "@/components/ui/reactbits/RotatingText";
import Image from "next/image";

export function FirstView() {
  return (
    <section className="min-h-screen pt-8 relative overflow-hidden bg-[#FAF6F3]">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-transparent" />

      <div className="container mx-auto px-4 pt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 space-y-8">
            <div className="inline-block bg-primary/10 px-4 py-2 rounded-full">
              <span className="text-primary font-medium tracking-wider text-sm">
                La mejor plataforma para tu tienda online
              </span>
            </div>

            <h1 className="font-medium text-4xl md:text-5xl lg:text-6xl  text-black">
              <span className="block">Crea tu tienda en minutos,</span>
              <RotatingText
                texts={[
                  "fácil y rápido",
                  "tu negocio online",
                  "sin complicaciones",
                  "crea hoy mismo",
                ]}
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={3500}
                mainClassName="text-primary font-bold"
              />
              <span className="block">y empieza a vender hoy.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
              Fasttify te permite lanzar tu propio ecommerce de dropshipping de
              manera sencilla. Administra productos, gestiona pagos y haz crecer
              tu negocio sin preocuparte por la logística.
              <span className="block mt-2">
                Únete a cientos de emprendedores y lleva tu tienda al siguiente
                nivel.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 rounded-full"
              >
                Crear mi tienda
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white rounded-full"
                >
                  Ver planes
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">+500</div>
                <p className="text-sm text-gray-600 leading-snug">
                  Tiendas activas
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <p className="text-sm text-gray-600 leading-snug">
                  Gestión automatizada
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <p className="text-sm text-gray-600 leading-snug">
                  Soporte dedicado
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-square max-w-full mx-auto">
              <Image
                src="https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop"
                alt="Fasttify Dashboard"
                fill
                className="object-contain transform hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>

            {/* Decorative elements */}
            <div className="absolute top-1/4 -right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -left-1/4 w-72 h-72 bg-secondary/30 rounded-full blur-3xl" />

            {/* Product badges */}
            <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <span className="text-primary font-medium">
                Sin comisión por ventas
              </span>
            </div>
            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <span className="text-primary font-medium">
                Integración con Mercado Pago
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <div className="w-px h-8 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </div>
    </section>
  );
}
