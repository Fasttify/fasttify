import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { routes } from '@/utils/routes'
import { ProductIcon } from '@shopify/polaris-icons'
import { Text } from '@shopify/polaris'

interface CollectionsHeaderProps {
  storeId: string
}

export default function CollectionsHeader({ storeId }: CollectionsHeaderProps) {
  const router = useRouter()
  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <ProductIcon className="w-5 h-5" />
          <Text as="h1" variant="headingLg" fontWeight="regular">
            Colecciones
          </Text>
        </div>
        <Text variant="bodySm" tone="subdued" as="p">
          Organiza tus productos en colecciones para facilitar la navegación de tus clientes.
        </Text>
      </div>
      <Button
        size="sm"
        className="h-9 bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] text-xs sm:text-sm"
        onClick={() => router.push(routes.store.products.collectionsNew(storeId))}
      >
        Crear colección
      </Button>
    </div>
  )
}
