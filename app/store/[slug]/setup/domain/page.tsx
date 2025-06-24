'use client'

import { DomainManagement } from '@/app/store/components/domains/pages/DomainManagement'
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

export default function DomainManagementPage() {
  return <DomainManagement />
}
