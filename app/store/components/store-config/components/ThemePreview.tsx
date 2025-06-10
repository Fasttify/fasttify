import {
  Page,
  Layout,
  LegacyCard,
  Text,
  ButtonGroup,
  Button,
  Box,
  Badge,
  MediaCard,
  LegacyStack,
} from '@shopify/polaris'
import { MoneyFilledIcon } from '@shopify/polaris-icons'
import { LogoUploader } from '@/app/store/components/store-config/components/LogoUploader'
import useStoreDataStore from '@/context/core/storeDataStore'
import Image from 'next/image'

export function ThemePreview() {
  return (
    <Page title="Diseño" fullWidth>
      <Layout>
        <Layout.Section>
          <LegacyStack vertical spacing="loose">
            <CurrentThemeCard />
            <AvailableThemesCard />
          </LegacyStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <LogoUploadCard />
        </Layout.Section>
      </Layout>
    </Page>
  )
}

function CurrentThemeCard() {
  return (
    <LegacyCard>
      <div style={{ height: '280px', position: 'relative', overflow: 'hidden' }}>
        <Image
          src="https://images.unsplash.com/photo-1741482529153-a98d81235d06?q=80&w=2070&auto=format&fit=crop"
          alt="Amazonas theme preview"
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
      <LegacyCard.Section>
        <LegacyStack distribution="equalSpacing" alignment="center">
          <LegacyStack.Item>
            <LegacyStack alignment="center">
              <Text variant="headingMd" as="h2">
                Amazonas
              </Text>
              <Badge tone="success">Diseño actual</Badge>
            </LegacyStack>
          </LegacyStack.Item>
          <LegacyStack.Item>
            <ButtonGroup>
              <Button>Personalizar</Button>
              <Button icon={MoneyFilledIcon} accessibilityLabel="Más opciones" />
            </ButtonGroup>
          </LegacyStack.Item>
        </LegacyStack>
      </LegacyCard.Section>
    </LegacyCard>
  )
}

function AvailableThemesCard() {
  return (
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
  )
}

function LogoUploadCard() {
  const { currentStore } = useStoreDataStore()

  return (
    <LegacyCard>
      <LegacyCard.Section>
        <LegacyStack vertical spacing="loose">
          <LegacyStack vertical spacing="extraTight">
            <Text variant="headingMd" as="h3">
              Logo de la tienda
            </Text>
            <Text as="p" tone="subdued">
              Sube y gestiona el logo de tu marca.
            </Text>
          </LegacyStack>

          {currentStore?.storeLogo && (
            <Box borderColor="border" borderWidth="025" borderRadius="200" width="100%">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '10rem',
                }}
              >
                <div style={{ position: 'relative', width: '80%', height: '80%' }}>
                  <Image
                    src={currentStore.storeLogo}
                    alt={`Logo de ${currentStore.storeName || 'la tienda'}`}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
            </Box>
          )}

          <LogoUploader />
        </LegacyStack>
      </LegacyCard.Section>
    </LegacyCard>
  )
}
