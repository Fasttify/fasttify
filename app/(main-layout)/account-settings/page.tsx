'use client'

import { Sidebar } from '@/app/(main-layout)/account-settings/components/SideBar'
import { AccountSettings } from '@/app/(main-layout)/account-settings/components/AccountSettings'
import { PaymentSettings } from '@/app/(main-layout)/account-settings/components/PaymentSettings'
import { ActiveSessions } from '@/app/(main-layout)/account-settings/components/ActiveSessions'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import useUserStore from '@/context/core/userStore'
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

function AccountSettingsContent() {
  const searchParams = useSearchParams()
  const sectionParam = searchParams.get('section')
  const [currentView, setCurrentView] = useState(sectionParam || 'cuenta')
  const { user, loading } = useUserStore()

  const isGoogleUser = user?.identities?.some(
    identity => identity.providerType === 'Google' || identity.providerName === 'Google'
  )

  useEffect(() => {
    if (sectionParam && ['cuenta', 'pagos', 'sesiones'].includes(sectionParam)) {
      if (isGoogleUser && sectionParam === 'sesiones') {
        setCurrentView('cuenta')
      } else {
        setCurrentView(sectionParam)
      }
    }
  }, [sectionParam, isGoogleUser])

  useEffect(() => {
    document.title = 'Mi Perfil | Fasttify'
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
      <Suspense>
        <AccountSettingsContent />
      </Suspense>
    </div>
  )
}
