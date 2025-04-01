import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'
import CollectionsHeader from '@/app/store/components/product-management/collections/collections-header'
import CollectionsTabs from '@/app/store/components/product-management/collections/collections-tabs'
import CollectionsTable from '@/app/store/components/product-management/collections/collections-table'
import CollectionsFooter from '@/app/store/components/product-management/collections/collections-footer'
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

export function CollectionsPage() {
  const pathname = usePathname()
  const params = useParams()

  const storeId = getStoreId(params, pathname)
  return (
    <div className="mt-8">
      <CollectionsHeader storeId={storeId} />
      <div className="rounded-lg shadow-sm border mt-4">
        <CollectionsTabs />
        <CollectionsTable />
      </div>
      <CollectionsFooter />
    </div>
  )
}
