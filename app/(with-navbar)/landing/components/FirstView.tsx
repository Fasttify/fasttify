import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import RotatingText from '@/components/ui/reactbits/RotatingText'
import { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Parallax, Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/parallax'
import 'swiper/css/effect-fade'
import type { Swiper as SwiperType } from 'swiper'

const slides = [
  {
    bgColor: '#9FA051',
    image:
      'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?q=80&w=2072&auto=format&fit=crop',
  },
  {
    bgColor: '#9B89C5',
    image:
      'https://images.unsplash.com/photo-1726066012751-2adfb5485977?q=80&w=2070&auto=format&fit=crop',
  },
  {
    bgColor: '#D7A594',
    image:
      'https://images.unsplash.com/photo-1728044849321-4cbffc50cc1d?q=80&w=2070&auto=format&fit=crop',
  },
]

export function FirstView() {
  const swiperRef = useRef<SwiperType>()
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <motion.div
      initial={{ opacity: 0.0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.1,
        duration: 0.8,
        ease: 'easeInOut',
      }}
    >
      <section className="min-h-screen pt-8 relative overflow-hidden">
        <div className="container mx-auto px-4 pt-12 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10 space-y-8">
              {/* Left content remains unchanged */}
              <div className="inline-block bg-primary/10 px-4 py-2 rounded-full">
                <span className="text-primary font-medium tracking-wider text-sm">
                  La mejor plataforma para tu tienda online
                </span>
              </div>

              <h1 className="font-medium text-4xl md:text-5xl lg:text-6xl text-black">
                <span className="block">Crea tu tienda en minutos,</span>
                <RotatingText
                  texts={[
                    'fácil y rápido',
                    'tu negocio online',
                    'sin complicaciones',
                    'crea hoy mismo',
                  ]}
                  staggerFrom={'last'}
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '-120%' }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  rotationInterval={3500}
                  mainClassName="text-primary font-bold"
                />
                <span className="block">y empieza a vender hoy.</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
                Fasttify te permite lanzar tu propio ecommerce de dropshipping de manera sencilla.
                Administra productos, gestiona pagos y haz crecer tu negocio sin preocuparte por la
                logística.
                <span className="block mt-2">
                  Únete a cientos de emprendedores y lleva tu tienda al siguiente nivel.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/first-steps">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white px-8 rounded-full"
                  >
                    Crear mi tienda
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary text-primary  hover:text-primary rounded-full"
                  >
                    Ver planes
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">+500</div>
                  <p className="text-sm text-gray-600 leading-snug">Tiendas activas</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <p className="text-sm text-gray-600 leading-snug">Gestión automatizada</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                  <p className="text-sm text-gray-600 leading-snug">Soporte dedicado</p>
                </div>
              </div>
            </div>

            {/* Replace ImagesSlider with simplified FashionSlider */}
            <div className="relative">
              <div className="relative aspect-square max-w-full mx-auto">
                <div className="h-[40rem] rounded-2xl overflow-hidden">
                  <Swiper
                    modules={[Parallax, Autoplay, EffectFade]}
                    onSwiper={swiper => (swiperRef.current = swiper)}
                    speed={1300}
                    allowTouchMove={false}
                    parallax={true}
                    effect="fade"
                    autoplay={{
                      delay: 5000,
                      disableOnInteraction: false,
                    }}
                    onSlideChange={swiper => setActiveIndex(swiper.activeIndex)}
                    className="w-full h-full transition-colors duration-1000"
                    style={{ backgroundColor: slides[activeIndex].bgColor }}
                  >
                    {slides.map((slide, index) => (
                      <SwiperSlide key={index} className="relative w-full h-full">
                        <div className="fashion-slider-scale absolute w-full h-full overflow-hidden">
                          <motion.img
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 10, ease: 'easeOut' }}
                            src={slide.image}
                            alt="Fasttify showcase"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>

              {/* Decorative elements */}
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
    </motion.div>
  )
}
