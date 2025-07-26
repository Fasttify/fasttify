import {
  Badge,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Card,
  Icon,
  InlineStack,
  Layout,
  Loading,
  Page,
  Text,
  TextField,
} from '@shopify/polaris';
import {
  ClipboardIcon,
  DomainLandingPageIcon,
  GlobeIcon,
  MarketsIcon,
  SearchIcon,
  StoreIcon,
} from '@shopify/polaris-icons';
import { useEffect, useState } from 'react';

import { AutomatedCustomDomainDialog } from '@/app/store/components/domains/components/AutomatedCustomDomainDialog';
import { ChangeDomainDialog } from '@/app/store/components/domains/components/ChangeDomainDialog';
import { EditStoreProfileDialog } from '@/app/store/components/domains/components/EditStoreProfileDialog';
import { useCustomDomain } from '@/app/store/hooks/api/useCustomDomain';
import useStoreDataStore from '@/context/core/storeDataStore';

export function DomainManagement() {
  const { currentStore, isLoading } = useStoreDataStore();
  const [openChangeDomainDialog, setOpenChangeDomainDialog] = useState(false);
  const [openEditProfileDialog, setOpenEditProfileDialog] = useState(false);
  const [openCustomDomainDialog, setOpenCustomDomainDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    status: customDomainStatus,
    getCustomDomainStatus,
    verifyCustomDomainStatus,
  } = useCustomDomain(currentStore?.storeId ?? '');

  const [customDomainLoaded, setCustomDomainLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (currentStore?.storeId && !customDomainLoaded) {
      getCustomDomainStatus();
      setCustomDomainLoaded(true);
    }
  }, [currentStore?.storeId, customDomainLoaded, getCustomDomainStatus]);

  const handleVerifyDomainStatus = async () => {
    setIsVerifying(true);
    try {
      await verifyCustomDomainStatus();
      await getCustomDomainStatus();
    } catch (error) {
      console.error('Error verifying domain status:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }
  return (
    <Page title="Configuración de Tienda" fullWidth>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="0">
              <InlineStack align="space-between">
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">
                    Configura tu dominio personalizado
                  </Text>
                  <Text as="p" tone="subdued" breakWord>
                    Vincula un dominio propio o adquiere uno nuevo para darle mayor identidad y profesionalismo a tu
                    tienda.
                    <br />
                    Puedes adquirir uno en cualquier proveedor, o conectar tu dominio existente.
                  </Text>
                </BlockStack>
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
                    }}>
                    <DomainLandingPageIcon width={48} height={48} />
                    <div style={{ position: 'absolute' }}>
                      <Text variant="headingXl" as="span" fontWeight="semibold" tone="base">
                        www
                      </Text>
                    </div>
                  </div>
                </Box>
              </InlineStack>
              <ButtonGroup>
                <Button variant="primary">Comprar dominio</Button>
                <Button onClick={() => setOpenCustomDomainDialog(true)}>Conectar dominio existente</Button>
              </ButtonGroup>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon source={StoreIcon} tone="base" />
                  <Text as="p">{currentStore?.storeName}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Icon source={MarketsIcon} tone="base" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    <Text as="p">Dirección de facturación</Text>
                    <Text as="p" tone="subdued">
                      Colombia
                    </Text>
                  </div>
                </div>
              </div>
              <Button variant="plain" onClick={() => setOpenEditProfileDialog(true)}>
                Editar detalles de la tienda
              </Button>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <TextField
                label="Buscar dominios"
                labelHidden
                value={searchQuery}
                onChange={setSearchQuery}
                prefix={<Icon source={SearchIcon} tone="base" />}
                placeholder="Buscar dominios"
                autoComplete="off"
              />

              {/* Dominio personalizado (si existe) */}
              {customDomainStatus?.hasCustomDomain &&
                customDomainStatus?.domain &&
                !customDomainStatus.domain.endsWith('.fasttify.com') && (
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <InlineStack align="center">
                        <Icon source={GlobeIcon} tone="base" />
                        <BlockStack gap="0">
                          <Text as="p">{customDomainStatus.domain}</Text>
                          <Text as="p" tone="subdued">
                            Dominio personalizado
                          </Text>
                        </BlockStack>
                      </InlineStack>
                      <Badge
                        tone={
                          customDomainStatus.status === 'active'
                            ? 'success'
                            : customDomainStatus.status === 'pending'
                              ? 'warning'
                              : 'critical'
                        }
                        size="small">
                        {customDomainStatus.status === 'active'
                          ? 'Activo'
                          : customDomainStatus.status === 'pending'
                            ? 'Pendiente'
                            : 'Error'}
                      </Badge>
                    </InlineStack>
                    {customDomainStatus.status !== 'active' && (
                      <Box paddingBlockStart="200" paddingInlineStart="400">
                        <BlockStack gap="400">
                          {customDomainStatus.status === 'pending' && (
                            <Text as="p" tone="subdued">
                              Para completar la configuración, necesitas configurar tu DNS:
                            </Text>
                          )}

                          {customDomainStatus.status === 'failed' && (
                            <Text as="p" tone="critical">
                              Error en la configuración del dominio. Verifica que el DNS esté configurado correctamente
                              y vuelve a intentar.
                            </Text>
                          )}

                          {/* Mostrar instrucciones DNS tanto en pending como en failed */}
                          {(customDomainStatus.status === 'pending' || customDomainStatus.status === 'failed') &&
                            customDomainStatus.cloudFrontStatus?.dnsInstructions && (
                              <Card>
                                <BlockStack gap="400">
                                  <Text variant="headingSm" as="h4">
                                    Configuración DNS requerida
                                  </Text>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <Box minWidth="60px">
                                      <Text as="p" variant="bodyMd" fontWeight="medium">
                                        Tipo:
                                      </Text>
                                    </Box>
                                    <Text as="p" variant="bodyMd">
                                      {customDomainStatus.cloudFrontStatus.dnsInstructions.type}
                                    </Text>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <Box minWidth="60px">
                                      <Text as="p" variant="bodyMd" fontWeight="medium">
                                        Nombre:
                                      </Text>
                                    </Box>
                                    <Text as="p" variant="bodyMd">
                                      {customDomainStatus.cloudFrontStatus.dnsInstructions.name}
                                    </Text>
                                    <Button
                                      size="micro"
                                      icon={ClipboardIcon}
                                      onClick={() =>
                                        navigator.clipboard.writeText(
                                          customDomainStatus.cloudFrontStatus?.dnsInstructions?.name ?? ''
                                        )
                                      }
                                    />
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <Box minWidth="60px">
                                      <Text as="p" variant="bodyMd" fontWeight="medium">
                                        Valor:
                                      </Text>
                                    </Box>
                                    <Text as="p" variant="bodyMd">
                                      {customDomainStatus.cloudFrontStatus.dnsInstructions.value}
                                    </Text>
                                    <Button
                                      size="micro"
                                      icon={ClipboardIcon}
                                      onClick={() =>
                                        navigator.clipboard.writeText(
                                          customDomainStatus.cloudFrontStatus?.dnsInstructions?.value ?? ''
                                        )
                                      }
                                    />
                                  </div>
                                  <Text as="p" variant="bodySm" tone="subdued">
                                    Los cambios DNS pueden tardar hasta 48 horas en propagarse.
                                  </Text>
                                </BlockStack>
                              </Card>
                            )}

                          <Button
                            variant="primary"
                            size="slim"
                            onClick={handleVerifyDomainStatus}
                            loading={isVerifying}>
                            {isVerifying ? 'Verificando...' : 'Verificar Estado'}
                          </Button>
                        </BlockStack>
                      </Box>
                    )}
                  </BlockStack>
                )}

              {/* Subdominio de fasttify.com */}
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <InlineStack align="start" gap="200">
                    <Icon source={GlobeIcon} tone="base" />
                    <BlockStack gap="0">
                      <Text as="p">{currentStore?.defaultDomain}</Text>
                      <Text as="p" tone="subdued">
                        {customDomainStatus?.hasCustomDomain ? 'Dominio de respaldo' : 'Dominio predeterminado'}
                      </Text>
                    </BlockStack>
                  </InlineStack>
                  <Badge tone="success" size="small">
                    Activo
                  </Badge>
                </InlineStack>
                <Box paddingBlockStart="0" paddingInlineStart="100">
                  <Button variant="plain" onClick={() => setOpenChangeDomainDialog(true)}>
                    Cambiar a un nuevo subdominio
                  </Button>
                </Box>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      <ChangeDomainDialog
        open={openChangeDomainDialog}
        onOpenChange={setOpenChangeDomainDialog}
        storeId={currentStore?.storeId ?? ''}
      />

      <EditStoreProfileDialog
        open={openEditProfileDialog}
        onOpenChange={setOpenEditProfileDialog}
        storeId={currentStore?.storeId ?? ''}
        initialData={{
          storeName: currentStore?.storeName,
          contactEmail: currentStore?.contactEmail ?? '',
          contactPhone: currentStore?.contactPhone ?? '',
          storeAdress: currentStore?.storeAdress ?? '',
          storeDescription: currentStore?.storeDescription ?? '',
          storeCurrency: currentStore?.storeCurrency ?? '',
          currencyFormat: currentStore?.currencyFormat ?? '',
          currencyLocale: currentStore?.currencyLocale ?? '',
          currencyDecimalPlaces: currentStore?.currencyDecimalPlaces ?? 0,
        }}
      />

      <AutomatedCustomDomainDialog
        open={openCustomDomainDialog}
        onOpenChange={setOpenCustomDomainDialog}
        storeId={currentStore?.storeId ?? ''}
        onDomainUpdated={() => {
          getCustomDomainStatus();
        }}
      />
    </Page>
  );
}
