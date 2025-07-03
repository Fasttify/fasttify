import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Icon,
  Layout,
  LegacyCard,
  LegacyStack,
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

  // Cargar estado del dominio personalizado al inicio
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
          <LegacyCard>
            <LegacyCard.Section>
              <LegacyStack distribution="equalSpacing" alignment="center">
                <LegacyStack.Item fill>
                  <Text variant="headingMd" as="h2">
                    Configura tu dominio personalizado
                  </Text>
                  <Text as="p" tone="subdued" breakWord>
                    Vincula un dominio propio o adquiere uno nuevo para darle mayor identidad y profesionalismo a tu
                    tienda.
                    <br />
                    Puedes adquirir uno en cualquier proveedor, o conectar tu dominio existente.
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
                    }}>
                    <DomainLandingPageIcon width={48} height={48} />
                    <div style={{ position: 'absolute' }}>
                      <Text variant="headingXl" as="span" fontWeight="semibold" tone="base">
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
                <Button onClick={() => setOpenCustomDomainDialog(true)}>Conectar dominio existente</Button>
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

            {/* Dominio personalizado (si existe) */}
            {customDomainStatus?.hasCustomDomain &&
              customDomainStatus?.domain &&
              !customDomainStatus.domain.endsWith('.fasttify.com') && (
                <LegacyCard.Section>
                  <LegacyStack distribution="equalSpacing" alignment="center">
                    <LegacyStack alignment="center">
                      <Icon source={GlobeIcon} tone="base" />
                      <LegacyStack vertical spacing="none">
                        <Text as="p">{customDomainStatus.domain}</Text>
                        <Text as="p" tone="subdued">
                          Dominio personalizado
                        </Text>
                      </LegacyStack>
                    </LegacyStack>
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
                  </LegacyStack>
                  {customDomainStatus.status !== 'active' && (
                    <Box paddingBlockStart="200" paddingInlineStart="400">
                      <LegacyStack vertical spacing="tight">
                        {customDomainStatus.status === 'pending' && (
                          <Text as="p" tone="subdued">
                            Para completar la configuración, necesitas configurar tu DNS:
                          </Text>
                        )}

                        {customDomainStatus.status === 'failed' && (
                          <Text as="p" tone="critical">
                            Error en la configuración del dominio. Verifica que el DNS esté configurado correctamente y
                            vuelve a intentar.
                          </Text>
                        )}

                        {/* Mostrar instrucciones DNS tanto en pending como en failed */}
                        {(customDomainStatus.status === 'pending' || customDomainStatus.status === 'failed') &&
                          customDomainStatus.cloudFrontStatus?.dnsInstructions && (
                            <LegacyCard sectioned>
                              <LegacyStack vertical spacing="tight">
                                <Text variant="headingSm" as="h4">
                                  Configuración DNS requerida
                                </Text>
                                <LegacyStack>
                                  <Box minWidth="60px">
                                    <Text as="p" variant="bodyMd" fontWeight="medium">
                                      Tipo:
                                    </Text>
                                  </Box>
                                  <Text as="p" variant="bodyMd">
                                    {customDomainStatus.cloudFrontStatus.dnsInstructions.type}
                                  </Text>
                                </LegacyStack>
                                <LegacyStack>
                                  <Box minWidth="60px">
                                    <Text as="p" variant="bodyMd" fontWeight="medium">
                                      Nombre:
                                    </Text>
                                  </Box>
                                  <LegacyStack alignment="center">
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
                                  </LegacyStack>
                                </LegacyStack>
                                <LegacyStack>
                                  <Box minWidth="60px">
                                    <Text as="p" variant="bodyMd" fontWeight="medium">
                                      Valor:
                                    </Text>
                                  </Box>
                                  <LegacyStack alignment="center">
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
                                  </LegacyStack>
                                </LegacyStack>
                                <Text as="p" variant="bodySm" tone="subdued">
                                  Los cambios DNS pueden tardar hasta 48 horas en propagarse.
                                </Text>
                              </LegacyStack>
                            </LegacyCard>
                          )}

                        <Button variant="primary" size="slim" onClick={handleVerifyDomainStatus} loading={isVerifying}>
                          {isVerifying ? 'Verificando...' : 'Verificar Estado'}
                        </Button>
                      </LegacyStack>
                    </Box>
                  )}
                </LegacyCard.Section>
              )}

            {/* Subdominio de fasttify.com */}
            <LegacyCard.Section>
              <LegacyStack distribution="equalSpacing" alignment="center">
                <LegacyStack alignment="center">
                  <Icon source={GlobeIcon} tone="base" />
                  <LegacyStack vertical spacing="none">
                    <Text as="p">{currentStore?.customDomain}</Text>
                    <Text as="p" tone="subdued">
                      {customDomainStatus?.hasCustomDomain ? 'Dominio de respaldo' : 'Dominio predeterminado'}
                    </Text>
                  </LegacyStack>
                </LegacyStack>
                <Badge tone="success" size="small">
                  Activo
                </Badge>
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
