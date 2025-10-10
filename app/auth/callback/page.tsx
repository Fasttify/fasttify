'use client';

import { Amplify } from 'aws-amplify';
import { useAuth } from '@/context/hooks/useAuth';
import { getLastVisitedStoreClient } from '@/lib/cookies/last-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import outputs from '@/amplify_outputs.json';
import 'aws-amplify/auth/enable-oauth-listener';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

Amplify.configure(outputs);

const existingConfig = Amplify.getConfig();
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
});

export default function AuthCallbackPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', async ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          try {
            const currentUser = await getCurrentUser();
            const userAttributes = await fetchUserAttributes();

            console.log('OAuth sign in successful:', { currentUser, userAttributes });

            await refreshUser();

            const lastStoreId = getLastVisitedStoreClient();

            if (lastStoreId) {
              window.location.href = `/store/${lastStoreId}/home`;
            } else {
              window.location.href = '/my-store';
            }
          } catch (error) {
            console.error('Error completing OAuth sign in:', error);
            router.push('/login');
          }
          break;

        case 'signInWithRedirect_failure':
          console.error('OAuth sign in failed:', payload.data);
          router.push('/login');
          break;

        case 'customOAuthState':
          console.log('Custom OAuth state:', payload.data);
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [refreshUser, router]);

  useEffect(() => {
    if (!loading && user && !isRedirecting) {
      setIsRedirecting(true);

      const lastStoreId = getLastVisitedStoreClient();

      if (lastStoreId) {
        window.location.href = `/store/${lastStoreId}/home`;
      } else {
        window.location.href = '/my-store';
      }
    }
  }, [user, loading, isRedirecting, router]);

  return null;
}
