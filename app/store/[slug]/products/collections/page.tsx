'use client'

import { CollectionsPage } from '@/app/store/components/product-management/collections/collections-page'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()

export default function CollectionsPages() {
  return <CollectionsPage />
}
