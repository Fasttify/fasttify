'use client'

import { DomainManagement } from '@/app/store/components/domains/components/DomainManagement'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()

export default function DomainManagementPage() {
  return <DomainManagement />
}
