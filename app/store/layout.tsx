import { StoreLayoutClient } from '@/app/store/config/StoreLayoutClient'

export const metadata = {
  title: 'Mi tienda',
  description: 'Dashboard de tu tienda en Fasttify',
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <StoreLayoutClient>{children}</StoreLayoutClient>
}
