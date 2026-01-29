'use client';

import { useState } from 'react';
import { useAuth } from '@/context/hooks/useAuth';
import { useToast } from '@/app/store/context/ToastContext';
import { plans } from '@/app/(www)/pricing/components/plans';

/**
 * Hook personalizado para manejar el proceso de pago en el modal de checkout
 * Integra con Polar.sh usando el adaptador de Next.js
 */
export function useCheckoutPayment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  /**
   * Maneja el proceso de suscripción y redirige a Polar.sh
   */
  const handlePayment = async () => {
    if (!user) {
      showToast('Debes iniciar sesión para continuar', true);
      return;
    }

    if (!user.userId || !user.email || !user.nickName) {
      showToast('Información de usuario incompleta', true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Seleccionar el plan Royal desde plans.ts (respeta entorno)
      const royalPlan = plans.find((p) => p.name === 'Royal');
      const royalPlanId = royalPlan?.polarId;

      if (!royalPlanId) {
        throw new Error('No se encontró el plan Royal');
      }

      // Construir URL con query params para el adaptador de Polar
      const url = new URL('/api/checkout', window.location.origin);
      url.searchParams.set('products', royalPlanId);
      url.searchParams.set('customerExternalId', user.userId);
      url.searchParams.set('customerEmail', user.email);
      url.searchParams.set('customerName', user.nickName);

      // Redirigir directamente (el adaptador maneja la redirección)
      window.location.href = url.toString();
    } catch (error) {
      console.error('Error procesando suscripción:', error);
      showToast('Hubo un error al procesar tu suscripción. Por favor, inténtalo de nuevo.', true);
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handlePayment,
  };
}
