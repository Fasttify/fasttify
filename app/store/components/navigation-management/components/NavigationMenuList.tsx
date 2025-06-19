'use client'

import {
  Card,
  DataTable,
  Badge,
  Button,
  ButtonGroup,
  Text,
  Loading,
  EmptyState,
  Banner,
} from '@shopify/polaris'
import { useNavigationMenus, generateMenuItemURL } from '@/app/store/hooks/data/useNavigationMenus'
import { NavigationMenuListProps } from '@/app/store/components/navigation-management/types'

/**
 * Componente para mostrar la lista de menús de navegación
 */
export function NavigationMenuList({ storeId, onEdit, onDelete, onView }: NavigationMenuListProps) {
  const { useListNavigationMenus, parseMenuData } = useNavigationMenus()

  // Obtener menús de la tienda
  const { data: menus = [], isLoading, error } = useListNavigationMenus(storeId)

  // Preparar datos para la tabla
  const tableRows = menus.map(menu => {
    const menuItems = parseMenuData((menu.menuData as string) || '[]')

    return [
      <Text key={`name-${menu.id}`} variant="bodyMd" fontWeight="semibold" as="span">
        {menu.name}
      </Text>,
      <Text key={`handle-${menu.id}`} variant="bodyMd" tone="subdued" as="span">
        {menu.handle}
      </Text>,
      <Badge key={`type-${menu.id}`} tone={menu.isMain ? 'success' : 'info'}>
        {menu.isMain ? 'Principal' : 'Secundario'}
      </Badge>,
      <Text key={`items-${menu.id}`} variant="bodyMd" as="span">
        {menuItems.length} elementos
      </Text>,
      <Badge key={`status-${menu.id}`} tone={menu.isActive ? 'success' : 'critical'}>
        {menu.isActive ? 'Activo' : 'Inactivo'}
      </Badge>,
      <ButtonGroup key={`actions-${menu.id}`} variant="segmented">
        {onView && (
          <Button
            size="micro"
            onClick={() => onView(menu.id)}
            accessibilityLabel={`Ver ${menu.name}`}
          >
            Ver
          </Button>
        )}
        {onEdit && (
          <Button
            size="micro"
            onClick={() => onEdit(menu.id)}
            accessibilityLabel={`Editar ${menu.name}`}
          >
            Editar
          </Button>
        )}
        {onDelete && (
          <Button
            size="micro"
            variant="primary"
            tone="critical"
            onClick={() => onDelete(menu.id)}
            accessibilityLabel={`Eliminar ${menu.name}`}
          >
            Eliminar
          </Button>
        )}
      </ButtonGroup>,
    ]
  })

  const tableHeadings = ['Nombre', 'Handle', 'Tipo', 'Elementos', 'Estado', 'Acciones']

  // Estado de carga
  if (isLoading) {
    return (
      <Card>
        <div className="p-4 space-y-4">
          <Loading />
        </div>
      </Card>
    )
  }

  // Estado de error
  if (error) {
    return (
      <Card>
        <Banner tone="critical" title="Error al cargar los menús">
          <p>{error.message}</p>
        </Banner>
      </Card>
    )
  }

  // Estado vacío
  if (menus.length === 0) {
    return (
      <Card>
        <EmptyState heading="No hay menús de navegación" image="/images/empty-navigation.svg">
          <p>
            Los menús de navegación ayudan a tus clientes a encontrar productos y páginas
            importantes en tu tienda.
          </p>
        </EmptyState>
      </Card>
    )
  }

  // Tabla con menús
  return (
    <Card>
      <DataTable
        columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
        headings={tableHeadings}
        rows={tableRows}
        verticalAlign="middle"
      />
    </Card>
  )
}
