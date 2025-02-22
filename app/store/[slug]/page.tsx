'use client'
import { useEffect } from 'react'
import DashboardPage from './dashboard/page'

export default function StorePage() {
  useEffect(() => {
    document.title = 'Mi tienda • Fasttify'
  }, [])

  return (
    <div>
      <DashboardPage />
    </div>
  )
}
