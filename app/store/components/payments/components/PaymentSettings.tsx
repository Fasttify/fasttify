'use client'

import { PaymentSettingsSkeleton } from '@/app/store/components/payments/components/PaymentSettingsSkeleton'
import { ApiKeyModal } from '@/app/store/components/payments/components/ApiKeyModal'
import { PaymentProvidersSection } from '@/app/store/components/payments/components/PaymentProvidersSection'
import { PaymentMethodsSection } from '@/app/store/components/payments/components/PaymentMethodsSection'
import { PaymentCaptureSection } from '@/app/store/components/payments/components/PaymentCaptureSection'
import { usePaymentSettings } from '@/app/store/components/payments/hooks/usePaymentSettings'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()

export function PaymentSettings() {
  const {
    modalOpen,
    setModalOpen,
    selectedGateway,
    configuredGateways,
    isLoading,
    handleOpenModal,
    handleSubmit,
  } = usePaymentSettings()

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      {isLoading ? (
        <PaymentSettingsSkeleton />
      ) : (
        <>
          <PaymentProvidersSection />
          <PaymentMethodsSection
            configuredGateways={configuredGateways}
            onOpenModal={handleOpenModal}
          />
          <PaymentCaptureSection />
        </>
      )}

      <ApiKeyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        gateway={selectedGateway}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
