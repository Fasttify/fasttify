'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Parallax, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/parallax';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
  bgColor: string;
  title: string;
  description: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
}

const slides: Slide[] = [
  {
    bgColor: '#9FA051',
    title: 'Crea tu tienda en minutos',
    description:
      'Con Fasttify, lanza tu negocio online sin complicaciones. Personaliza tu tienda y comienza a vender de inmediato. Todo en una sola plataforma para que no pierdas tiempo.',
    image: 'https://images.unsplash.com/photo-1738676524296-364cf18900a8?q=80&w=2030&auto=format&fit=crop',
    ctaText: 'Comenzar ahora',
    ctaLink: '#comenzar',
  },
  {
    bgColor: '#9B89C5',
    title: 'Conéctate con proveedores confiables',
    description:
      'Accede a una red de proveedores listos para enviar tus productos. Tú te enfocas en vender, ellos en la logística. Así, disfrutas de soporte y eficiencia en cada paso.',
    image: 'https://images.unsplash.com/photo-1737991864069-508dd72239fc?q=80&w=1974&auto=format&fit=crop',
    ctaText: 'Explorar proveedores',
    ctaLink: '#proveedores',
  },
  {
    bgColor: '#D7A594',
    title: 'Pagos seguros y sin complicaciones',
    description:
      'Fasttify integra Mercado Pago y PayU para que tus clientes compren con confianza y tú recibas tus pagos sin problemas. La seguridad es nuestra prioridad.',
    image: 'https://images.unsplash.com/photo-1738707060473-a23914a02d8a?q=80&w=1974&auto=format&fit=crop',
    ctaText: 'Ver métodos de pago',
    ctaLink: '#pagos',
  },
];

export function FashionSlider() {
  const swiperRef = useRef<SwiperType>();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="fashion-slider w-full h-screen font-sans relative overflow-hidden">
      <Swiper
        modules={[Parallax, Autoplay]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        speed={1300}
        allowTouchMove={true}
        parallax={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        className="w-full h-full transition-colors duration-1000 ease-in-out"
        style={{ backgroundColor: slides[activeIndex].bgColor }}>
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="relative w-full h-full">
            <div className="absolute inset-0 bg-black bg-opacity-30 z-10" />

            <div className="fashion-slider-content absolute z-20 w-full h-full flex flex-col justify-center px-6 md:px-16 lg:px-24">
              <div className="max-w-xl" data-swiper-parallax="-300">
                <AnimatePresence mode="wait">
                  {activeIndex === index && (
                    <motion.div
                      key={`content-${index}`}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -40 }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="space-y-6">
                      <motion.span
                        className="inline-block bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-medium"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}>
                        Fasttify
                      </motion.span>

                      <motion.h2
                        className="text-4xl md:text-5xl lg:text-6xl font-medium  text-white leading-tight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}>
                        {slide.title}
                      </motion.h2>

                      <motion.p
                        className="text-lg md:text-xl text-white/90 font-medium max-w-md leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.8 }}>
                        {slide.description}
                      </motion.p>

                      {slide.ctaText && (
                        <motion.a
                          href={slide.ctaLink || '#'}
                          className="inline-flex items-center bg-white hover:bg-opacity-90 text-black font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9, duration: 0.6 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}>
                          {slide.ctaText}
                          <svg
                            className="ml-2 w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </motion.a>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="fashion-slider-image absolute w-full h-full overflow-hidden">
              <Image
                src={slide.image || '/placeholder.svg'}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
