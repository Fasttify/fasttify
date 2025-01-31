"use client";

import { useEffect, useRef, useState } from "react";

interface TextRevealProps {
  children: string;
  className?: string;
}

export function TextReveal({ children, className = "" }: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollProgress =
        window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight);
      // Aplicamos una función de suavizado para hacer la transición más gradual
      const smoothProgress = Math.pow(scrollProgress, 2); // Puedes ajustar el exponente para cambiar la curva
      setProgress(Math.min(Math.max(smoothProgress, 0), 1));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Comprueba la posición inicial

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className={`fixed ${className}`}>
      <div className="relative">
        {/* Capa de texto gris (fondo) */}
        <span className="block text-gray-500">{children}</span>

        {/* Capa de texto blanco (revelado) */}
        <span
          className="absolute inset-0 overflow-hidden text-white"
          style={{
            clipPath: `inset(0 ${100 - progress * 100}% 0 0)`,
            transition: "clip-path 0.1s ease-out",
          }}
        >
          {children}
        </span>
      </div>
    </div>
  );
}
