'use client';

import { PolarisLayout } from '@/app/store/components/sidebar/components/PolarisLayout';
import { ToastProvider } from '@/app/store/context/ToastContext';
import { useStore } from '@/app/store/hooks/data/useStore';
import { getStoreId } from '@/utils/client/store-utils';
import { useAuthInitializer } from '@/hooks/auth/useAuthInitializer';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import esTranslations from '@shopify/polaris/locales/es.json';
import { Amplify } from 'aws-amplify';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';

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

  const [prefersReducedMotion, _setPrefersReducedMotion] = useState(false);

  return (
    <AppProvider i18n={esTranslations}>
      <ToastProvider>
        <PolarisLayout storeId={storeId} prefersReducedMotion={prefersReducedMotion}>
          {children}
        </PolarisLayout>
      </ToastProvider>
    </AppProvider>
  );
};
