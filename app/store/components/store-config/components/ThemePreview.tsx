import { LogoUploader } from '@/app/store/components/store-config/components/LogoUploader';
import { ThemeUploader } from '@/app/store/components/store-config/components/ThemeUploader';
import { ThemeList } from '@/app/store/components/theme-management/components/ThemeList';
import { useThemeList } from '@/app/store/components/theme-management/hooks/useThemeList';
import useStoreDataStore from '@/context/core/storeDataStore';
import {
  Badge,
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  Layout,
  MediaCard,
  Page,
  Spinner,
  Tabs,
  Text,
} from '@shopify/polaris';
import { MoneyFilledIcon } from '@shopify/polaris-icons';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';

export function ThemePreview() {
  const { currentStore } = useStoreDataStore();
  const customDomain = currentStore?.defaultDomain || '';
  const [selectedTab, setSelectedTab] = useState(0);
  const storeId = currentStore?.storeId || '';
  const { themes, loading } = useThemeList(storeId);

  // Encontrar el tema activo y su preview URL (HTTPS o data URI si aún no se propaga)
  const activeTheme = useMemo(() => themes.find((t: any) => t.isActive) || themes[0], [themes]);
  const activePreviewUrl = activeTheme?.previewUrl;
  const isLoadingPreview = !storeId || loading || themes.length === 0;

  const viewStore = `https://${customDomain}`;

  const handleTabChange = useCallback((index: number) => setSelectedTab(index), []);

  const tabs = [
    { id: 'preview', content: 'Vista previa' },
    { id: 'themes', content: 'Gestionar temas' },
  ];

  return (
    <Page
      title="Diseño"
      primaryAction={{
        content: 'Personalizar',
        onAction: () => {},
      }}>
      <Layout>
        <Layout.Section>
          <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange} />

          {selectedTab === 0 && (
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Tema Actual
                  </Text>
                  <div style={{ height: '280px', position: 'relative', overflow: 'hidden' }}>
                    {isLoadingPreview ? (
                      <div
                        style={{
                          height: '100%',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--p-color-bg-subdued)',
                        }}>
                        <Spinner accessibilityLabel="Cargando vista previa del tema" size="large" />
                      </div>
                    ) : activePreviewUrl ? (
                      <Image
                        src={activePreviewUrl}
                        alt={`Vista previa de ${activeTheme?.name || 'tema'}`}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Image
                        src="https://images.unsplash.com/photo-1741482529153-a98d81235d06?q=80&w=2070&auto=format&fit=crop"
                        alt="Theme preview placeholder"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <BlockStack gap="200">
                    <Layout>
                      <Layout.Section>
                        <BlockStack align="center">
                          <Text variant="headingMd" as="h2">
                            {activeTheme?.name || 'Tema'}
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
                    description="Explora nuestra colección de temas para encontrar el que mejor se adapte a tu marca.">
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
          )}

          {selectedTab === 1 && <ThemeList storeId={currentStore?.storeId || ''} />}
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Logo de la tienda
                </Text>
                <LogoUploadCard currentStore={currentStore} />
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Temas Personalizados
                </Text>
                <ThemeUploader />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function LogoUploadCard({ currentStore }: { currentStore: any }) {
  const storeLogo = currentStore?.storeLogo;
  const storeName = currentStore?.storeName;

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
          }}>
          <div style={{ position: 'relative', width: '80%', height: '80%' }}>
            <Image src={storeLogo} alt={`Logo de ${storeName}`} fill style={{ objectFit: 'contain' }} />
          </div>
        </div>
      )}

      <LogoUploader />
    </BlockStack>
  );
}
