'use client'

import { AppIntegrationPage } from '@/app/store/components/app-integration/components/AppIntegrationPage'
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

export default function AppIntegration() {
  return <AppIntegrationPage />
}
