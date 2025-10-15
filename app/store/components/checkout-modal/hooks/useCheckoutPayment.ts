'use client';

import { useState } from 'react';
import { useAuth } from '@/context/hooks/useAuth';
import { post } from 'aws-amplify/api';
import { useToast } from '@/app/store/context/ToastContext';

interface SubscriptionResponse {
  checkoutUrl?: string;
  error?: string;
  details?: string;
}

/**
 * Hook personalizado para manejar el proceso de pago en el modal de checkout
 * Integra con Polar.sh para crear la sesión de pago
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
      // ID del plan Royal (el plan por defecto para el checkout)
      const royalPlanId = 'e02f173f-1ca5-4f7b-a900-2e5c9413d8a6';

      const restOperation = post({
        apiName: 'SubscriptionApi',
        path: 'subscribe',
        options: {
          body: {
            userId: user.userId,
            email: user.email,
            name: user.nickName,
            plan: {
              polarId: royalPlanId,
            },
          },
        },
      });

      const { body } = await restOperation.response;
      const response = (await body.json()) as SubscriptionResponse;

      if (response && response.checkoutUrl) {
        // Redirigir a Polar.sh para completar el pago
        window.location.href = response.checkoutUrl;
      } else {
        throw new Error('No se recibió URL de checkout');
      }
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
