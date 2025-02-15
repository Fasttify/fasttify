'use client'

import { useRef, useEffect, useState } from 'react'
import type { Swiper as SwiperType } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Parallax, Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/parallax'
import 'swiper/css/effect-fade'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface Slide {
  bgColor: string
  title: string
  description: string
  image: string
  ctaText?: string
  ctaLink?: string
}

const slides: Slide[] = [
  {
    bgColor: '#9FA051',
    title: 'Crea tu tienda en minutos',
    description:
      'Con Fasttify, lanza tu negocio online sin complicaciones. Personaliza tu tienda y comienza a vender de inmediato. Todo en una sola plataforma para que no pierdas tiempo.',
    image:
      'https://images.unsplash.com/photo-1738676524296-364cf18900a8?q=80&w=2030&auto=format&fit=crop',
  },
  {
    bgColor: '#9B89C5',
    title: 'Conéctate con proveedores confiables',
    description:
      'Accede a una red de proveedores listos para enviar tus productos. Tú te enfocas en vender, ellos en la logística. Así, disfrutas de soporte y eficiencia en cada paso.',
    image:
      'https://images.unsplash.com/photo-1737991864069-508dd72239fc?q=80&w=1974&auto=format&fit=crop',
  },
  {
    bgColor: '#D7A594',
    title: 'Pagos seguros y sin complicaciones',
    description:
      'Fasttify integra Mercado Pago y PayU para que tus clientes compren con confianza y tú recibas tus pagos sin problemas. La seguridad es nuestra prioridad.',
    image:
      'https://images.unsplash.com/photo-1738707060473-a23914a02d8a?q=80&w=1974&auto=format&fit=crop',
  },
]

export function FashionSlider() {
  const swiperRef = useRef<SwiperType>()
  const [navigationLocked, setNavigationLocked] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoplay, setIsAutoplay] = useState(true)

  useEffect(() => {
    const swiper = swiperRef.current
    if (!swiper) return

    const handleTransitionStart = () => {
      setNavigationLocked(true)
    }

    const handleTransitionEnd = () => {
      setNavigationLocked(false)
    }

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
    <div className="fashion-slider w-full h-screen font-sans relative overflow-hidden">
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
        className="w-full h-full transition-colors duration-1000 delay-1300"
        style={{ backgroundColor: slides[activeIndex].bgColor }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="relative w-full h-full">
            <div
              className="fashion-slider-content absolute top-10 left-10 z-10 max-w-md"
              data-swiper-parallax="-130%"
            >
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="fashion-slider-title text-4xl md:text-5xl lg:text-6xl font-medium mb-4 text-white"
              >
                {slide.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="fashion-slider-description text-lg md:text-xl text-white mb-6 font-medium"
              >
                {slide.description}
              </motion.p>
              <motion.a
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                href={slide.ctaLink}
                className="inline-block bg-white text-black py-2 px-6 rounded-full font-medium hover:bg-opacity-90 transition-colors"
              >
                {slide.ctaText}
              </motion.a>
            </div>
            <div className="fashion-slider-scale absolute w-full h-full overflow-hidden">
              <motion.img
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, ease: 'easeOut' }}
                src={slide.image || '/placeholder.svg'}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
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
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <Pagination totalSlides={slides.length} activeIndex={activeIndex} />
      </div>
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
  )
}

interface NavigationButtonProps {
  direction: 'prev' | 'next'
  onClick: () => void
  disabled: boolean
}

function NavigationButton({ direction, onClick, disabled }: NavigationButtonProps) {
  const baseClasses =
    'fashion-slider-button absolute top-1/2 transform -translate-y-1/2 z-10 transition-opacity duration-500 cursor-pointer bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 md:p-4'
  const positionClasses = direction === 'prev' ? 'left-2 md:left-4' : 'right-2 md:right-4'
  const disabledClasses = disabled ? 'opacity-20 cursor-default' : ''

  return (
    <button
      className={`${baseClasses} ${positionClasses} ${disabledClasses}`}
      onClick={onClick}
      disabled={disabled}
    >
      {direction === 'prev' ? (
        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" />
      ) : (
        <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
      )}
    </button>
  )
}

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
