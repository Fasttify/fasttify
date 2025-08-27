'use client';

import { EmailRequestPage } from '@/packages/orders-app/src';

export default function OrdersPage() {
  const handleEmailSubmit = async (email: string, storeId?: string) => {
    try {
      const response = await fetch('/api/v1/auth/send-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, storeId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message: 'Email enviado correctamente. Revisa tu bandeja de entrada.',
        };
      } else {
        return {
          success: false,
          message: data.error || 'Error al enviar el email',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión. Inténtalo de nuevo.',
      };
    }
  };

  return (
    <EmailRequestPage
      onSubmit={handleEmailSubmit}
      title="Accede a tus Órdenes"
      subtitle="Ingresa tu email para recibir un enlace de acceso seguro a tus órdenes de compra."
      logoSrc="/icons/fasttify-white.webp"
      logoAlt="Fasttify Logo"
      backgroundImageSrc="https://images.unsplash.com/photo-1755896487474-c5b369b35504?q=80&w=764&auto=format&fit=crop"
    />
  );
}
