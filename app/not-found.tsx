'use client';

import AnimatedGradientBackground from '@/components/ui/animated-gradient-background';
import notFound from '@/app/(main-layout)/account-settings/anim/not-found.json';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function NotFound() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Gradient Background */}
      <AnimatedGradientBackground />

      <div className="relative z-10 flex flex-col items-center justify-start h-full px-4 pt-32 text-center">
        <div>
          <Lottie animationData={notFound} loop autoplay />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-white md:text-3xl">Página 404: El contenido no existe.</h1>
        <p className="mt-4 text-lg text-gray-300 md:text-xl max-w-lg">
          Lo sentimos, pero la página que estás buscando no se encuentra disponible.
        </p>
        <Link
          href="/"
          className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all duration-300 border border-white/20">
          Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
