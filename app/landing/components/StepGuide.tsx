'use client'

import { useState } from 'react'
import Image from 'next/image'

export function StepGuide() {
  const [activeStep, setActiveStep] = useState(1)

  const steps = [
    {
      number: '01',
      title: 'Agrega tu primer producto',
      images: [
        {
          main: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1470&auto=format&fit=crop',
          secondary:
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1415&auto=format&fit=crop',
          detail:
            'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1470&auto=format&fit=crop',
        },
      ],
    },
    {
      number: '02',
      title: 'Personaliza tu tienda',
      images: [
        {
          main: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1470&auto=format&fit=crop',
          secondary:
            'https://images.unsplash.com/photo-1487014679447-9f8336841d58?q=80&w=1466&auto=format&fit=crop',
          detail:
            'https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=1471&auto=format&fit=crop',
        },
      ],
    },
    {
      number: '03',
      title: 'Configura pagos',
      images: [
        {
          main: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1470&auto=format&fit=crop',
          secondary:
            'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1470&auto=format&fit=crop',
          detail:
            'https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=1470&auto=format&fit=crop',
        },
      ],
    },
  ]

  return (
    <div className="p-4 md:p-8 min-h-screenrounded-t-[32px]  ">
      <div className="min-h-0 text-black px-4 py-8 md:p-28">
        <div className="max-w-full mx-auto">
          <h1 className="text-5xl md:text-5xl font-normal text-center mb-8 md:mb-16">
            Es muy fácil comenzar a vender
          </h1>

          <div className="flex flex-col md:grid md:grid-cols-2 gap-8 items-start md:items-center">
            {/* Contenedor de las imágenes */}
            <div className="order-1 md:order-1 relative h-[400px] md:h-[500px] lg:h-[600px] w-full">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                    activeStep === index + 1 ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="grid grid-cols-3 gap-3 md:gap-4 h-full">
                    {/* Imagen principal */}
                    <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={step.images[0].main || '/placeholder.svg'}
                        alt={`${step.title} - Imagen Principal`}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    {/* Imagen secundaria */}
                    <div className="relative rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={step.images[0].secondary || '/placeholder.svg'}
                        alt={`${step.title} - Imagen Secundaria`}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    {/* Imagen de detalle */}
                    <div className="relative rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={step.images[0].detail || '/placeholder.svg'}
                        alt={`${step.title} - Imagen Detalle`}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contenedor de los pasos */}
            <div className="flex flex-col items-center space-y-6 px-12 sm:px-6 md:px-8">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`group cursor-pointer transition-all duration-300 w-full max-w-sm ${
                    activeStep === index + 1
                      ? 'opacity-100 scale-105'
                      : 'opacity-60 hover:opacity-80'
                  }`}
                  onMouseEnter={() => setActiveStep(index + 1)}
                  onClick={() => setActiveStep(index + 1)}
                >
                  <div className="flex flex-row items-center gap-4 mb-12">
                    <span className="text-primary font-medium w-8 text-center">{step.number}</span>
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal border-b border-transparent group-hover:border-gray-300 transition-colors pb-2 flex-grow">
                      {step.title}
                    </h2>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
