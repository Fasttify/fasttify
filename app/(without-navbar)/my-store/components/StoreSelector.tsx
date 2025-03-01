import Image from 'next/image'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { useUserStores } from '@/app/(without-navbar)/my-store/hooks/useUserStores'
import { useAuthUser } from '@/hooks/auth/useAuthUser'
import { motion, AnimatePresence } from 'framer-motion'
import { useStoreLimit } from '@/app/(without-navbar)/my-store/hooks/useStoreLimit'
import { routes } from '@/utils/routes'

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
  const cognitoUsername = userData?.['cognito:username']
  const userPlan = userData?.['custom:plan']
  const { stores, loading } = useUserStores(cognitoUsername)
  const { canCreateStore } = useStoreLimit(cognitoUsername, userPlan)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto p-6 space-y-6 bg-white rounded-xl shadow-lg"
    >
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

      <AnimatePresence mode="wait">
        <motion.div
          key={loading ? 'loading' : 'content'}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          {stores.map((store, index) => (
            <motion.div
              key={store.storeId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={routes.store.dashboard(store.storeId)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 text-black">
                    {getInitials(store.storeName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{store.storeName}</p>
                  <p className="text-sm text-gray-500 truncate">{store.storeType}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {canCreateStore ? (
          <Link href="/first-steps">
            <Button variant="outline" className="w-full justify-start">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear nueva tienda
            </Button>
          </Link>
        ) : (
          stores.length > 0 && (
            <p className="text-sm text-gray-500 text-center">
              Has alcanzado el límite máximo de tiendas para tu plan actual
            </p>
          )
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-start gap-4 text-sm"
      >
        <Link href="/help" className="text-gray-500 hover:text-gray-700">
          Ayuda
        </Link>
        <Link href="/privacy" className="text-gray-500 hover:text-gray-700">
          Privacidad
        </Link>
        <Link href="/terms" className="text-gray-500 hover:text-gray-700">
          Términos
        </Link>
      </motion.div>
    </motion.div>
  )
}
