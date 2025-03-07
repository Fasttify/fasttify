import type React from 'react'
import { forwardRef, useRef } from 'react'
import Image from 'next/image'

import { cn } from '@/lib/utils'
import { AnimatedBeam } from '@/components/ui/animated-beam'

const Circle = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'z-10 flex size-12 items-center justify-center rounded-full border-2 border-border bg-white p-1 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]',
          className
        )}
      >
        {children}
      </div>
    )
  }
)

Circle.displayName = 'Circle'

export function MarqueeLogos({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const div1Ref = useRef<HTMLDivElement>(null)
  const div2Ref = useRef<HTMLDivElement>(null)
  const div3Ref = useRef<HTMLDivElement>(null)
  const div4Ref = useRef<HTMLDivElement>(null)
  const div5Ref = useRef<HTMLDivElement>(null)
  const div6Ref = useRef<HTMLDivElement>(null)
  const div7Ref = useRef<HTMLDivElement>(null)

  return (
    <div className="flex w-full flex-col items-center justify-center gap-10 p-6 lg:flex-row lg:items-center lg:justify-center lg:p-10 lg:gap-96 max-w-full mx-auto">
      <div className="flex max-w-xl flex-col gap-6 pt-10 text-black">
        <h2 className="text-3xl md:text-4xl font-medium">Gestiona tu negocio en un solo lugar</h2>
        <p className="text-lg font-medium sm:text-xl">
          Fasttify simplifica la venta en línea. Desde pagos hasta integración con proveedores, todo
          en una sola plataforma fácil de usar.
        </p>
        <p className="text-gray-600">
          Con soporte para Mercado Pago, Wompi y más, Fasttify te permite gestionar suscripciones,
          cobros y automatizar pedidos sin complicaciones.
          <br />— Concéntrate en hacer crecer tu negocio, nosotros nos encargamos de la tecnología.
        </p>
      </div>

      <div
        className={cn(
          'relative h-[400px] w-full max-w-lg items-center justify-center overflow-hidden lg:h-[500px]',
          className
        )}
        ref={containerRef}
      >
        <div className="flex size-full flex-row items-stretch justify-between gap-6 sm:gap-10">
          <div className="flex flex-col justify-center gap-2">
            <Circle ref={div1Ref}>
              <Image
                src="/icons/strapi-icon.webp"
                alt="Strapi"
                width={30}
                height={30}
                className="object-contain"
              />
            </Circle>
            <Circle ref={div2Ref}>
              <Image src="/icons/wompi.webp" alt="Google Docs" width={48} height={48} />
            </Circle>
            <Circle ref={div3Ref}>
              <Image src="/icons/mercadopago-logo.webp" alt="mercadopago" width={50} height={50} />
            </Circle>
            <Circle ref={div4Ref}>
              <Image
                src="/placeholder.svg?height=48&width=48"
                alt="Messenger"
                width={48}
                height={48}
              />
            </Circle>
            <Circle ref={div5Ref}>
              <Image
                src="/placeholder.svg?height=48&width=48"
                alt="Notion"
                width={48}
                height={48}
              />
            </Circle>
          </div>
          <div className="flex flex-col justify-center">
            <Circle ref={div6Ref} className="size-16">
              <Image src="/icons/fast@4x.webp" alt="Fasttify" width={40} height={40} />
            </Circle>
          </div>
          <div className="flex flex-col justify-center">
            <Circle ref={div7Ref}>
              <Image src="/icons/store.webp" alt="Store" width={30} height={30} />
            </Circle>
          </div>
        </div>

        <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div6Ref} />
        <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div6Ref} />
        <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={div6Ref} />
        <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div6Ref} />
        <AnimatedBeam containerRef={containerRef} fromRef={div5Ref} toRef={div6Ref} />
        <AnimatedBeam containerRef={containerRef} fromRef={div6Ref} toRef={div7Ref} />
      </div>
    </div>
  )
}
