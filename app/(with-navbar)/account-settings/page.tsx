'use client'

import { Sidebar } from '@/app/(with-navbar)/account-settings/components/SideBar'
import { AccountSettings } from '@/app/(with-navbar)/account-settings/components/AccountSettings'
import { PaymentSettings } from '@/app/(with-navbar)/account-settings/components/PaymentSettings'
import { ActiveSessions } from '@/app/(with-navbar)/account-settings/components/ActiveSessions'
import { useState, useEffect, Suspense } from 'react'
import { Amplify } from 'aws-amplify'
import outputs from '@/amplify_outputs.json'
import { useSearchParams } from 'next/navigation'

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

  useEffect(() => {
    // Update view when URL parameter changes
    if (sectionParam && ['cuenta', 'pagos', 'sesiones'].includes(sectionParam)) {
      setCurrentView(sectionParam)
    }
  }, [sectionParam])

  useEffect(() => {
    document.title = 'Mi Perfil • Fasttify'
  }, [])

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="p-6">
        {currentView === 'cuenta' && <AccountSettings />}
        {currentView === 'pagos' && <PaymentSettings />}
        {currentView === 'sesiones' && <ActiveSessions />}
      </div>
    </div>
  )
}

export default function AccountSettingsPage() {
  return (
    <div className="overflow-x-hidden">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        }
      >
        <AccountSettingsContent />
      </Suspense>
    </div>
  )
}
