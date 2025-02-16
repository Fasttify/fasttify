'use client'

import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Paintbrush, Layers, Palette, Wand2 } from 'lucide-react'

type Theme = 'simple' | 'playful' | 'elegant' | 'brutalist'

const themes: Record<
  Theme,
  {
    cardClass: string
    buttonClass: string
    textClass: string
    image: string
    layout: {
      image: string
      title: string
      price: string
      sizes: string
      buttons: string
    }
  }
> = {
  simple: {
    cardClass: 'bg-white border border-gray-200 shadow-sm',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    textClass: 'text-gray-900',
    image: '/imgs/landing/tenis.webp',
    layout: {
      image: 'col-span-2 row-span-3 md:col-span-2 md:row-span-3',
      title: 'col-span-2 md:col-span-3 md:col-start-3 row-start-1',
      price: 'col-span-2 md:col-span-3 md:col-start-3 row-start-2',
      sizes: 'col-span-4 md:col-span-3 md:col-start-3 row-start-3',
      buttons: 'col-span-4 md:col-span-3 md:col-start-3 row-start-4',
    },
  },
  playful: {
    cardClass: 'bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 border-none shadow-lg',
    buttonClass:
      'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md',
    textClass: 'text-gray-800',
    image: '/imgs/landing/tacones.webp',
    layout: {
      image: 'col-span-4 md:col-span-2 md:col-start-4 row-span-3',
      title: 'col-span-4 md:col-span-3 row-start-3 md:row-start-1',
      price: 'col-span-4 md:col-span-3 row-start-4 md:row-start-2',
      sizes: 'col-span-4 md:col-span-3 row-start-5 md:row-start-3',
      buttons: 'col-span-4 md:col-span-3 row-start-6 md:row-start-4',
    },
  },
  elegant: {
    cardClass: 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-xl',
    buttonClass: 'bg-white hover:bg-gray-100 text-gray-900 shadow-sm',
    textClass: 'text-white',
    image: '/imgs/landing/traje.webp',
    layout: {
      image: 'col-span-4 md:col-span-2 md:col-start-4 row-span-3',
      title: 'col-span-4 md:col-span-3 row-start-3 md:row-start-1',
      price: 'col-span-4 md:col-span-3 row-start-4 md:row-start-2',
      sizes: 'col-span-4 md:col-span-3 row-start-5 md:row-start-3',
      buttons: 'col-span-4 md:col-span-3 row-start-6 md:row-start-4',
    },
  },
  brutalist: {
    cardClass: 'bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    buttonClass:
      'bg-black hover:bg-gray-900 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
    textClass: 'text-black font-mono',
    image: '/imgs/landing/tenis-verdes.webp',
    layout: {
      image: 'col-span-4 md:col-span-3 row-span-3',
      title: 'col-span-4 md:col-span-2 md:col-start-4 row-start-3 md:row-start-1',
      price: 'col-span-4 md:col-span-2 md:col-start-4 row-start-4 md:row-start-2',
      sizes: 'col-span-4 md:col-span-2 md:col-start-4 row-start-5 md:row-start-3',
      buttons: 'col-span-4 md:col-span-2 row-start-6 md:row-start-4 md:col-start-4',
    },
  },
}

const features = [
  {
    icon: Paintbrush,
    title: 'Personalización Total',
    description: 'Adapta cada aspecto de tu tienda a tu marca y estilo único.',
  },
  {
    icon: Layers,
    title: 'Temas Dinámicos',
    description:
      'Cambia entre diferentes estilos con un solo clic para encontrar tu identidad perfecta.',
  },
  {
    icon: Palette,
    title: 'Diseño Flexible',
    description: 'Modifica colores, layouts y elementos para crear una experiencia única.',
  },
  {
    icon: Wand2,
    title: 'Experiencia Mágica',
    description: 'Transformaciones suaves y animadas para una experiencia de usuario excepcional.',
  },
]

