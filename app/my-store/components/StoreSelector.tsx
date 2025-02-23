'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { useUserStores } from '@/app/my-store/hooks/useUserStores'
import { useAuthUser } from '@/hooks/auth/useAuthUser'

function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function StoreSelector() {
  const { userData } = useAuthUser()
  const cognitoUsername = userData?.['cognito:username'] || null
  const { stores } = useUserStores(cognitoUsername)

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6 bg-white rounded-xl shadow-lg">
      <div className="space-y-2">
        <Image
          src="/icons/fast@4x.webp"
          alt="Logo"
          width={100}
          height={32}
          className="h-8 w-auto"
        />
        <h1 className="text-2xl font-semibold text-gray-900">Selecciona una tienda</h1>
        <p className="text-sm text-gray-500">para continuar a tu dashboard</p>
      </div>

      <div className="space-y-2">
        {stores.map(store => (
          <Link
            key={store.storeId}
            href={`/store/${store.storeId}/dashboard`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(store.storeName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-9nuarruncate">{store.storeName}</p>
              <p className="text-sm text-gray-500 truncate">{store.storeType}</p>
            </div>
          </Link>
        ))}
      </div>

      <Link href="/first-steps">
        <Button variant="outline" className="w-full justify-start">
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear nueva tienda
        </Button>
      </Link>

      <div className="flex justify-start gap-4 text-sm">
        <Link href="/help" className="text-gray-500 hover:text-gray-700">
          Ayuda
        </Link>
        <Link href="/privacy" className="text-gray-500 hover:text-gray-700">
          Privacidad
        </Link>
        <Link href="/terms" className="text-gray-500 hover:text-gray-700">
          Términos
        </Link>
      </div>
    </div>
  )
}
