import { inter } from '@/config/fonts'
import '@/app/global.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Temas | Fasttify',
}

export default function ThemesLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