export function Personalization() {
  const [activeTheme, setActiveTheme] = useState<Theme>('simple')

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left side - Platform information */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-normal text-center mb-8 md:mb-16">
                Personalización sin límites
              </h1>
              <p className="text-base md:text-lg text-gray-600">
                En nuestra plataforma, te brindamos las herramientas para crear una experiencia
                única y memorable para tus clientes.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="bg-primary/10 p-2 rounded-full">
                    <feature.icon className="w-5 h-5 md:w-6 md:h-6 " />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm md:text-base text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Interactive card */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-wrap gap-2 md:gap-3 justify-center bg-white p-3 md:p-4 rounded-lg shadow-sm"
            >
              {(Object.keys(themes) as Theme[]).map(theme => (
                <motion.div
                  key={theme}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={() => setActiveTheme(theme)}
                    variant={activeTheme === theme ? 'default' : 'outline'}
                    className={cn(
                      'capitalize px-4 md:px-6 py-2 transition-all duration-200 text-sm md:text-base',
                      activeTheme === theme && 'ring-2 ring-blue-500 ring-offset-2'
                    )}
                  >
                    {theme}
                  </Button>
                </motion.div>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTheme}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  ease: [0.43, 0.13, 0.23, 0.96],
                }}
              >
                <Card
                  className={cn(
                    'p-4 md:p-6 w-full transition-all duration-300 rounded-xl overflow-hidden',
                    themes[activeTheme].cardClass
                  )}
                >
                  <LayoutGroup>
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-4 md:gap-6 min-h-[500px] md:h-[600px]">
                      <motion.div
                        layout
                        className={cn(
                          'rounded-lg overflow-hidden',
                          themes[activeTheme].layout.image
                        )}
                      >
                        <motion.img
                          key={themes[activeTheme].image}
                          src={themes[activeTheme].image}
                          alt="Product"
                          className="w-full h-full object-cover rounded-lg"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.div>

                      <motion.div
                        layout
                        className={cn(
                          themes[activeTheme].layout.title,
                          'flex flex-col justify-center'
                        )}
                      >
                        <motion.h3
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className={cn(
                            'text-xl md:text-2xl font-bold mb-2 transition-colors',
                            themes[activeTheme].textClass
                          )}
                        >
                          Classic Utility Jacket
                        </motion.h3>
                        <motion.p
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className={cn(
                            'text-sm md:text-base opacity-90 transition-colors',
                            themes[activeTheme].textClass
                          )}
                        >
                          Versatile and stylish for any occasion
                        </motion.p>
                      </motion.div>

                      <motion.div
                        layout
                        className={cn('flex items-center', themes[activeTheme].layout.price)}
                      >
                        <motion.span
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                          className={cn(
                            'text-2xl md:text-3xl font-bold transition-colors',
                            themes[activeTheme].textClass
                          )}
                        >
                          $110.00
                        </motion.span>
                      </motion.div>

                      <motion.div
                        layout
                        className={cn(
                          'flex gap-1 md:gap-2 items-center',
                          themes[activeTheme].layout.sizes
                        )}
                      >
                        {['XS', 'S', 'M', 'L', 'XL'].map((size, index) => (
                          <motion.button
                            key={size}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.1 + index * 0.05,
                              ease: 'easeInOut',
                            }}
                            className={cn(
                              'flex-1 py-1.5 md:py-2 transition-all text-sm md:text-base',
                              themes[activeTheme].textClass,
                              'hover:scale-105',
                              'rounded-md',
                              'border-2',
                              'font-medium'
                            )}
                          >
                            {size}
                          </motion.button>
                        ))}
                      </motion.div>

                      <motion.div
                        layout
                        className={cn(
                          'flex gap-2 md:gap-4 items-center',
                          themes[activeTheme].layout.buttons
                        )}
                      >
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, delay: 0.4 }}
                          className="flex-1"
                        >
                          <Button
                            className={cn(
                              'w-full transition-all font-medium text-sm md:text-base py-4 md:py-6',
                              themes[activeTheme].buttonClass
                            )}
                          >
                            Buy now
                          </Button>
                        </motion.div>
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: 0.5 }}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full transition-all font-medium text-sm md:text-base py-4 md:py-6',
                              'border-2',
                              themes[activeTheme].textClass
                            )}
                          >
                            Add to bag
                          </Button>
                        </motion.div>
                      </motion.div>
                    </div>
                  </LayoutGroup>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
