import { EmptyState, Banner, Text } from '@shopify/polaris'
import { CheckIcon } from '@shopify/polaris-icons'

export function SuccessStep() {
  return (
    <EmptyState
      heading="¡Conexión Exitosa!"
      image="https://cdn.shopify.com/s/files/1/0262/4074/2756/files/emptystate-files.png"
    >
      <Text as="p" tone="subdued">
        Tu tienda ha sido conectada correctamente con Master Shop.
      </Text>
      <div style={{ marginTop: '2rem' }}>
        <Banner title="Integración Activa" tone="success" icon={CheckIcon}>
          <p>
            Ahora puedes importar y sincronizar productos desde Master Shop. Ve a la sección de
            Productos para comenzar.
          </p>
        </Banner>
      </div>
    </EmptyState>
  )
}
