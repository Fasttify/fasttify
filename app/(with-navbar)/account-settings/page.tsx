'use client'

import { Sidebar } from '@/app/(with-navbar)/account-settings/components/SideBar'
import { AccountSettings } from '@/app/(with-navbar)/account-settings/components/AccountSettings'
import { PaymentSettings } from '@/app/(with-navbar)/account-settings/components/PaymentSettings'
import { ActiveSessions } from '@/app/(with-navbar)/account-settings/components/ActiveSessions'
import { useState, useEffect, Suspense } from 'react'
import { Loader } from '@/components/ui/loader'
import { Amplify } from 'aws-amplify'
import { useSearchParams } from 'next/navigation'
import useUserStore from '@/zustand-states/userStore'
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

// Client component that uses search params
function AccountSettingsContent() {
  const searchParams = useSearchParams()
  const sectionParam = searchParams.get('section')
  const [currentView, setCurrentView] = useState(sectionParam || 'cuenta')
  const { user, loading } = useUserStore()

  const isGoogleUser = user?.identities?.some(
    identity => identity.providerType === 'Google' || identity.providerName === 'Google'
  )

  useEffect(() => {
    // Update view when URL parameter changes
    if (sectionParam && ['cuenta', 'pagos', 'sesiones'].includes(sectionParam)) {
      if (isGoogleUser && sectionParam === 'sesiones') {
        setCurrentView('cuenta')
      } else {
        setCurrentView(sectionParam)
      }
    }
  }, [sectionParam, isGoogleUser])

  useEffect(() => {
    document.title = 'Mi Perfil • Fasttify'
  }, [])

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        hideSessionsOption={isGoogleUser}
        isUserLoading={loading}
      />
      <div className="p-6">
        {currentView === 'cuenta' && <AccountSettings />}
        {currentView === 'pagos' && <PaymentSettings />}
        {!isGoogleUser && currentView === 'sesiones' && <ActiveSessions />}
      </div>
    </div>
  )
}

export default function AccountSettingsPage() {
  return (
    <div className="overflow-x-hidden">
      <Suspense
        fallback={
          <Loader
            color="black"
            content="Cargando perfil"
            size="large"
            fullWidth={true}
            centered={true}
          />
        }
      >
        <AccountSettingsContent />
      </Suspense>
    </div>
  )
}
