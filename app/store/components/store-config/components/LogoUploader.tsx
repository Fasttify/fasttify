import { useState, useCallback } from 'react'
import {
  Modal,
  Tabs,
  Button,
  DropZone,
  LegacyStack,
  Text,
  Thumbnail,
  Banner,
  Toast,
  Tooltip,
  InlineStack,
} from '@shopify/polaris'
import { useLogoUpload } from '@/app/store/hooks/storage/useLogoUpload'
import { useUserStoreData } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData'
import useStoreDataStore from '@/context/core/storeDataStore'
import { InfoIcon } from '@shopify/polaris-icons'

export function LogoUploader() {
  const [active, setActive] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [toastActive, setToastActive] = useState(false)
  const [toastContent, setToastContent] = useState('')
  const [toastError, setToastError] = useState(false)

  const { uploadLogo, status, error, reset } = useLogoUpload()
  const { updateUserStore } = useUserStoreData()
  const { currentStore, isLoading: isStoreLoading } = useStoreDataStore()
  const storeLogo = currentStore?.storeLogo
  const storeFavicon = currentStore?.storeFavicon
  const storeId = currentStore?.storeId

  const handleTabChange = useCallback((index: number) => setSelectedTab(index), [])
  const toggleActive = useCallback(() => {
    setActive(prev => !prev)

    if (active) {
      setLogoFile(null)
      setFaviconFile(null)
    }
  }, [active])

  const handleLogoDrop = useCallback(
    (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
      setLogoFile(acceptedFiles[0])
    },
    []
  )

  const handleFaviconDrop = useCallback(
    (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
      setFaviconFile(acceptedFiles[0])
    },
    []
  )

  const showToast = (content: string, isError = false) => {
    setToastContent(content)
    setToastError(isError)
    setToastActive(true)
  }

  const handleSave = async (type: 'logo' | 'favicon') => {
    const file = type === 'logo' ? logoFile : faviconFile
    const field = type === 'logo' ? 'storeLogo' : 'storeFavicon'

    if (!file) {
      showToast(`No se ha seleccionado un ${type}`, true)
      return
    }

    if (!storeId) {
      showToast('No se pudo identificar la tienda', true)
      return
    }

    try {
      const result = await uploadLogo(file, type)
      if (result) {
        await updateUserStore({
          storeId: storeId,
          [field]: result.url,
        })
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} subido correctamente`)
        toggleActive()
      }
    } catch (err) {
      showToast(`Error al subir el ${type}`, true)
    } finally {
      reset()
    }
  }

  const logoUrl = logoFile ? window.URL.createObjectURL(logoFile) : storeLogo
  const faviconUrl = faviconFile ? window.URL.createObjectURL(faviconFile) : storeFavicon

  const tabs = [
    { id: 'logo', content: 'Logo' },
    { id: 'favicon', content: 'Favicon' },
  ]

  const activator = (
    <Button onClick={toggleActive} loading={isStoreLoading}>
      Subir logo
    </Button>
  )

  const toastMarkup = toastActive ? (
    <Toast content={toastContent} error={toastError} onDismiss={() => setToastActive(false)} />
  ) : null

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
            status === 'success',
        }}
        secondaryActions={[
          {
            content: 'Cancelar',
            onAction: toggleActive,
          },
        ]}
      >
        <Modal.Section>
          <LegacyStack vertical spacing="loose">
            <InlineStack align="space-between" blockAlign="center">
              <Text as="p" tone="subdued">
                Personaliza la identidad visual de tu tienda con un logo y favicon personalizados.
              </Text>
              <Tooltip
                content={
                  selectedTab === 0
                    ? 'Formato recomendado: PNG o WebP\nTamaño: 400x400px\nTamaño máximo: 2MB\nFondo transparente preferido'
                    : 'Formato recomendado: ICO o PNG\nTamaño: 32x32px o 16x16px\nSin fondo o fondo transparente'
                }
              >
                <Button
                  variant="plain"
                  icon={InfoIcon}
                  accessibilityLabel="Información de formato"
                />
              </Tooltip>
            </InlineStack>

            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange} />

            {selectedTab === 0 && (
              <LegacyStack vertical spacing="baseTight">
                <Text as="p" tone="subdued">
                  Recomendamos una imagen de 400x400px o mayor.
                </Text>
                <DropZone onDrop={handleLogoDrop} allowMultiple={false} variableHeight>
                  {logoUrl ? (
                    <LegacyStack alignment="center" vertical spacing="extraTight">
                      <Thumbnail source={logoUrl} alt="Logo preview" size="medium" />
                      <Button onClick={() => setLogoFile(null)} variant="plain">
                        Cambiar
                      </Button>
                    </LegacyStack>
                  ) : (
                    <DropZone.FileUpload
                      actionTitle="Seleccionar archivo"
                      actionHint="o arrastra y suelta"
                    />
                  )}
                </DropZone>
              </LegacyStack>
            )}

            {selectedTab === 1 && (
              <LegacyStack vertical spacing="baseTight">
                <Text as="p" tone="subdued">
                  Recomendamos una imagen cuadrada de 32x32px.
                </Text>
                <DropZone onDrop={handleFaviconDrop} allowMultiple={false} variableHeight>
                  {faviconUrl ? (
                    <LegacyStack alignment="center" vertical spacing="extraTight">
                      <Thumbnail source={faviconUrl} alt="Favicon preview" size="small" />
                      <Button onClick={() => setFaviconFile(null)} variant="plain">
                        Cambiar
                      </Button>
                    </LegacyStack>
                  ) : (
                    <DropZone.FileUpload
                      actionTitle="Seleccionar archivo"
                      actionHint="o arrastra y suelta"
                    />
                  )}
                </DropZone>
              </LegacyStack>
            )}

            {error && (
              <Banner title="Error de subida" tone="critical">
                <p>{error}</p>
              </Banner>
            )}
          </LegacyStack>
        </Modal.Section>
      </Modal>
      {toastMarkup}
    </>
  )
}
