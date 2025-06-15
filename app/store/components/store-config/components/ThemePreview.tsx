import {
  Page,
  Layout,
  Text,
  BlockStack,
  Card,
  Button,
  ButtonGroup,
  Badge,
  MediaCard,
} from '@shopify/polaris'
import { MoneyFilledIcon } from '@shopify/polaris-icons'
import { LogoUploader } from '@/app/store/components/store-config/components/LogoUploader'
import useStoreDataStore from '@/context/core/storeDataStore'
import Image from 'next/image'

export function ThemePreview() {
  const { currentStore } = useStoreDataStore()
  const customDomain = currentStore?.customDomain
  const viewStore = `https://${customDomain}`

  return (
    <Page
      title="Diseño"
      primaryAction={{
        content: 'Personalizar',
        onAction: () => {}, // Agregar acción de personalización
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Tema Actual
                </Text>
                <div style={{ height: '280px', position: 'relative', overflow: 'hidden' }}>
                  <Image
                    src="https://images.unsplash.com/photo-1741482529153-a98d81235d06?q=80&w=2070&auto=format&fit=crop"
                    alt="Amazonas theme preview"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <BlockStack gap="200">
                  <Layout>
                    <Layout.Section>
                      <BlockStack align="center">
                        <Text variant="headingMd" as="h2">
                          Amazonas
                        </Text>
                      </BlockStack>
                      <Badge tone="success" size="small">
                        Diseño actual
                      </Badge>
                    </Layout.Section>
                    <Layout.Section variant="oneThird">
                      <ButtonGroup>
                        <Button onClick={() => window.open(viewStore, '_blank')}>Ver tienda</Button>
                        <Button icon={MoneyFilledIcon} accessibilityLabel="Más opciones" />
                      </ButtonGroup>
                    </Layout.Section>
                  </Layout>
                </BlockStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Temas Disponibles
                </Text>
                <MediaCard
                  title="Explorar otros temas"
                  primaryAction={{
                    content: 'Ver temas',
                    url: '/themes',
                  }}
                  description="Explora nuestra colección de temas para encontrar el que mejor se adapte a tu marca."
                >
                  <div style={{ height: '150px', width: '100%', position: 'relative' }}>
                    <Image
                      src="https://images.unsplash.com/photo-1741548384019-44e405f96772?q=80&w=2070&auto=format&fit=crop"
                      alt="Theme collection preview"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </MediaCard>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Logo de la tienda
                </Text>
                <LogoUploadCard />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  )
}

function LogoUploadCard() {
  const { currentStore } = useStoreDataStore()
  const storeLogo = currentStore?.storeLogo
  const storeName = currentStore?.storeName

  return (
    <BlockStack gap="400">
      <Text as="p" tone="subdued">
        Sube y gestiona el logo de tu marca.
      </Text>

      {storeLogo && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '10rem',
            border: '1px solid var(--p-color-border)',
            borderRadius: 'var(--p-border-radius-200)',
          }}
        >
          <div style={{ position: 'relative', width: '80%', height: '80%' }}>
            <Image
              src={storeLogo}
              alt={`Logo de ${storeName}`}
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

      <LogoUploader />
    </BlockStack>
  )
}
