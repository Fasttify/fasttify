import { useState, useCallback } from 'react';
import { Modal, Tabs, Button, DropZone, BlockStack, Text, Banner, Toast, Tooltip, InlineStack } from '@shopify/polaris';
import Image from 'next/image';
import { useLogoUpload } from '@/app/store/hooks/storage/useLogoUpload';
import { useUserStoreData } from '@/app/(setup)/first-steps/hooks/useUserStoreData';
import useStoreDataStore from '@/context/core/storeDataStore';
import { InfoIcon } from '@shopify/polaris-icons';

export function LogoUploader() {
  const [active, setActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState('');
  const [toastError, setToastError] = useState(false);

  const { uploadLogo, status, error, reset } = useLogoUpload();
  const { updateUserStore } = useUserStoreData();
  const { currentStore, isLoading: isStoreLoading } = useStoreDataStore();
  const storeLogo = currentStore?.storeLogo;
  const storeFavicon = currentStore?.storeFavicon;
  const storeId = currentStore?.storeId;

  const handleTabChange = useCallback((index: number) => setSelectedTab(index), []);
  const toggleActive = useCallback(() => {
    setActive((prev) => !prev);

    if (active) {
      setLogoFile(null);
      setFaviconFile(null);
    }
  }, [active]);

  const handleLogoDrop = useCallback((_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
    setLogoFile(acceptedFiles[0]);
  }, []);

  const handleFaviconDrop = useCallback((_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
    setFaviconFile(acceptedFiles[0]);
  }, []);

  const showToast = (content: string, isError = false) => {
    setToastContent(content);
    setToastError(isError);
    setToastActive(true);
  };

  const handleSave = async (type: 'logo' | 'favicon') => {
    const file = type === 'logo' ? logoFile : faviconFile;
    const field = type === 'logo' ? 'storeLogo' : 'storeFavicon';

    if (!file) {
      showToast(`No se ha seleccionado un ${type}`, true);
      return;
    }

    if (!storeId) {
      showToast('No se pudo identificar la tienda', true);
      return;
    }

    try {
      const result = await uploadLogo(file, type);
      if (result) {
        await updateUserStore({
          storeId: storeId,
          [field]: result.url,
        });
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} subido correctamente`);
        toggleActive();
      }
    } catch (_err) {
      showToast(`Error al subir el ${type}`, true);
    } finally {
      reset();
    }
  };

  const logoUrl = logoFile ? window.URL.createObjectURL(logoFile) : storeLogo;
  const faviconUrl = faviconFile ? window.URL.createObjectURL(faviconFile) : storeFavicon;

  const tabs = [
    { id: 'logo', content: 'Logo' },
    { id: 'favicon', content: 'Favicon' },
  ];

  const activator = (
    <Button onClick={toggleActive} loading={isStoreLoading}>
      Subir logo
    </Button>
  );

  const toastMarkup = toastActive ? (
    <Toast content={toastContent} error={toastError} onDismiss={() => setToastActive(false)} />
  ) : null;

  return (
    <>
      <Modal
        activator={activator}
        open={active}
        onClose={toggleActive}
        title="Identidad de tu tienda"
        primaryAction={{
          content: `Guardar ${selectedTab === 0 ? 'logo' : 'favicon'}`,
          onAction: () => handleSave(selectedTab === 0 ? 'logo' : 'favicon'),
          loading: status === 'uploading',
          disabled:
            (selectedTab === 0 && !logoFile) ||
            (selectedTab === 1 && !faviconFile) ||
            status === 'success' ||
            isStoreLoading ||
            status === 'uploading',
        }}
        secondaryActions={[
          {
            content: 'Cancelar',
            onAction: toggleActive,
            disabled: isStoreLoading || status === 'uploading' || status === 'success',
          },
        ]}>
        <Modal.Section>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <Text as="p" tone="subdued">
                Personaliza la identidad visual de tu tienda con un logo y favicon personalizados.
              </Text>
              <Tooltip
                content={
                  selectedTab === 0
                    ? 'Formato recomendado: PNG o WebP\nTamaño: 400x400px\nTamaño máximo: 2MB\nFondo transparente preferido'
                    : 'Formato recomendado: ICO o PNG\nTamaño: 32x32px o 16x16px\nSin fondo o fondo transparente'
                }>
                <Button variant="plain" icon={InfoIcon} accessibilityLabel="Información de formato" />
              </Tooltip>
            </InlineStack>

            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange} />

            {selectedTab === 0 && (
              <BlockStack gap="200">
                <Text as="p" tone="subdued">
                  Recomendamos una imagen de 400x400px o mayor.
                </Text>
                <DropZone onDrop={handleLogoDrop} allowMultiple={false} variableHeight accept="image/*" type="image">
                  {logoUrl ? (
                    <BlockStack gap="100" inlineAlign="center">
                      <div
                        style={{
                          width: '80px',
                          height: '80px',
                          position: 'relative',
                          borderRadius: 'var(--p-border-radius-200)',
                          overflow: 'hidden',
                        }}>
                        <Image src={logoUrl} alt="Logo preview" fill style={{ objectFit: 'contain' }} />
                      </div>
                      <Button onClick={() => setLogoFile(null)} variant="plain">
                        Cambiar
                      </Button>
                    </BlockStack>
                  ) : (
                    <DropZone.FileUpload actionTitle="Seleccionar archivo" actionHint="o arrastra y suelta" />
                  )}
                </DropZone>
              </BlockStack>
            )}

            {selectedTab === 1 && (
              <BlockStack gap="200">
                <Text as="p" tone="subdued">
                  Recomendamos una imagen cuadrada de 32x32px.
                </Text>
                <DropZone onDrop={handleFaviconDrop} allowMultiple={false} variableHeight accept="image/*" type="image">
                  {faviconUrl ? (
                    <BlockStack gap="100" inlineAlign="center">
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          position: 'relative',
                          borderRadius: 'var(--p-border-radius-200)',
                          overflow: 'hidden',
                        }}>
                        <Image src={faviconUrl} alt="Favicon preview" fill style={{ objectFit: 'contain' }} />
                      </div>
                      <Button onClick={() => setFaviconFile(null)} variant="plain">
                        Cambiar
                      </Button>
                    </BlockStack>
                  ) : (
                    <DropZone.FileUpload actionTitle="Seleccionar archivo" actionHint="o arrastra y suelta" />
                  )}
                </DropZone>
              </BlockStack>
            )}

            {error && (
              <Banner title="Error de subida" tone="critical">
                <p>{error}</p>
              </Banner>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>
      {toastMarkup}
    </>
  );
}
