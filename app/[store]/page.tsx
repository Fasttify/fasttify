'use client'

import { useParams } from 'next/navigation'

export default function StorePage() {
  const params = useParams()
  const store = (params.store as string) || undefined

  if (!store) {
    return <div>No se encontró la tienda</div>
  }

  return (
    <div>
      <h1>Tienda: {store}</h1>
    </div>
  )
}
