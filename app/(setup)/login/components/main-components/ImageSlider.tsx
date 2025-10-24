'use client';

import { useState } from 'react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1737069222398-febfd663da1e?q=80&w=1974&auto=format&fit=crop',
    title: 'Inicia tu viaje de Ecommerce,',
    subtitle: 'Sin inventario, sin preocupaciones',
  },
  {
    image: 'https://images.unsplash.com/photo-1736617004818-a01c44c494ee?q=80&w=1974&auto=format&fit=crop',
    title: 'Dropshipping simplificado,',
    subtitle: 'Vende globalmente, crece localmente',
  },
  {
    image: 'https://images.unsplash.com/photo-1737069220405-6ddcbd8c70c1?q=80&w=1974&auto=format&fit=crop',
    title: 'Cumplimiento sin esfuerzo,',
    subtitle: 'Tus productos entregados en todo el mundo',
  },
];

const ImageSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="hidden lg:block w-1/2 relative overflow-hidden ">
      <div className="absolute inset-0 bg-black/20 z-10" />
      <div className="absolute top-8 left-8 z-20">
        <div className="text-white text-2xl font-semibold">Fastiffy</div>
      </div>
      <div className="absolute bottom-12 left-8 z-20 max-w-md">
        <h2 className="text-white text-4xl font-semibold leading-tight">
          {slides[activeIndex].title}
          <br />
          {slides[activeIndex].subtitle}
        </h2>
        <div className="flex gap-2 mt-6">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-8 h-1 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        speed={2000}
        loop={true}
        className="h-full"
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}>
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="h-screen">
              <OptimizedImage
                src={slide.image}
                alt={`Slide ${index + 1}`}
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
};

export default ImageSlider;
