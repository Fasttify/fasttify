'use client'

import { ThemePreview } from '@/app/store/components/store-config/components/ThemePreview'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()

export default function SetupPage() {
  return <ThemePreview />
}
