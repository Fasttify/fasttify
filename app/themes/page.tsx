'use client'

import { Home } from '@/app/themes/components/Home'
import { useEffect } from 'react'

export default function HomePage() {
  useEffect(() => {
    document.title = 'Temas • Fasttify'
  }, [])

  return <Home />
}
