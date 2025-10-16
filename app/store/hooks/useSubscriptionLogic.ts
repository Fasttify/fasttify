import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useSubscriptionStore } from '@/context/core/useSubscriptionStore';

interface UseSubscriptionLogicResult {
  subscription: any;
  subscriptionLoading: boolean;
  hasRealSubscription: boolean;
  isPaidPlan: boolean;
  currentPlan: string;
}

/**
 * Hook personalizado para manejar la lógica de suscripciones
 * Evita múltiples peticiones y proporciona datos limpios
 */
export function useSubscriptionLogic(userId?: string): UseSubscriptionLogicResult {
  const { subscription, loading: subscriptionLoading, setCognitoUsername, fetchSubscription } = useSubscriptionStore();
  const initializedUsers = useRef(new Set<string>());
  const loadingUsers = useRef(new Set<string>());

  // Función memoizada para cargar la suscripción
  const loadSubscription = useCallback(
    async (id: string) => {
      if (loadingUsers.current.has(id)) {
        return; // Ya se está cargando
      }

      loadingUsers.current.add(id);
      try {
        setCognitoUsername(id);
        await fetchSubscription();
        initializedUsers.current.add(id);
      } finally {
        loadingUsers.current.delete(id);
      }
    },
    [setCognitoUsername, fetchSubscription]
  );

  // Cargar datos de suscripción solo una vez por usuario
  useEffect(() => {
    // Solo ejecutar si userId es válido y no es undefined
    if (!userId) {
      return;
    }

    if (!initializedUsers.current.has(userId) && !loadingUsers.current.has(userId)) {
      loadSubscription(userId);
    }
  }, [userId, loadSubscription]);

  // Detectar si es suscripción real de Polar (memoizada)
  const hasRealSubscription = useMemo(() => {
    if (!subscription) return false;

    // Verificar que tiene subscriptionId y no es trial
    const hasValidSubscriptionId = Boolean(
      subscription.subscriptionId && !subscription.subscriptionId.startsWith('trial-')
    );

    // Verificar que tiene planPrice mayor a 0
    const hasValidPrice = (subscription.planPrice ?? 0) > 0;

    return hasValidSubscriptionId && hasValidPrice;
  }, [subscription]);

  // Determinar si es plan pagado basado en el precio del plan
  const isPaidPlan = useMemo(() => {
    if (!subscription) return false;
    return (subscription.planPrice ?? 0) > 0;
  }, [subscription]);

  // Obtener el plan actual
  const currentPlan = useMemo(() => {
    return subscription?.planName || 'Gratuito';
  }, [subscription]);

  return {
    subscription,
    subscriptionLoading,
    hasRealSubscription,
    isPaidPlan,
    currentPlan,
  };
}
