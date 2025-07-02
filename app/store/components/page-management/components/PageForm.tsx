'use client';

import { useCallback } from 'react';
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
} from '@shopify/polaris';
import { usePageForm } from '@/app/store/components/page-management/hooks/usePageForm';
import type { Page as IPage, PageFormValues } from '@/app/store/components/page-management/types/page-types';

interface PageFormProps {
  storeId: string;
  initialPage?: IPage;
  onSave: (data: PageFormValues) => Promise<boolean>;
  onCancel: () => void;
  isEditing: boolean;
  generateSlug: (title: string) => string;
}

const statusOptions = [
  { label: 'Borrador', value: 'draft' },
  { label: 'Publicada', value: 'published' },
];

export function PageForm({ storeId, initialPage, onSave, onCancel, isEditing, generateSlug }: PageFormProps) {
  const { formData, errors, isLoading, isDirty, updateField, handleSubmit } = usePageForm({
    initialPage,
    onSubmit: onSave,
    generateSlug,
    storeId,
    isEditing,
  });

  const handleTitleChange = useCallback(
    (value: string) => {
      updateField('title', value);
    },
    [updateField]
  );

  const pageTitle = isEditing ? 'Editar página' : 'Nueva página';
  const submitButtonText = isEditing ? 'Actualizar página' : 'Crear página';

  // El botón está deshabilitado si se está editando y no hay cambios (isDirty es false)
  const isButtonDisabled = isEditing ? !isDirty : false;

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
        disabled: isLoading || isButtonDisabled,
      }}
      secondaryActions={[
        {
          content: 'Cancelar',
          onAction: onCancel,
          disabled: isLoading,
        },
      ]}>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
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
                    error={errors.title}
                  />

                  <TextField
                    label="Contenido"
                    value={formData.content}
                    onChange={(value) => updateField('content', value)}
                    multiline={6}
                    placeholder="Escribe el contenido de tu página aquí..."
                    autoComplete="off"
                    error={errors.content}
                  />
                </FormLayout>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Configuración
                </Text>

                <FormLayout>
                  <FormLayout.Group>
                    <Select
                      label="Estado"
                      options={statusOptions}
                      value={formData.status}
                      onChange={(value) => updateField('status', value as any)}
                      error={errors.status}
                    />

                    <TextField
                      label="Slug personalizado"
                      value={formData.slug}
                      onChange={(value) => updateField('slug', value)}
                      placeholder="Se genera automáticamente desde el título"
                      autoComplete="off"
                      helpText="Déjalo vacío para generar automáticamente"
                      error={errors.slug}
                    />
                  </FormLayout.Group>

                  <Checkbox
                    label="Página visible en navegación"
                    checked={formData.isVisible}
                    onChange={(checked) => updateField('isVisible', checked)}
                    error={errors.isVisible}
                  />
                </FormLayout>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

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
                  {`/pages/${formData.slug || '...'}`}
                </Text>
              </BlockStack>

              <Divider />

              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">
                  <strong>Estado:</strong>
                </Text>
                <Text variant="bodyMd" as="p">
                  {statusOptions.find((opt) => opt.value === formData.status)?.label}
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
