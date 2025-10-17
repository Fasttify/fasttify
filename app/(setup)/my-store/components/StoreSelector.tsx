'use client';

import { useState, Suspense, useEffect } from 'react';
import { Page, Layout, Spinner } from '@shopify/polaris';
import Image from 'next/image';
import { useUserStores } from '@/app/(setup)/my-store/hooks/useUserStores';
import { routes } from '@/utils/client/routes';
import useAuthStore from '@/context/core/userStore';
import { UserMenu } from './UserMenu';
import { StoreListHeader } from './StoreListHeader';
import { StoreFilters } from './StoreFilters';
import { StoreList } from './StoreList';

function StoreError({ message }: { message: string }) {
  return (
    <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px' }}>{message}</div>
  );
}

// Componente que carga los datos con Suspense
function StoreData({
  userId,
  userPlan,
  isLoading,
  selectedTab,
  setSelectedTab,
}: {
  userId: string | null;
  userPlan?: string;
  isLoading: boolean;
  selectedTab: number;
  setSelectedTab: (tab: number) => void;
}) {
  const result = useUserStores(userId, userPlan);
  const { activeStores, inactiveStores, canCreateStore, error } = result;

  const currentStores = selectedTab === 0 ? activeStores : inactiveStores;

  const handleStoreSelect = (storeId: string) => {
    window.location.href = routes.store.dashboard.main(storeId);
  };

  const handleCreateStore = () => {
    window.location.href = '/first-steps';
  };

  // Si está cargando la autenticación, mostrar spinner
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return <StoreError message="Hubo un error al cargar tus tiendas. Por favor, intenta de nuevo." />;
  }

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <StoreListHeader canCreateStore={canCreateStore} onCreateStore={handleCreateStore} />
          <StoreFilters selected={selectedTab} onSelect={setSelectedTab} />
          <StoreList
            stores={currentStores}
            onStoreSelect={handleStoreSelect}
            canCreateStore={canCreateStore}
            onCreateStore={handleCreateStore}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

// Componente principal
export function StoreSelector() {
  const { user, loading: isLoading } = useAuthStore();
  const cognitoUsername = user?.userId;
  const userPlan = user?.plan;
  const [selectedTab, setSelectedTab] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="w-full max-w-[483px] mx-auto h-screen md:h-auto">
      {/* Card principal con todo el contenido - responsive */}
      <div className="bg-transparent rounded-none shadow-none min-h-screen p-4 md:bg-white md:rounded-xl md:shadow-lg md:min-h-[750px] md:p-8">
        {/* Header con logo y UserMenu dentro de la card */}
        <div className="flex justify-between items-center mb-6 px-4 md:mb-8 md:px-0">
          <div className="flex items-center gap-2">
            <Image
              src="https://cdn.fasttify.com/assets/b/fast@4x.webp"
              alt="Fasttify"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <Image
              src="https://cdn.fasttify.com/assets/b/fastletras@4x.webp"
              alt="Fasttify"
              width={100}
              height={32}
              className="h-8 w-auto"
            />
          </div>
          <UserMenu user={user} onLogout={() => useAuthStore.getState().logout()} />
        </div>

        {/* Contenido principal con un solo Suspense */}
        {!isClient ? (
          <div className="flex justify-center items-center h-96">
            <Spinner size="large" />
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-96">
                <Spinner size="large" />
              </div>
            }>
            <StoreData
              userId={cognitoUsername || null}
              userPlan={userPlan}
              isLoading={isLoading}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
