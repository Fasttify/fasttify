import { useRef, useEffect, useState } from 'react'
import type { Swiper as SwiperType } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Parallax, Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/parallax'
import 'swiper/css/effect-fade'
import { ChevronLeft, ChevronRight, Smartphone, Laptop, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

// Interfaz para cada slide
interface CompatibilitySlide {
  bgColor: string
  title: string
  description: string
  image: string
  statusText: string
  icon: 'mobile' | 'desktop'
}

// Datos de ejemplo para cada slide
const slides: CompatibilitySlide[] = [
  {
    bgColor: '#1F2937',
    title: 'Aplicación Móvil',
    description: 'Plataformas: iOS y Android',
    image:
      'https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=1974&auto=format&fit=crop',
    statusText: 'PROXIMAMENTE',
    icon: 'mobile',
  },
  {
    bgColor: '#1F2937',
    title: 'Potencia de Escritorio',
    description: 'Plataforma: Página de Escritorio',
    image:
      'https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?q=80&w=1964&auto=format&fit=crop',
    statusText: 'DISPONIBLE',
    icon: 'desktop',
  },
]

export function Platform() {
  const swiperRef = useRef<SwiperType>()
  const [activeIndex, setActiveIndex] = useState(0)
  const [navigationLocked, setNavigationLocked] = useState(false)
  const [isAutoplay, setIsAutoplay] = useState(true)

  // Bloqueamos la navegación durante las transiciones
  useEffect(() => {
    const swiper = swiperRef.current
    if (!swiper) return

    const handleTransitionStart = () => setNavigationLocked(true)
    const handleTransitionEnd = () => setNavigationLocked(false)

    swiper.on('transitionStart', handleTransitionStart)
    swiper.on('transitionEnd', handleTransitionEnd)

    return () => {
      swiper.off('transitionStart', handleTransitionStart)
      swiper.off('transitionEnd', handleTransitionEnd)
    }
  }, [])

  const handlePrev = () => {
    if (!navigationLocked && swiperRef.current) {
      swiperRef.current.slidePrev()
    }
  }

  const handleNext = () => {
    if (!navigationLocked && swiperRef.current) {
      swiperRef.current.slideNext()
    }
  }

  const toggleAutoplay = () => {
    if (swiperRef.current) {
      if (isAutoplay) {
        swiperRef.current.autoplay.stop()
      } else {
        swiperRef.current.autoplay.start()
      }
      setIsAutoplay(!isAutoplay)
    }
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Usamos un grid de 1 columna en móvil y 2 columnas en pantallas medianas o mayores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Columna de texto */}
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-medium text-black mt-4 mb-4">
              Trabaja sin problemas en todos tus dispositivos
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              Nuestra plataforma es compatible con todos tus dispositivos:
            </p>
            <ul className="text-gray-600 mb-4 space-y-1">
              <li>Smartphones: iOS y Android</li>
              <li>Tablets: iPadOS y Android</li>
              <li>Computadoras: Windows, macOS y Linux</li>
              <li>Navegadores web: Chrome, Firefox, Safari y Edge</li>
            </ul>
            <p className="text-lg text-gray-600">
              Sincroniza tu trabajo y accede desde cualquier lugar, en cualquier momento.
            </p>
          </div>

          {/* Columna del slider */}
          <div className="relative">
            <Swiper
              modules={[Parallax, Autoplay, EffectFade]}
              onSwiper={swiper => (swiperRef.current = swiper)}
              speed={1000}
              parallax={true}
              effect="fade"
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              onSlideChange={swiper => setActiveIndex(swiper.activeIndex)}
              className="w-full h-72 md:h-96 rounded-sm overflow-hidden"
              style={{ backgroundColor: slides[activeIndex].bgColor }}
            >
              {slides.map((slide, index) => (
                <SwiperSlide key={index} className="relative w-full h-full">
                  {/* Contenido animado con parallax */}
                  <div className="absolute top-6 left-6 z-10 max-w-sm" data-swiper-parallax="-100%">
                    <div className="flex items-center mb-2">
                      {slide.icon === 'mobile' ? (
                        <Smartphone className="h-6 w-6 text-white mr-2" />
                      ) : (
                        <Laptop className="h-6 w-6 text-white mr-2" />
                      )}
                      <h3 className="text-xl md:text-2xl font-medium text-white">{slide.title}</h3>
                    </div>
                    <p className="text-sm md:text-base text-white mb-2">{slide.description}</p>
                    <div className="inline-flex items-center bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                      <Check className="h-4 w-4 mr-1" />
                      {slide.statusText}
                    </div>
                  </div>
                  {/* Imagen de fondo con efecto de escala */}
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 8, ease: 'easeOut' }}
                      className="w-full h-full"
                    >
                      <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                    </motion.div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Botones de navegación */}
            <NavigationButton
              direction="prev"
              onClick={handlePrev}
              disabled={navigationLocked || activeIndex === 0}
            />
            <NavigationButton
              direction="next"
              onClick={handleNext}
              disabled={navigationLocked || activeIndex === slides.length - 1}
            />

            {/* Indicadores de paginación */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <Pagination totalSlides={slides.length} activeIndex={activeIndex} />
            </div>

            {/* Botón para pausar/reanudar autoplay */}
            <button
              onClick={toggleAutoplay}
              className="absolute bottom-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2"
            >
              {isAutoplay ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// Botones de navegación personalizados
interface NavigationButtonProps {
  direction: 'prev' | 'next'
  onClick: () => void
  disabled: boolean
}

function NavigationButton({ direction, onClick, disabled }: NavigationButtonProps) {
  const baseClasses =
    'absolute top-1/2 transform -translate-y-1/2 z-10 transition-opacity duration-500 cursor-pointer bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-5 md:p-3'
  const positionClasses = direction === 'prev' ? 'left-6' : 'right-6'
  const disabledClasses = disabled ? 'opacity-20 cursor-default' : ''
  return (
    <button
      className={`${baseClasses} ${positionClasses} ${disabledClasses} sm:block hidden`}
      onClick={onClick}
      disabled={disabled}
    >
      {direction === 'prev' ? (
        <ChevronLeft className="w-4 h-4 md:w-4 md:h-4 text-white" />
      ) : (
        <ChevronRight className="w-4 h-4 md:w-4 md:h-4 text-white" />
      )}
    </button>
  )
}

// Indicadores de paginación (círculos)
function Pagination({ totalSlides, activeIndex }: { totalSlides: number; activeIndex: number }) {
  return (
    <div className="flex space-x-2">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full ${
            index === activeIndex ? 'bg-white' : 'bg-white bg-opacity-50'
          }`}
        />
      ))}
    </div>
  )
}
