import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useUserStoreData,
  PaymentGatewayType,
} from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData'
import { useApiKeyEncryption } from '@/app/(setup-layout)/first-steps/hooks/useApiKeyEncryption'
import useUserStore from '@/context/core/userStore'
import { useToast } from '@/app/store/context/ToastContext'

export function usePaymentSettings() {
  const params = useParams()
  const storeId = params.slug as string
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayType>('mercadoPago')
  const { getStorePaymentInfo, configurePaymentGateway } = useUserStoreData()
  const { encryptApiKey } = useApiKeyEncryption()
  const { user, loading: userLoading } = useUserStore()
  const queryClient = useQueryClient()
  const userId = user?.userId
  const { showToast } = useToast()

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ['storePaymentInfo', storeId],
    queryFn: () => getStorePaymentInfo(storeId),
    enabled: !!storeId && !!userId && !userLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const configuredGateways = data?.configuredGateways || []

  const configureGatewayMutation = useMutation({
    mutationFn: async (data: { storeId: string; gateway: PaymentGatewayType; configData: any }) => {
      return await configurePaymentGateway(data.storeId, data.gateway, data.configData, true)
    },
    onSuccess: (_, variables) => {
      const gatewayName = variables.gateway === 'wompi' ? 'Wompi' : 'Mercado Pago'
      showToast(`La pasarela ${gatewayName} ha sido configurada correctamente.`)
      queryClient.invalidateQueries({ queryKey: ['storePaymentInfo', storeId] })
    },
    onError: (error, variables) => {
      const gatewayName = variables.gateway === 'wompi' ? 'Wompi' : 'Mercado Pago'
      showToast(`No se pudo configurar ${gatewayName}. Por favor, intenta nuevamente.`, true)
      console.error(`Error configuring ${variables.gateway}`, error)
    },
  })

  const handleOpenModal = (gateway: PaymentGatewayType) => {
    setSelectedGateway(gateway)
    setModalOpen(true)
  }

  const handleSubmit = async (data: {
    gateway: PaymentGatewayType
    publicKey: string
    privateKey: string
  }) => {
    if (!storeId) {
      showToast('Error: No se encontró el ID de la tienda.', true)
      console.error('Store ID not found')
      return
    }

    let configData: any = { isActive: true }

    try {
      if (data.gateway === 'wompi') {
        if (data.publicKey) {
          const encryptedPublicKey = await encryptApiKey(
            data.publicKey,
            'wompi',
            'publicKey',
            storeId
          )
          configData.publicKey = encryptedPublicKey
        }
        if (data.privateKey) {
          const encryptedSignature = await encryptApiKey(
            data.privateKey,
            'wompi',
            'signature',
            storeId
          )
          configData.signature = encryptedSignature
        }
      } else if (data.gateway === 'mercadoPago') {
        if (data.publicKey) {
          const encryptedPublicKey = await encryptApiKey(
            data.publicKey,
            'mercadopago',
            'publicKey',
            storeId
          )
          configData.publicKey = encryptedPublicKey
        }
        if (data.privateKey) {
          const encryptedPrivateKey = await encryptApiKey(
            data.privateKey,
            'mercadopago',
            'privateKey',
            storeId
          )
          configData.privateKey = encryptedPrivateKey
        }
      }

      await configureGatewayMutation.mutateAsync({
        storeId: storeId,
        gateway: data.gateway,
        configData,
      })
    } catch (err) {
      showToast('Error al encriptar o guardar las claves. Intenta de nuevo.', true)
      console.error('Error configuring the payment gateway:', err)
    }
  }

  const isGatewayConfigured = (gateway: PaymentGatewayType) => {
    return configuredGateways.includes(gateway)
  }

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
  }
}
