import { Banner } from '@shopify/polaris';
import { useState } from 'react';

interface SetupAdBannerProps {
  onActionClick: () => void;
}

const BANNER_STORAGE_KEY = 'fasttify-setup-banner-dismissed';

// Función para obtener el estado inicial desde localStorage
const getInitialVisibility = (): boolean => {
  if (typeof window === 'undefined') return true; // SSR fallback
  return localStorage.getItem(BANNER_STORAGE_KEY) !== 'true';
};

export function SetupAdBanner({ onActionClick }: SetupAdBannerProps) {
  const [visible, setVisible] = useState(getInitialVisibility);

  // Función para manejar el cierre del banner
  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(BANNER_STORAGE_KEY, 'true');
  };

  if (!visible) {
    return null;
  }

  return (
    <Banner
      title="Suscríbete a un plan y obtén 2 meses a solo $35.000 mes en Fasttify"
      tone="info"
      onDismiss={handleDismiss}
      action={{ content: 'Ver planes', onAction: onActionClick }}
    />
  );
}
