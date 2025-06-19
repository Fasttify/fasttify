'use client'

import { useState } from 'react'
import { Page, Layout, Card, Button, Text, Modal } from '@shopify/polaris'
import { PlusIcon } from '@shopify/polaris-icons'
import { NavigationMenuList } from '@/app/store/components/navigation-management/components/NavigationMenuList'
import { NavigationMenuForm } from '@/app/store/components/navigation-management/components/NavigationMenuForm'
import { NavigationManagerProps } from '@/app/store/components/navigation-management/types'
import { useNavigationMenus } from '@/app/store/hooks/data/useNavigationMenus'
import { useStore } from '@/app/store/hooks/data/useStore'
import { useToast } from '@/app/store/context/ToastContext'

/**
 * Componente principal para la gestión de menús de navegación
 */
export function NavigationManager({ storeId }: NavigationManagerProps) {
  const { store } = useStore(storeId)
  const { useDeleteNavigationMenu } = useNavigationMenus()
  const { showToast } = useToast()

  // Estados del componente
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Obtener dominio de la tienda
  const domain = store?.customDomain || `${store?.storeName}.fasttify.com`

  // Mutación para eliminar
  const deleteMenuMutation = useDeleteNavigationMenu()

  // Funciones para manejar acciones
  const handleCreateMenu = () => {
    setShowCreateModal(true)
  }

  const handleEditMenu = (menuId: string) => {
    setSelectedMenuId(menuId)
    setShowEditModal(true)
  }

  const handleDeleteMenu = (menuId: string) => {
    setSelectedMenuId(menuId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedMenuId) return

    try {
      await deleteMenuMutation.mutateAsync(selectedMenuId)
      showToast('Menú eliminado exitosamente')
      setShowDeleteModal(false)
      setSelectedMenuId(null)
    } catch (error) {
      showToast('Error al eliminar el menú', true)
    }
  }

  const handleFormSuccess = (message: string) => {
    showToast(message)
    setShowCreateModal(false)
    setShowEditModal(false)
    setSelectedMenuId(null)
  }

  const handleModalClose = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setSelectedMenuId(null)
  }

  return (
    <Page title="Navegación" subtitle="Gestiona los menús de navegación de tu tienda" fullWidth>
      <Layout>
        <Layout.Section>
          <Card>
            <div className="flex justify-between items-center mb-6">
              <div>
                <Text variant="headingMd" as="h2">
                  Menús de navegación
                </Text>
                <Text variant="bodyMd" tone="subdued" as="p">
                  Gestiona los menús de navegación de tu tienda
                </Text>
              </div>
              <Button variant="primary" icon={PlusIcon} onClick={handleCreateMenu}>
                Crear menú
              </Button>
            </div>

            <NavigationMenuList
              storeId={storeId}
              onEdit={handleEditMenu}
              onDelete={handleDeleteMenu}
            />
          </Card>
        </Layout.Section>
      </Layout>

      {/* Modal para crear menú */}
      <Modal
        open={showCreateModal}
        onClose={handleModalClose}
        title="Crear nuevo menú"
        size="large"
      >
        <Modal.Section>
          <NavigationMenuForm
            storeId={storeId}
            domain={domain}
            onSuccess={handleFormSuccess}
            onCancel={handleModalClose}
          />
        </Modal.Section>
      </Modal>

      {/* Modal para editar menú */}
      <Modal open={showEditModal} onClose={handleModalClose} title="Editar menú" size="large">
        <Modal.Section>
          {selectedMenuId && (
            <NavigationMenuForm
              storeId={storeId}
              domain={domain}
              menuId={selectedMenuId}
              onSuccess={handleFormSuccess}
              onCancel={handleModalClose}
            />
          )}
        </Modal.Section>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar menú"
        primaryAction={{
          content: 'Eliminar',
          destructive: true,
          loading: deleteMenuMutation.isPending,
          onAction: confirmDelete,
        }}
        secondaryActions={[
          {
            content: 'Cancelar',
            onAction: () => setShowDeleteModal(false),
          },
        ]}
      >
        <Modal.Section>
          <Text variant="bodyMd" as="p">
            ¿Estás seguro de que quieres eliminar este menú? Esta acción no se puede deshacer.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  )
}
