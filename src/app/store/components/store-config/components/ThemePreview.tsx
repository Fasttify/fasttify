import { LogoUploader } from '@/app/store/components/store-config/components/LogoUploader';
import { ThemeList } from '@/app/store/components/theme-management/components/ThemeList';
import { useThemeList } from '@/app/store/components/theme-management/hooks/useThemeList';
import useStoreDataStore from '@/context/core/storeDataStore';
import { BlockStack, Card, Layout, MediaCard, Page, Spinner, Tabs, Text } from '@shopify/polaris';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';

export function ThemePreview() {
  const { currentStore } = useStoreDataStore();
  const [selectedTab, setSelectedTab] = useState(0);
  const storeId = currentStore?.storeId || '';
  const { themes, loading } = useThemeList(storeId);

  const activeTheme = useMemo(() => themes.find((t: any) => t.isActive) || themes[0], [themes]);
  const activePreviewUrl = activeTheme?.previewUrl;
  const isLoadingPreview = !storeId || loading || themes.length === 0;

  const handleTabChange = useCallback((index: number) => setSelectedTab(index), []);

  const tabs = [
    { id: 'preview', content: 'Vista previa' },
    { id: 'themes', content: 'Gestionar temas' },
  ];

  return (
    <Page title="Diseño">
      <Layout>
        <Layout.Section variant="fullWidth">
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
                      </Layout.Section>
                      <Layout.Section variant="oneThird"> </Layout.Section>
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
                    size="small"
                    title="Explorar otros temas"
                    primaryAction={{
                      content: 'Ver temas',
                      url: '/themes',
                      target: '_blank',
                      external: true,
                      accessibilityLabel: 'Ver temas disponibles',
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
