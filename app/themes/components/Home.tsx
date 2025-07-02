import { Button } from '@/components/ui/button';
import { ThemeCard } from '@/app/themes/components/ThemeCard';
import { TestimonialSlider } from '@/app/themes/components/TestimonialSlider';
import { popularThemes, newThemes } from '@/app/themes/data/themesData';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Home() {
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls down 300px
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to scroll back to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <main className="min-h-screen">
      {/* Back Button */}
      <div className="container px-4 md:px-6 pt-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2 mb-4 hover:bg-gray-100"
          onClick={() => router.back()}>
          <ArrowLeft size={16} />
          Volver atrás
        </Button>
      </div>

      {/* Back to Top Button */}
      {showScrollTop && (
        <Button
          variant="outline"
          className="fixed bottom-6 right-6 z-50 rounded-full p-3 shadow-md bg-white hover:bg-gray-100"
          onClick={scrollToTop}
          aria-label="Volver arriba">
          <ArrowUp size={20} />
        </Button>
      )}

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-start gap-4 md:gap-8">
            <div className="max-w-4xl space-y-4">
              <h1 className="text-4xl text-gray-900 font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Encuentra la mejor plantilla para tu tienda en Fasttify
              </h1>
              <p className="text-xl text-black">
                Explora diseños optimizados para vender más y personalízalos a tu gusto.
              </p>
            </div>
            <Button className="rounded-full bg-black text-white hover:bg-black/90">Descubrir plantillas</Button>
          </div>
        </div>
      </section>

      {/* Popular Themes Section */}
      <section className="w-full py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tighter">Plantillas más vendidas</h2>
            <p className="text-gray-600 mt-2">
              Diseños modernos y actualizados para potenciar tu tienda online en Fasttify.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {popularThemes.map((theme, index) => (
              <ThemeCard key={index} {...theme} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="w-ful">
        <TestimonialSlider />
      </section>

      {/* New Themes Section */}
      <section className="w-full py-12">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter">Novedades en Fasttify</h2>
              <p className="text-muted-foreground mt-2">
                Descubre las últimas plantillas disponibles para impulsar tu tienda.
              </p>
            </div>
            <Button variant="outline" className="rounded-full">
              Ver más plantillas
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {newThemes.map((theme, index) => (
              <ThemeCard key={index} {...theme} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 border-t">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter mb-6">Potencia tu tienda con Fasttify</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg">
                  Diseños optimizados <span className="text-muted-foreground">— rápidos, seguros y adaptables</span>
                </h3>
                <p className="text-muted-foreground underline">proceso de pago de mejor conversión del mundo</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Todo lo esencial{' '}
                  <span className="text-muted-foreground">—recomendaciones de productos, reseñas, descuentos y</span>
                </h3>
                <p className="text-muted-foreground underline">mucho más</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Herramientas avanzadas{' '}
                  <span className="text-muted-foreground">— asistencia experta cuando la necesites</span>
                </h3>
                <p className="text-muted-foreground underline">actualizaciones gratis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="w-full py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tighter">Cientos de temas, millones de comerciantes</h2>
            <p className="text-muted-foreground mt-2">
              Los temas de Shopify se ajustan a cualquier tipo y tamaño de negocio, incluido el tuyo
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {newThemes.map((theme, index) => (
              <ThemeCard key={index} {...theme} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
