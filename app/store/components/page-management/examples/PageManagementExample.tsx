'use client'

import { useState } from 'react'
import { Page, Layout, Card, Button, Text, ButtonGroup, BlockStack } from '@shopify/polaris'
import { PageManager } from '../pages/PageManager'

interface PageManagementExampleProps {
  storeId: string
}

type ViewMode = 'list' | 'create' | 'edit'

export function PageManagementExample({ storeId }: PageManagementExampleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>()

  const handleCreateNew = () => {
    setSelectedPageId(undefined)
    setViewMode('create')
  }

  const handleEditPage = (pageId: string) => {
    setSelectedPageId(pageId)
    setViewMode('edit')
  }

  const handleBackToList = () => {
    setSelectedPageId(undefined)
    setViewMode('list')
  }

  // Renderizar según el modo de vista
  if (viewMode === 'create') {
    return <PageManager storeId={storeId} isCreating={true} />
  }

  if (viewMode === 'edit' && selectedPageId) {
    return <PageManager storeId={storeId} pageId={selectedPageId} />
  }

  // Vista de lista con controles de ejemplo
  return (
    <Page
      title="Gestión de Páginas"
      subtitle="Administra las páginas de tu tienda"
      primaryAction={{
        content: 'Nueva página',
        onAction: handleCreateNew,
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Sistema de Gestión de Páginas
              </Text>

              <Text variant="bodyMd">
                Este es un ejemplo completo del sistema de gestión de páginas que incluye:
              </Text>

              <BlockStack gap="200">
                <Text variant="bodyMd">• ✅ Formulario completo con validación Zod</Text>
                <Text variant="bodyMd">• ✅ Componentes Polaris para UI consistente</Text>
                <Text variant="bodyMd">• ✅ Generación automática de slug desde el título</Text>
                <Text variant="bodyMd">• ✅ Validación en tiempo real de campos</Text>
                <Text variant="bodyMd">• ✅ SEO y metadatos optimizados</Text>
                <Text variant="bodyMd">• ✅ Estados de carga y manejo de errores</Text>
                <Text variant="bodyMd">• ✅ Vista previa y consejos en sidebar</Text>
              </BlockStack>

              <ButtonGroup>
                <Button onClick={handleCreateNew} variant="primary">
                  Crear nueva página
                </Button>
                <Button onClick={() => handleEditPage('example-page-1')} variant="secondary">
                  Editar página de ejemplo
                </Button>
              </ButtonGroup>
            </BlockStack>
          </Card>

          {/* Mostrar el PageManager en modo lista */}
          <PageManager storeId={storeId} />
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Características del Formulario
              </Text>

              <BlockStack gap="200">
                <Text variant="bodyMd">
                  <strong>Validación con Zod:</strong> Esquemas de validación robustos para todos
                  los campos
                </Text>

                <Text variant="bodyMd">
                  <strong>UX Optimizada:</strong> Generación automática de slug, validación en
                  tiempo real
                </Text>

                <Text variant="bodyMd">
                  <strong>SEO Ready:</strong> Campos de meta título y descripción con contadores de
                  caracteres
                </Text>

                <Text variant="bodyMd">
                  <strong>Estados Visuales:</strong> Preview del estado, visibilidad y URL en tiempo
                  real
                </Text>

                <Text variant="bodyMd">
                  <strong>Responsive:</strong> Layout optimizado para desktop y móvil
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">
                Próximos Pasos
              </Text>

              <BlockStack gap="200">
                <Text variant="bodyMd">1. Integrar con tu API de backend</Text>
                <Text variant="bodyMd">2. Implementar persistencia real de datos</Text>
                <Text variant="bodyMd">3. Añadir editor WYSIWYG para contenido</Text>
                <Text variant="bodyMd">4. Configurar rutas dinámicas en Next.js</Text>
                <Text variant="bodyMd">5. Implementar preview de páginas</Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
