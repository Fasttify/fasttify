'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@shopify/polaris';

/**
 * Página de redirección de account-settings
 * Redirige a la página principal ya que el perfil ahora está en el admin
 *
 * @returns {JSX.Element} Indicador de carga mientras redirige
 */
export default function AccountSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página principal
    router.replace('/');
  }, [router]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}>
      <Spinner accessibilityLabel="Redirigiendo..." size="large" />
    </div>
  );
}
