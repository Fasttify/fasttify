'use client'

import { Sidebar } from '@/app/account-settings/components/SideBar'
import { AccountSettings } from '@/app/account-settings/components/AccountSettings'
import { PaymentSettings } from '@/app/account-settings/components/PaymentSettings'
import { Navbar } from '@/app/landing/components/NavBar'
import { Footer } from '@/app/landing/components/Footer'
import { useState, useEffect } from 'react'
import { Amplify } from 'aws-amplify'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.API,
  },
})

export default function Page() {
  const [currentView, setCurrentView] = useState('cuenta')
  useEffect(() => {
    document.title = 'Mi Perfil • Fasttify'
  }, [])

  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <div className="p-6">
          {currentView === 'cuenta' ? <AccountSettings /> : <PaymentSettings />}
        </div>
      </div>
      <Footer />
    </div>
  )
}
