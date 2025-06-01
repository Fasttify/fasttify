import { useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useUserStoreData,
  PaymentGatewayType,
} from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData'
import { useApiKeyEncryption } from '@/app/(setup-layout)/first-steps/hooks/useApiKeyEncryption'
import useUserStore from '@/context/core/userStore'

export function usePaymentSettings() {
  const params = useParams()
  const storeId = params.slug as string
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayType>('mercadoPago')
  const { getStorePaymentInfo, configurePaymentGateway } = useUserStoreData()
  const { encryptApiKey, isEncrypting } = useApiKeyEncryption()
  const { user, loading: userLoading } = useUserStore()
  const queryClient = useQueryClient()
  const userId = user?.userId

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
      toast.success(`¡Configuración exitosa!`, {
        description: `La pasarela ${gatewayName} ha sido configurada correctamente.`,
      })
      queryClient.invalidateQueries({ queryKey: ['storePaymentInfo', storeId] })
    },
    onError: (error, variables) => {
      const gatewayName = variables.gateway === 'wompi' ? 'Wompi' : 'Mercado Pago'
      toast.error(`Error de configuración`, {
        description: `No se pudo configurar ${gatewayName}. Por favor, intenta nuevamente.`,
      })
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
  }): Promise<boolean> => {
    try {
      if (!storeId) {
        toast.error('Error de configuración', {
          description: 'Uyps! Hubo un error al configurar la pasarela de pago.',
        })
        console.error('Store ID not found')
        return false
      }

      // Encriptar las claves API antes de guardarlas
      let configData: any = { isActive: true }

      if (data.gateway === 'wompi') {
        // Encriptar la clave pública de Wompi
        if (data.publicKey) {
          const encryptedPublicKey = await encryptApiKey(
            data.publicKey,
            'wompi',
            'publicKey',
            storeId
          )
          if (encryptedPublicKey) {
            configData.publicKey = encryptedPublicKey
          } else {
            console.error('Error encrypting Wompi public key')
            toast.error('Error de configuración', {
              description:
                'No se pudo configurar la pasarela de pago. Por favor, intenta nuevamente.',
            })
            return false
          }
        }

        // Encriptar la firma (clave privada) de Wompi
        if (data.privateKey) {
          const encryptedSignature = await encryptApiKey(
            data.privateKey,
            'wompi',
            'signature',
            storeId
          )
          if (encryptedSignature) {
            configData.signature = encryptedSignature
          } else {
            console.error('Error encrypting Wompi signature')
            toast.error('Error de configuración', {
              description:
                'No se pudo configurar la pasarela de pago. Por favor, intenta nuevamente.',
            })
            return false
          }
        }
      } else if (data.gateway === 'mercadoPago') {
        // Encriptar la clave pública de Mercado Pago
        if (data.publicKey) {
          const encryptedPublicKey = await encryptApiKey(
            data.publicKey,
            'mercadopago',
            'publicKey',
            storeId
          )
          if (encryptedPublicKey) {
            configData.publicKey = encryptedPublicKey
          } else {
            console.error('Error encrypting the Mercado Pago public key')
            toast.error('Error de configuración', {
              description:
                'No se pudo configurar la pasarela de pago. Por favor, intenta nuevamente.',
            })
            return false
          }
        }

        // Encriptar la clave privada de Mercado Pago
        if (data.privateKey) {
          const encryptedPrivateKey = await encryptApiKey(
            data.privateKey,
            'mercadopago',
            'privateKey',
            storeId
          )
          if (encryptedPrivateKey) {
            configData.privateKey = encryptedPrivateKey
          } else {
            console.error('Error encrypting the Mercado Pago private key')
            toast.error('Error de configuración', {
              description:
                'No se pudo configurar la pasarela de pago. Por favor, intenta nuevamente.',
            })
            return false
          }
        }
      }

      if (isEncrypting) {
        toast.loading('Configurando pasarela de pago...')
        return false
      }

      const success = await configureGatewayMutation.mutateAsync({
        storeId: storeId,
        gateway: data.gateway,
        configData,
      })

      return success
    } catch (err) {
      console.error('Error configuring the payment gateway:', err)
      toast.error('Error de configuración', {
        description: 'No se pudo configurar la pasarela de pago. Por favor, intenta nuevamente.',
      })
      return false
    }
  }

  const isGatewayConfigured = (gateway: PaymentGatewayType) => {
    return configuredGateways.includes(gateway)
  }

  return {
    // State
    modalOpen,
    setModalOpen,
    selectedGateway,
    storeId,

    // Data
    configuredGateways,
    isLoading: isLoading || isRefetching || userLoading,

    // Functions
    handleOpenModal,
    handleSubmit,
    isGatewayConfigured,
  }
}
