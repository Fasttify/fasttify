import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStoreData, PaymentGatewayType } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData';
import { useAuth } from '@/context/hooks/useAuth';
import { useToast } from '@/app/store/context/ToastContext';

export function usePaymentSettings() {
  const params = useParams();
  const storeId = params.slug as string;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayType>('mercadoPago');
  const { getStorePaymentInfo, configurePaymentGateway } = useUserStoreData();
  const { user, loading: userLoading } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.userId;
  const { showToast } = useToast();

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ['storePaymentInfo', storeId],
    queryFn: () => getStorePaymentInfo(storeId),
    enabled: !!storeId && !!userId && !userLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const configuredGateways = data?.configuredGateways || [];

  const configureGatewayMutation = useMutation({
    mutationFn: async (data: { storeId: string; gateway: PaymentGatewayType; configData: any }) => {
      return await configurePaymentGateway(data.storeId, data.gateway, data.configData);
    },
    onSuccess: (_, variables) => {
      const gatewayName = variables.gateway === 'wompi' ? 'Wompi' : 'Mercado Pago';
      showToast(`La pasarela ${gatewayName} ha sido configurada correctamente.`);
      queryClient.invalidateQueries({ queryKey: ['storePaymentInfo', storeId] });
    },
    onError: (error, variables) => {
      const gatewayName = variables.gateway === 'wompi' ? 'Wompi' : 'Mercado Pago';
      showToast(`No se pudo configurar ${gatewayName}. Por favor, intenta nuevamente.`, true);
      console.error(`Error configuring ${variables.gateway}`, error);
    },
  });

  const handleOpenModal = (gateway: PaymentGatewayType) => {
    setSelectedGateway(gateway);
    setModalOpen(true);
  };

  const handleSubmit = async (data: { gateway: PaymentGatewayType; publicKey: string; privateKey: string }) => {
    if (!storeId) {
      showToast('Error: No se encontró el ID de la tienda.', true);
      console.error('Store ID not found');
      return;
    }

    // Pasa las claves públicas y privadas directamente a la mutación.
    // La encriptación se realizará en la Lambda.
    const configData = {
      publicKey: data.publicKey,
      privateKey: data.privateKey,
      isActive: true, // Asume que isActive es siempre true al configurar
    };

    await configureGatewayMutation.mutateAsync({
      storeId: storeId,
      gateway: data.gateway,
      configData,
    });
  };

  const isGatewayConfigured = (gateway: PaymentGatewayType) => {
    return configuredGateways.includes(gateway);
  };

  return {
    modalOpen,
    setModalOpen,
    selectedGateway,
    storeId,
    configuredGateways,
    isLoading: isLoading || isRefetching || userLoading,
    handleOpenModal,
    handleSubmit,
    isGatewayConfigured,
  };
}
