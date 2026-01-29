'use client';

import { Suspense } from 'react';
import { AuthVerificationPage } from '@fasttify/orders-app';

export default function AuthPage() {
  return (
    <Suspense>
      <AuthVerificationPage />
    </Suspense>
  );
}
