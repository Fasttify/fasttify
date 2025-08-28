'use client';

import { Suspense } from 'react';
import { AuthVerificationPage } from '@/packages/orders-app/src';

export default function AuthPage() {
  return (
    <Suspense>
      <AuthVerificationPage />
    </Suspense>
  );
}
