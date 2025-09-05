'use client';

import 'aws-amplify/auth/enable-oauth-listener';
import { useEffect, useState } from 'react';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import DocsLanding from '@/app/(main-layout)/landing/components/DocsLanding';
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

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', async ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          await getUser();
          break;
        case 'signInWithRedirect_failure':
          console.error('OAuth sign in failed:', payload.data);
          break;
        case 'customOAuthState':
          const state = payload.data;
          break;
      }
    });

    getUser();

    return unsubscribe;
  }, []);

  const getUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      setUser({ ...currentUser, ...userAttributes });
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return <DocsLanding />;
}
