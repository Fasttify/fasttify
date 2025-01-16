import { ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCreative } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/autoplay";

const images = [
  {
    url: "/imgs/landing/carrito.webp",
    alt: "Productos de alta calidad",
  },
  {
    url: "/imgs/landing/telefono.webp",
    alt: "Logística eficiente",
  },
  {
    url: "/imgs/landing/portatil.webp",
    alt: "Tienda en línea moderna",
  },
];

export function Waitlist() {
  return (
    <section className="relative overflow-hidden bg-white max-w-7xl mx-auto">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white_50%,transparent_100%)]" />
      <div className="container relative px-4 md:px-6 py-12 min-h-[600px]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="w-full lg:w-1/2 space-y-8">
            <div className="space-y-4 text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-light  mb-8 md:mb-16">
                Sé el primero en probar nuestra plataforma
              </h1>
              <p className="text-gray-600 md:text-xl max-w-[600px] mx-auto lg:mx-0">
                Estamos desarrollando una plataforma revolucionaria para
                ecommerce de dropshipping. Únete a nuestra lista de espera y
                recibe acceso anticipado tan pronto como esté disponible.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto lg:mx-0">
              <input
                type="email"
                placeholder="tu@email.com"
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 placeholder:text-gray-400"
              />
              <button className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg flex items-center justify-center transition-colors">
                Únete a la lista
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

            <div className="flex justify-center lg:justify-start gap-8 text-gray-600">
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-3xl font-bold text-gray-900">1k+</span>
                <span className="text-sm">En lista de espera</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-3xl font-bold text-gray-900">Pronto</span>
                <span className="text-sm">Acceso anticipado</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative w-[400px] sm:w-[500px] lg:w-[600px] aspect-[16/9] rounded-2xl overflow-hidden">
              <Swiper
                modules={[Autoplay, EffectCreative]}
                effect="creative"
                creativeEffect={{
                  prev: {
                    shadow: true,
                    translate: ["-20%", 0, -1],
                    rotate: [0, 0, -4],
                  },
                  next: {
                    shadow: true,
                    translate: ["100%", 0, 0],
                    rotate: [0, 0, 4],
                  },
                }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                loop={true}
                className="h-full w-full"
              >
                {images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative h-full w-full">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none">
        <div className="absolute h-[50rem] w-[50rem] opacity-10">
          <div className="absolute inset-0 rotate-45 bg-gradient-to-r from-gray-200 to-gray-50 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
