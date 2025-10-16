'use client';

import { useState } from 'react';
import { useAuth } from '@/context/hooks/useAuth';
import { useToast } from '@/app/store/context/ToastContext';
import type { Plan } from '../domain/plan';

/**
 * Caso de uso para suscribirse a un plan vía Polar.
 * Sin dependencias de UI, solo usa Auth y Toast del contexto del proyecto.
 */
export function usePlanCheckout() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const subscribe = async (plan: Plan) => {
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
      const url = new URL('/api/checkout', window.location.origin);
      url.searchParams.set('products', plan.polarId);
      url.searchParams.set('customerExternalId', user.userId);
      url.searchParams.set('customerEmail', user.email);
      url.searchParams.set('customerName', user.nickName);

      window.location.href = url.toString();
    } catch (error) {
      console.error('Error procesando suscripción:', error);
      showToast('Hubo un error al procesar tu suscripción. Por favor, inténtalo de nuevo.', true);
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, subscribe };
}
