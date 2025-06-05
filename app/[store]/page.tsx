'use client'

import { useParams } from 'next/navigation'

export default function StorePage() {
  const params = useParams()
  const store = params.store

  return (
    <div>
      <h1>Tienda: {store}</h1>
    </div>
  )
}
