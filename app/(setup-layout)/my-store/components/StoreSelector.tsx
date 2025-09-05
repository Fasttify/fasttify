'use client';

import { getUserStores } from '@/app/(setup-layout)/my-store/hooks/useUserStores';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/context/hooks/useAuth';
import { routes } from '@/utils/client/routes';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function StoreError({ message }: { message: string }) {
  return <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm">{message}</div>;
}

// Componente para mostrar la lista de tiendas
function StoreList({ stores, canCreateStore }: { stores: any[]; canCreateStore: boolean }) {
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-2 max-h-[40vh] overflow-y-auto px-1 py-2 rounded-lg">
          {stores.length > 0 ? (
            // Stores list
            stores.map((store, index) => (
              <motion.div
                key={store.storeId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-2 last:mb-0">
                <button
                  onClick={() => {
                    window.location.href = routes.store.dashboard.main(store.storeId);
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors border border-gray-100 shadow-sm"
                  aria-label={`Seleccionar tienda ${store.storeName}`}>
                  <Avatar className="h-12 w-12 rounded-xl">
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 text-black text-lg">
                      {getInitials(store.storeName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-base font-medium text-gray-900 truncate">{store.storeName}</p>
                    <p className="text-xs text-gray-500 truncate">{store.storeType}</p>
                  </div>
                </button>
              </motion.div>
            ))
          ) : (
            // No stores state
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
              <div className="flex flex-col items-center gap-2">
                <PlusCircle className="h-10 w-10 text-gray-300" />
                <p>No tienes tiendas configuradas aún</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {canCreateStore ? (
          <Link href="/first-steps">
            <Button variant="outline" className="w-full justify-start py-6 text-base">
              <PlusCircle className="mr-2 h-5 w-5" />
              Crear nueva tienda
            </Button>
          </Link>
        ) : (
          stores.length > 0 && (
            <div className="p-3 bg-amber-50 text-amber-700 rounded-lg text-xs sm:text-sm">
              Has alcanzado el límite máximo de tiendas para tu plan actual
            </div>
          )
        )}
      </motion.div>
    </>
  );
}

// Componente que carga los datos con Suspense
function StoreData({ userId, userPlan }: { userId: string | null; userPlan?: string }) {
  // Obtenemos los datos directamente
  const result = getUserStores(userId, userPlan);
  const {
    stores = [],
    canCreateStore = false,
    error,
  } = result as { stores: unknown[]; canCreateStore: boolean; error?: string };

  if (error) {
    return <StoreError message="Hubo un error al cargar tus tiendas. Por favor, intenta de nuevo." />;
  }

  return <StoreList stores={stores} canCreateStore={canCreateStore} />;
}

// Componente principal
export function StoreSelector() {
  const { user, loading: isLoading } = useAuth();
  const cognitoUsername = user?.userId;
  const userPlan = user?.plan;

  if (isLoading) {
    return (
      <Loader
        size="large"
        color="black"
        centered
        text="Cargando tus tiendas..."
        className="bg-gray-50 p-6 rounded-xl shadow-sm"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto p-4 sm:p-6 space-y-5 bg-white rounded-xl shadow-lg">
      <div className="text-center space-y-2">
        <Image
          src="https://cdn.fasttify.com/assets/b/fast@4x.webp"
          alt="Logo"
          width={100}
          height={32}
          className="h-8 w-auto mx-auto"
        />
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Selecciona una tienda</h1>
        <p className="text-xs sm:text-sm text-gray-500">para continuar a tu dashboard</p>
      </div>

      <Suspense
        fallback={
          <Loader
            size="large"
            color="black"
            centered
            text="Cargando tus tiendas..."
            className="bg-gray-50 p-6 rounded-xl shadow-sm"
          />
        }>
        <StoreData userId={cognitoUsername || null} userPlan={userPlan} />
      </Suspense>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center gap-6 text-xs sm:text-sm pt-2">
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
  );
}
