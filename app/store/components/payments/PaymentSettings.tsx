'use client'

import { PaymentSettingsSkeleton } from '@/app/store/components/payments/PaymentSettingsSkeleton'
import { ApiKeyModal } from '@/app/store/components/payments/ApiKeyModal'
import { PaymentProvidersSection } from '@/app/store/components/payments/PaymentProvidersSection'
import { PaymentMethodsSection } from '@/app/store/components/payments/PaymentMethodsSection'
import { PaymentCaptureSection } from '@/app/store/components/payments/PaymentCaptureSection'
import { usePaymentSettings } from '@/app/store/components/payments/hooks/usePaymentSettings'
import { Amplify } from 'aws-amplify'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
})

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
