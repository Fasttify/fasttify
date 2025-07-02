'use client';

import { useEffect } from 'react';
import AuthClient from '@/app/(setup-layout)/login/components/main-components/AuthClient';

export default function LoginPage() {
  useEffect(() => {
    document.title = 'Creando tu cuenta | Fasttify';
  }, []);

  return <AuthClient />;
}
