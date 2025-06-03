'use client'

import { AppIntegrationPage } from '@/app/store/components/app-integration/components/AppIntegrationPage'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()

export default function AppIntegration() {
  return <AppIntegrationPage />
}
