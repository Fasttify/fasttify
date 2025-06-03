'use client'

import { FormPage } from '@/app/store/components/product-management/collection-form/form-page'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()

export default function CollectionPage() {
  return <FormPage />
}
