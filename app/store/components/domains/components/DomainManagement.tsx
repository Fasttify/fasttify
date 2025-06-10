import { useState } from 'react'
import {
  Page,
  Layout,
  LegacyCard,
  Text,
  ButtonGroup,
  Button,
  Box,
  Icon,
  LegacyStack,
  TextField,
  SkeletonPage,
  SkeletonBodyText,
  SkeletonDisplayText,
} from '@shopify/polaris'
import {
  SearchIcon,
  GlobeIcon,
  StoreIcon,
  MarketsIcon,
  DomainLandingPageIcon,
} from '@shopify/polaris-icons'

import { ChangeDomainDialog } from '@/app/store/components/domains/components/ChangeDomainDialog'
import { EditStoreProfileDialog } from '@/app/store/components/domains/components/EditStoreProfileDialog'
import useStoreDataStore from '@/context/core/storeDataStore'

export function DomainManagement() {
  const { currentStore, isLoading } = useStoreDataStore()
  const [openChangeDomainDialog, setOpenChangeDomainDialog] = useState(false)
  const [openEditProfileDialog, setOpenEditProfileDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  if (isLoading) {
    return (
      <SkeletonPage title="Gestión de Dominios" primaryAction>
        <Layout>
          <Layout.Section>
            <LegacyCard sectioned>
              <SkeletonBodyText lines={3} />
            </LegacyCard>
            <LegacyCard sectioned>
              <SkeletonBodyText lines={2} />
            </LegacyCard>
            <LegacyCard sectioned>
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={1} />
            </LegacyCard>
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    )
  }

  return (
    <Page title="Gestión de Dominios" fullWidth>
      <Layout>
        <Layout.Section>
          <LegacyCard>
            <LegacyCard.Section>
              <LegacyStack distribution="equalSpacing" alignment="center">
                <LegacyStack.Item fill>
                  <Text variant="headingMd" as="h2">
                    Configura tu dominio personalizado
                  </Text>
                  <Text as="p" tone="subdued">
                    Vincula un dominio propio o adquiere uno nuevo para darle mayor identidad y
                    profesionalismo a tu tienda.
                  </Text>
                </LegacyStack.Item>
                <Box>
                  <div
                    style={{
                      width: '96px',
                      height: '96px',
                      backgroundColor: 'var(--p-color-bg-surface-secondary)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <Icon source={DomainLandingPageIcon} tone="base" />
                    <div style={{ position: 'absolute' }}>
                      <Text variant="bodyMd" as="span" fontWeight="semibold">
                        www
                      </Text>
                    </div>
                  </div>
                </Box>
              </LegacyStack>
            </LegacyCard.Section>
            <LegacyCard.Section>
              <ButtonGroup>
                <Button variant="primary">Comprar dominio</Button>
                <Button>Conectar dominio existente</Button>
              </ButtonGroup>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>

        <Layout.Section>
          <LegacyCard title="Detalles de la tienda">
            <LegacyCard.Section>
              <LegacyStack vertical spacing="tight">
                <LegacyStack alignment="center">
                  <Icon source={StoreIcon} tone="base" />
                  <Text as="p">{currentStore?.storeName}</Text>
                </LegacyStack>
                <LegacyStack alignment="center">
                  <Icon source={MarketsIcon} tone="base" />
                  <LegacyStack vertical spacing="none">
                    <Text as="p">Dirección de facturación</Text>
                    <Text as="p" tone="subdued">
                      Colombia
                    </Text>
                  </LegacyStack>
                </LegacyStack>
              </LegacyStack>
            </LegacyCard.Section>
            <LegacyCard.Section>
              <Button variant="plain" onClick={() => setOpenEditProfileDialog(true)}>
                Editar detalles de la tienda
              </Button>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>

        <Layout.Section>
          <LegacyCard>
            <LegacyCard.Section>
              <TextField
                label="Buscar dominios"
                labelHidden
                value={searchQuery}
                onChange={setSearchQuery}
                prefix={<Icon source={SearchIcon} tone="base" />}
                placeholder="Buscar dominios"
                autoComplete="off"
              />
            </LegacyCard.Section>
            <LegacyCard.Section>
              <LegacyStack distribution="equalSpacing" alignment="center">
                <LegacyStack alignment="center">
                  <Icon source={GlobeIcon} tone="base" />
                  <LegacyStack vertical spacing="none">
                    <Text as="p">{currentStore?.customDomain}</Text>
                    <Text as="p" tone="subdued">
                      Dominio predeterminado
                    </Text>
                  </LegacyStack>
                </LegacyStack>
                <Text as="p">Activo</Text>
              </LegacyStack>
              <Box paddingBlockStart="200" paddingInlineStart="400">
                <Button variant="plain" onClick={() => setOpenChangeDomainDialog(true)}>
                  Cambiar a un nuevo subdominio
                </Button>
              </Box>
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>
      </Layout>

      <ChangeDomainDialog
        open={openChangeDomainDialog}
        onOpenChange={setOpenChangeDomainDialog}
        storeId={currentStore?.storeId || ''}
      />

      <EditStoreProfileDialog
        open={openEditProfileDialog}
        onOpenChange={setOpenEditProfileDialog}
        storeId={currentStore?.storeId || ''}
        initialData={{
          storeName: currentStore?.storeName,
          contactEmail: currentStore?.contactEmail || '',
          contactPhone: currentStore?.contactPhone?.toString() || '',
        }}
      />
    </Page>
  )
}
