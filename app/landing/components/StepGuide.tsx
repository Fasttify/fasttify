"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function StepGuide() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      number: "01",
      title: "Agrega tu primer producto",
      images: [
        "https://images.unsplash.com/photo-1720048171419-b515a96a73b8?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1719937206498-b31844530a96?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
    },
    {
      number: "02",
      title: "Personaliza tu tienda",
      images: [
        "https://images.unsplash.com/photo-1605902711834-8b11c3e3ef2f?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1688561808434-886a6dd97b8c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
    },
    {
      number: "03",
      title: "Configura pagos",
      images: [
        "https://images.unsplash.com/photo-1556740772-1a741367b93e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1718010571964-bac048b9ded0?q=80&w=1970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
    },
  ];

  return (
    <div className="min-h-0 bg-white text-gray-800 px-4 py-8 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-center mb-8 md:mb-16">
          Es muy fácil comenzar a vender
        </h1>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-8 items-start md:items-center">
          {/* Contenedor de las imágenes */}
          <div className="order-1 md:order-1 relative h-[300px] md:h-[400px] lg:h-[500px] w-full">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  activeStep === index + 1 ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="grid grid-cols-2 gap-3 md:gap-4 h-full">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={step.images[0]}
                      alt={`${step.title} - Image 1`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden translate-y-6 md:translate-y-12 shadow-lg">
                    <img
                      src={step.images[1]}
                      alt={`${step.title} - Image 2`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contenedor de los pasos */}
          <div className="order-2 md:order-2 flex flex-col items-center md:place-items-stretch space-y-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`group cursor-pointer transition-colors w-full ${
                  activeStep === index + 1
                    ? "opacity-100"
                    : "opacity-60 hover:opacity-80"
                }`}
                onMouseEnter={() => setActiveStep(index + 1)}
                onClick={() => setActiveStep(index + 1)}
              >
                <div className="flex flex-row items-center justify-center md:justify-start gap-4 mb-2">
                  <span className="text-emerald-600 font-medium w-8">
                    {step.number}
                  </span>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-light border-b border-transparent group-hover:border-gray-300 transition-colors pb-2">
                    {step.title}
                  </h2>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full md:w-auto mt-8 text-emerald-600 border-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors rounded-full px-8"
            >
              Comienza ya
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
