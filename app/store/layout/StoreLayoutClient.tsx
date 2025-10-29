'use client';

import { PolarisLayout } from '@/app/store/components/sidebar/components/PolarisLayout';
import { ToastProvider } from '@/app/store/context/ToastContext';
import { useStore } from '@/app/store/hooks/data/useStore/useStore';
import { getStoreId } from '@/utils/client/store-utils';
import { useAuthInitializer } from '@/hooks/auth/useAuthInitializer';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import esTranslations from '@shopify/polaris/locales/es.json';
import { Amplify } from 'aws-amplify';
import { useParams, usePathname } from 'next/navigation';
import { ChatProvider } from '@/app/store/components/ai-chat/context/ChatContext';
import { ConversationProvider } from '@/app/store/components/ai-chat/context/ConversationContext';

import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs);
const existingConfig = Amplify.getConfig();
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
});

export const StoreLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const params = useParams();
  const storeId = getStoreId(params, pathname);

  useAuthInitializer();
  useStore(storeId);

  const hideSidebar =
    pathname.includes('/editor') ||
    pathname.includes('/profile') ||
    pathname.includes('/suscribe/select-plan') ||
    pathname.includes('/studio');
  const isCheckoutPage = pathname.includes('/access_account/checkout');
  const isSelectPlanPage = pathname.includes('/suscribe/select-plan');

  return (
    <AppProvider i18n={esTranslations}>
      <ToastProvider>
        <ChatProvider>
          <ConversationProvider>
            {hideSidebar ? (
              isSelectPlanPage ? (
                <div className="min-h-screen w-full overflow-auto">{children}</div>
              ) : (
                <div className="h-screen w-full overflow-hidden">{children}</div>
              )
            ) : isCheckoutPage ? (
              <div className="relative">
                {/* Layout completo con blur - Sidebar, TopBar y contenido */}
                <div className="pointer-events-none" style={{ filter: 'blur(5px)' }}>
                  <PolarisLayout storeId={storeId}>
                    <div className="rounded-lg shadow p-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Panel de Administración</h1>
                      <p className="text-gray-600 mb-4">
                        Este contenido está bloqueado hasta que renueves tu suscripción
                      </p>
                    </div>
                  </PolarisLayout>
                </div>
                {/* Modal de checkout superpuesto */}
                {children}
              </div>
            ) : (
              <PolarisLayout storeId={storeId}>{children}</PolarisLayout>
            )}
          </ConversationProvider>
        </ChatProvider>
      </ToastProvider>
    </AppProvider>
  );
};
