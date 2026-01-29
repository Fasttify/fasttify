'use client';

import { useEffect, useState } from 'react';

interface AnimatedBackgroundProps {
  minWidth?: string;
  backgroundColor?: string;
  shapeColor1?: string;
  shapeColor2?: string;
  containerClassName?: string;
  isModal?: boolean;
}

export function AnimatedBackground({
  minWidth = '1024px',
  backgroundColor = 'rgba(20, 20, 20, 1)',
  shapeColor1 = 'rgba(142, 123, 255, 1)',
  shapeColor2 = 'rgba(68, 242, 235, 1)',
  containerClassName = '',
  isModal = false,
}: AnimatedBackgroundProps) {
  const [shouldRender, setShouldRender] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.matchMedia(`(min-width: ${minWidth})`).matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${minWidth})`);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldRender(e.matches);
    };

    // Sincronizar al cambiar el minWidth, evitando actualización sincrónica
    const raf = requestAnimationFrame(() => setShouldRender(mediaQuery.matches));

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      cancelAnimationFrame(raf);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [minWidth]);

  if (!shouldRender) {
    return null;
  }

  return (
    <>
      <style jsx>{`
        .animated-wrapper {
          --background-color: ${backgroundColor};
          --shape-color-1: ${shapeColor1};
          --shape-color-2: ${shapeColor2};
          --gradient-background-animation-duration: 20s;
        }

        @keyframes gradient-shape-animation1 {
          0% {
            transform: translate(-30%, 40%) rotate(-20deg);
          }
          25% {
            transform: translateY(20%) skew(-15deg, -15deg) rotate(80deg);
          }
          50% {
            transform: translate(30%, -10%) rotate(180deg);
          }
          75% {
            transform: translate(-30%, 40%) skew(15deg, 15deg) rotate(240deg);
          }
          to {
            transform: translate(-30%, 40%) rotate(-20deg);
          }
        }

        @keyframes gradient-shape-animation2 {
          0% {
            transform: translate(20%, -40%) rotate(-20deg);
          }
          20% {
            transform: translate(0) skew(-15deg, -15deg) rotate(80deg);
          }
          40% {
            transform: translate(-40%, 50%) rotate(180deg);
          }
          60% {
            transform: translate(-20%, -20%) skew(15deg, 15deg) rotate(80deg);
          }
          80% {
            transform: translate(10%, -30%) rotate(180deg);
          }
          to {
            transform: translate(20%, -40%) rotate(340deg);
          }
        }

        .animated-wrapper {
          position: ${isModal ? 'absolute' : 'fixed'};
          top: 0;
          left: 0;
          overflow: hidden;
          width: 100%;
          height: 100%;
          background: var(--background-color);
          z-index: ${isModal ? '1' : '-1'};
          border-radius: ${isModal ? '1rem' : '0'};
        }

        .shape-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          filter: blur(15.625rem);
          transform: translateZ(0);
          display: block;
        }

        .shape {
          mix-blend-mode: lighten;
          animation-duration: var(--gradient-background-animation-duration);
          position: absolute;
          border-radius: 50%;
          animation-iteration-count: infinite;
          animation-timing-function: cubic-bezier(0.1, 0, 0.9, 1);
        }

        .shape:nth-of-type(1) {
          bottom: 0;
          left: 0;
          width: 43.75rem;
          height: 43.75rem;
          background: var(--shape-color-1);
          mix-blend-mode: lighten;
          transform: translate(-30%, 40%);
          animation-name: gradient-shape-animation1;
        }

        .shape:nth-of-type(2) {
          top: 0;
          right: 0;
          width: 37.5rem;
          height: 37.5rem;
          background: var(--shape-color-2);
          transform: translate(20%, -40%);
          animation-name: gradient-shape-animation2;
        }

        .noise {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: 6.25rem;
          background-image: url('https://cdn.fasttify.com/assets/b/noise.avif');
        }

        @media (prefers-reduced-motion: reduce) {
          .shape:nth-of-type(1) {
            animation-name: none;
          }
          .shape:nth-of-type(2) {
            animation-name: none;
          }
        }

        @-moz-document url-prefix() {
          .animated-wrapper {
            background-image: url('https://cdn.fasttify.com/assets/b/gradient-background.png');
            background-size: cover;
          }
          .shape-container,
          .noise {
            display: none;
          }
        }

        @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
          .animated-wrapper {
            background-image: url('https://cdn.fasttify.com/assets/b/gradient-background.png');
            background-size: cover;
          }
          .shape-container,
          .noise {
            display: none;
          }
        }
      `}</style>

      <div className={`animated-wrapper ${containerClassName}`}>
        <div className="shape-container">
          <div className="shape"></div>
          <div className="shape"></div>
        </div>
        <div className="noise"></div>
      </div>
    </>
  );
}
