'use client'

import { Page, Layout } from '@shopify/polaris'
import { PaymentSettingsSkeleton } from '@/app/store/components/payments/components/PaymentSettingsSkeleton'
import { ApiKeyModal } from '@/app/store/components/payments/components/ApiKeyModal'
import { PaymentProvidersSection } from '@/app/store/components/payments/components/PaymentProvidersSection'
import { PaymentMethodsSection } from '@/app/store/components/payments/components/PaymentMethodsSection'
import { PaymentCaptureSection } from '@/app/store/components/payments/components/PaymentCaptureSection'
import { usePaymentSettings } from '@/app/store/components/payments/hooks/usePaymentSettings'

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

  if (isLoading) {
    return <PaymentSettingsSkeleton />
  }

  return (
    <Page title="Pagos" fullWidth>
      <Layout>
        <Layout.Section>
          <PaymentProvidersSection />
        </Layout.Section>
        <Layout.Section>
          <PaymentMethodsSection
            configuredGateways={configuredGateways}
            onOpenModal={handleOpenModal}
          />
        </Layout.Section>
        <Layout.Section>
          <PaymentCaptureSection />
        </Layout.Section>
      </Layout>

      <ApiKeyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        gateway={selectedGateway}
        onSubmit={handleSubmit}
      />
    </Page>
  )
}
