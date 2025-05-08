'use client'

import { useEffect } from 'react'
import { StoreSelector } from '@/app/(setup-layout)/my-store/components/StoreSelector'
import { BackgroundGradientAnimation } from '@/app/(setup-layout)/first-steps/components/BackgroundGradientAnimation'

export default function MyStorePage() {
  useEffect(() => {
    document.title = 'Mis tiendas • Fasttify'
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 z-0 sm:block hidden">
        <BackgroundGradientAnimation />
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <StoreSelector />
      </div>
    </div>
  )
}
