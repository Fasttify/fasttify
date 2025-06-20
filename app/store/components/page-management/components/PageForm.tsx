'use client'

import { useCallback } from 'react'
import {
  Card,
  FormLayout,
  TextField,
  Select,
  Checkbox,
  Layout,
  Page,
  Text,
  BlockStack,
  Divider,
} from '@shopify/polaris'
import { usePageForm } from '../hooks/usePageForm'
import type { IPage, PageFormValues } from '../types/page-types'

interface PageFormProps {
  storeId: string
  initialPage?: IPage
  onSave: (data: PageFormValues) => Promise<boolean>
  onCancel: () => void
  isEditing?: boolean
}

const statusOptions = [
  { label: 'Borrador', value: 'draft' },
  { label: 'Activa', value: 'active' },
  { label: 'Inactiva', value: 'inactive' },
]

export function PageForm({
  storeId,
  initialPage,
  onSave,
  onCancel,
  isEditing = false,
}: PageFormProps) {
  const { formData, isLoading, isValid, updateField, handleSubmit } = usePageForm({
    initialPage,
    onSubmit: onSave,
    onCancel,
  })

  // Manejar cambio del título
  const handleTitleChange = useCallback(
    (value: string) => {
      updateField('title', value)
    },
    [updateField]
  )

  const pageTitle = isEditing ? 'Editar página' : 'Nueva página'
  const submitButtonText = isEditing ? 'Actualizar página' : 'Crear página'

  return (
    <Page
      title={pageTitle}
      backAction={{
        content: 'Páginas',
        onAction: onCancel,
      }}
      primaryAction={{
        content: submitButtonText,
        onAction: handleSubmit,
        loading: isLoading,
        disabled: !isValid,
      }}
      secondaryActions={[
        {
          content: 'Cancelar',
          onAction: onCancel,
          disabled: isLoading,
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Información básica */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Información básica
                </Text>

                <FormLayout>
                  <TextField
                    label="Título"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="Ingresa el título de la página"
                    autoComplete="off"
                    requiredIndicator
                    helpText="Este es el único campo requerido para crear la página"
                  />

                  <TextField
                    label="Contenido (opcional)"
                    value={formData.content}
                    onChange={value => updateField('content', value)}
                    multiline={6}
                    placeholder="Escribe el contenido de tu página aquí..."
                    autoComplete="off"
                    helpText="Puedes agregar contenido ahora o editarlo después"
                  />
                </FormLayout>
              </BlockStack>
            </Card>

            {/* Configuración opcional */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Configuración (opcional)
                </Text>

                <FormLayout>
                  <FormLayout.Group>
                    <Select
                      label="Estado"
                      options={statusOptions}
                      value={formData.status}
                      onChange={value => updateField('status', value as any)}
                    />

                    <TextField
                      label="Slug personalizado"
                      value={formData.slug}
                      onChange={value => updateField('slug', value)}
                      placeholder="Se genera automáticamente desde el título"
                      autoComplete="off"
                      helpText="Déjalo vacío para generar automáticamente"
                    />
                  </FormLayout.Group>

                  <Checkbox
                    label="Página visible en navegación"
                    checked={formData.isVisible}
                    onChange={checked => updateField('isVisible', checked)}
                  />
                </FormLayout>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        {/* Sidebar simplificado */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Vista previa
              </Text>

              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">
                  <strong>URL de la página:</strong>
                </Text>
                <Text variant="bodyMd" as="p">
                  {`/pages/${formData.slug || 'slug-generado-automaticamente'}`}
                </Text>
              </BlockStack>

              <Divider />

              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">
                  <strong>Estado:</strong>
                </Text>
                <Text variant="bodyMd" as="p">
                  {statusOptions.find(opt => opt.value === formData.status)?.label}
                </Text>
              </BlockStack>

              <Divider />

              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">
                  <strong>Visibilidad:</strong>
                </Text>
                <Text variant="bodyMd" as="p">
                  {formData.isVisible ? 'Visible en navegación' : 'Oculta en navegación'}
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>

          {/* Consejos simples */}
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Consejos
              </Text>

              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">
                  Solo necesitas un título para crear la página. Todo lo demás es opcional.
                </Text>

                <Text variant="bodyMd" as="p">
                  El slug se genera automáticamente desde el título si no especificas uno.
                </Text>

                <Text variant="bodyMd" as="p">
                  Puedes editar el contenido y configuración después de crear la página.
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
