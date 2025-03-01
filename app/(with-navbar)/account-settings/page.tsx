'use client'

import { Sidebar } from '@/app/(with-navbar)/account-settings/components/SideBar'
import { AccountSettings } from '@/app/(with-navbar)/account-settings/components/AccountSettings'
import { PaymentSettings } from '@/app/(with-navbar)/account-settings/components/PaymentSettings'
import { ActiveSessions } from '@/app/(with-navbar)/account-settings/components/ActiveSessions' 
import { useState, useEffect } from 'react'
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

export default function AccountSettingsPage() {
  const [currentView, setCurrentView] = useState('cuenta')

  useEffect(() => {
    document.title = 'Mi Perfil • Fasttify'
  }, [])

  return (
    <div className="overflow-x-hidden">
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <div className="p-6">
          {currentView === 'cuenta' && <AccountSettings />}
          {currentView === 'pagos' && <PaymentSettings />}
          {currentView === 'sesiones' && <ActiveSessions />}
        </div>
      </div>
  
    </div>
  )
}
