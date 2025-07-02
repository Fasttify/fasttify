import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Enhanced testimonial data with more distinct background colors and device images
const testimonials = [
  {
    id: 1,
    quote: 'Easy to set up, the design looks really nice and cool. Also, the technical support team is really helpful.',
    author: 'Padel Island',
    deviceImage: 'https://images.unsplash.com/photo-1734789670422-3d715b953008?q=80&w=1974&auto=format&fit=crop',
    deviceTitle: 'MODA',
    backgroundColor: 'bg-blue-50',
  },
  {
    id: 2,
    quote:
      'Los temas son increíblemente flexibles y fáciles de personalizar. He podido crear una tienda única que refleja perfectamente mi marca.',
    author: 'MarketPro',
    deviceImage: 'https://images.unsplash.com/photo-1741087562365-d0bf6e6fd7ef?q=80&w=1974&auto=format&fit=crop',
    deviceTitle: 'MODA',
    backgroundColor: 'bg-emerald-50',
  },
  {
    id: 3,
    quote:
      'El soporte técnico es excepcional. Siempre están disponibles para ayudar con cualquier problema o duda que pueda surgir.',
    author: 'DigitalStore',
    deviceImage: 'https://images.unsplash.com/photo-1740953794738-5cc7f8588d1e?q=80&w=1935&auto=format&fit=crop',
    deviceTitle: 'MODA',
    backgroundColor: 'bg-amber-50',
  },
  {
    id: 4,
    quote:
      'La calidad del código es impresionante. Como desarrollador, aprecio la limpieza y la estructura bien organizada de estos temas.',
    author: 'CodeMaster',
    deviceImage: 'https://images.unsplash.com/photo-1740873760959-7adae1502ea3?q=80&w=1936&auto=format&fit=crop',
    deviceTitle: 'MODA',
    backgroundColor: 'bg-rose-50',
  },
  {
    id: 5,
    quote:
      'Desde que cambié a este tema, mis conversiones han aumentado significativamente. La experiencia de usuario es excelente.',
    author: 'GrowthHacker',
    deviceImage: 'https://images.unsplash.com/photo-1735323694299-e23e3a49e71a?q=80&w=1974&auto=format&fit=crop',
    deviceTitle: 'MODA',
    backgroundColor: 'bg-purple-50',
  },
  {
    id: 6,
    quote:
      'La integración con todas las funciones de Shopify es perfecta. Todo funciona sin problemas desde el primer día.',
    author: 'ShopOwner',
    deviceImage: 'https://images.unsplash.com/photo-1732813963186-f03b882873e6?q=80&w=1974&auto=format&fit=crop',
    deviceTitle: 'MODA',
    backgroundColor: 'bg-cyan-50',
  },
];

export function TestimonialSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [bgColor, setBgColor] = useState(testimonials[0].backgroundColor);

  const totalSlides = testimonials.length;

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    const nextIndex = (currentSlide + 1) % totalSlides;
    setCurrentSlide(nextIndex);
    setBgColor(testimonials[nextIndex].backgroundColor);

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [totalSlides, isTransitioning, currentSlide]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
    setCurrentSlide(prevIndex);
    setBgColor(testimonials[prevIndex].backgroundColor);

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [totalSlides, isTransitioning, currentSlide]);

  // Auto-play functionality
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isAutoPlaying) {
      intervalId = setInterval(() => {
        nextSlide();
      }, 5000); // Change slide every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoPlaying, nextSlide]);

  // Pause auto-play when user interacts with controls
  const handleManualNavigation = (callback: () => void) => {
    setIsAutoPlaying(false); // Pause auto-play
    callback();

    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  // Direct navigation to a specific slide
  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;

    setIsTransitioning(true);
    setCurrentSlide(index);
    // Update background color when directly navigating to a slide
    setBgColor(testimonials[index].backgroundColor);
    setIsAutoPlaying(false);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);

    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  return (
    <div
      className={cn('py-12 px-4 md:px-8 transition-colors duration-500 ease-in-out', bgColor)}
      style={{ minHeight: '750px' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Testimonial content */}
          <div className="space-y-6">
            <div className="relative overflow-hidden min-h-[210px]">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={cn(
                    'space-y-4 absolute w-full transition-all duration-500 ease-in-out',
                    index === currentSlide
                      ? 'opacity-100 translate-x-0'
                      : index < currentSlide
                        ? 'opacity-0 -translate-x-full'
                        : 'opacity-0 translate-x-full'
                  )}
                  aria-hidden={index !== currentSlide}>
                  <div className="text-4xl font-serif">"</div>
                  <blockquote className="text-xl md:text-2xl font-medium">{testimonial.quote}</blockquote>
                  <footer className="flex items-center gap-2">
                    <span className="text-muted-foreground">—</span>
                    <span className="font-medium">{testimonial.author}</span>
                  </footer>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleManualNavigation(prevSlide)}
                aria-label="Previous testimonial"
                disabled={isTransitioning}
                className="hover:bg-transparent">
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{currentSlide + 1}</span>
                <span className="text-sm text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">{totalSlides}</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleManualNavigation(nextSlide)}
                aria-label="Next testimonial"
                disabled={isTransitioning}
                className="hover:bg-transparent">
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Device mockup - simplified to only show images */}
          <div className="relative mx-auto max-w-[300px]">
            <div className="relative rounded-[2rem] border-8 border-black overflow-hidden h-[600px] w-[300px] shadow-xl">
              {/* Content area with only images */}
              <div className="relative h-[calc(100%)]">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={`device-${testimonial.id}`}
                    className={cn(
                      'absolute inset-0 transition-all duration-500 ease-in-out',
                      index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                    )}>
                    <div className="relative h-full">
                      <div className="relative h-[calc(100%)]">
                        <Image
                          src={testimonial.deviceImage || '/placeholder.svg'}
                          alt={`${testimonial.author} device preview`}
                          fill
                          className="object-cover"
                          priority={index === currentSlide}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-black rounded-t-full"></div>
          </div>
        </div>
      </div>

      {/* Bottom navigation dots for quick slide access */}
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index === currentSlide ? 'bg-gray-900 w-4' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            )}
            onClick={() => goToSlide(index)}
            aria-label={`Go to testimonial ${index + 1}`}
            aria-current={index === currentSlide ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  );
}
