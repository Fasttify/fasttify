import { useMutation } from '@tanstack/react-query';
import { CheckoutParams } from '@/app/api/_lib/polar/types';

/**
 * Hook para manejar checkout usando el adaptador de Polar
 * Construye URL con query params y redirige directamente
 */
export const useCheckout = () => {
  const mutation = useMutation({
    mutationFn: async ({ productId, userId, email, name }: CheckoutParams) => {
      // Construir URL con query params para el adaptador de Polar
      const url = new URL('/api/checkout', window.location.origin);
      url.searchParams.set('products', productId);
      url.searchParams.set('customerExternalId', userId);
      url.searchParams.set('customerEmail', email);
      url.searchParams.set('customerName', name);

      // Redirigir directamente (el adaptador maneja la redirección)
      window.location.href = url.toString();

      return { success: true };
    },
  });

  return mutation;
};
