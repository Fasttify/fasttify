'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { AuthVerificationPage } from '@/packages/orders-app/src';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  return <AuthVerificationPage getSearchParam={(key) => searchParams.get(key)} navigate={(url) => router.push(url)} />;
}
