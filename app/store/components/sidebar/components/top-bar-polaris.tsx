'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { TopBar, ActionList, SkeletonThumbnail, SkeletonBodyText } from '@shopify/polaris'
import { ExitIcon } from '@shopify/polaris-icons'
import { useRouter } from 'next/navigation'
import { generateSearchRoutes } from '@/app/store/components/search-bar/components/SearchRoutes'
import { useAuth } from '@/context/hooks/useAuth'
import useStoreDataStore from '@/context/core/storeDataStore'
import useUserStore from '@/context/core/userStore'
import { ChatTrigger } from '@/app/store/components/ai-chat/components/ChatTrigger'
import { NotificationPopover } from '@/app/store/components/notifications/components/NotificationPopover'

interface TopBarPolarisProps {
  storeId: string
  onNavigationToggle?: () => void
}

export function TopBarPolaris({ storeId, onNavigationToggle }: TopBarPolarisProps) {
  const router = useRouter()
  const { user, loading } = useUserStore()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [isClient, setIsClient] = useState(false)
  const { clearStore, currentStore } = useStoreDataStore()
  const storeName = currentStore?.storeName
  const userPicture = user?.picture

  useAuth()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleChangeStore = async () => {
    await clearStore()
    router.push('/my-store')
  }

  // Generar rutas de búsqueda usando la función existente
  const searchRoutes = useMemo(() => {
    return storeId ? generateSearchRoutes(storeId) : []
  }, [storeId])

  // Filtrar rutas basado en el texto de búsqueda
  const filteredRoutes = useMemo(() => {
    if (!searchValue) return searchRoutes.slice(0, 8) // Mostrar las primeras 8 rutas por defecto

    return searchRoutes
      .filter(route => {
        return (
          route.label.toLowerCase().includes(searchValue.toLowerCase()) ||
          route.path.toLowerCase().includes(searchValue.toLowerCase()) ||
          route.keywords?.some(keyword => keyword.toLowerCase().includes(searchValue.toLowerCase()))
        )
      })
      .slice(0, 8) // Limitar a 8 resultados
  }, [searchValue, searchRoutes])

  // Callbacks para TopBar
  const toggleIsUserMenuOpen = useCallback(() => setIsUserMenuOpen(prev => !prev), [])

  const handleSearchResultsDismiss = useCallback(() => {
    setIsSearchActive(false)
    setSearchValue('')
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value)
    setIsSearchActive(value.length > 0)
  }, [])

  const handleNavigationToggle = useCallback(() => {
    onNavigationToggle?.()
  }, [onNavigationToggle])

  // Manejar selección de resultado de búsqueda
  const handleSearchResultSelect = useCallback(
    (path: string) => {
      router.push(path)
      handleSearchResultsDismiss()
    },
    [router, handleSearchResultsDismiss]
  )

  // User Menu - Con estado de carga e hidratación
  const userMenuMarkup =
    !isClient || loading ? (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--p-space-200)',
          padding: 'var(--p-space-200)',
        }}
      >
        <SkeletonThumbnail size="small" />
        <div style={{ width: '120px' }}>
          <SkeletonBodyText lines={2} />
        </div>
      </div>
    ) : (
      <TopBar.UserMenu
        actions={[
          {
            items: [
              {
                content: 'Configuración de Tienda',
                onAction: () => router.push(`/store/${storeId}/setup`),
              },
              {
                content: 'Mi Perfil',
                onAction: () => router.push('/account-settings?section=cuenta'),
              },
            ],
          },
          {
            items: [
              { content: 'Centro de Ayuda' },
              { content: 'Cambiar de Tienda', icon: ExitIcon, onAction: () => handleChangeStore() },
            ],
          },
        ]}
        name={storeName || ''}
        initials={storeId?.charAt(0) || 'T'}
        open={isUserMenuOpen}
        onToggle={toggleIsUserMenuOpen}
        avatar={userPicture || ''}
      />
    )

  // Search Field - Con estado de carga y hidratación
  const searchFieldMarkup = (
    <TopBar.SearchField
      onChange={!isClient || loading ? () => {} : handleSearchChange}
      value={searchValue}
      placeholder={!isClient || loading ? 'Cargando...' : 'Buscar rutas y páginas... '}
      showFocusBorder
    />
  )

  // Search Results - Con estado de carga y hidratación
  const searchResultsMarkup =
    !isClient || loading ? (
      <ActionList
        items={[
          {
            content: 'Cargando rutas...',
            disabled: true,
            prefix: <SkeletonThumbnail size="small" />,
          },
        ]}
      />
    ) : (
      <ActionList
        items={filteredRoutes.map(route => ({
          content: route.label,
          onAction: () => handleSearchResultSelect(route.path),
          suffix: route.section,
        }))}
      />
    )

  // Secondary Menu con acciones personalizadas integradas
  const secondaryMenuMarkup = (
    <div className="flex items-center gap-2">
      {/* Acciones personalizadas integradas */}
      <ChatTrigger />
      <NotificationPopover />

      {/* Menú de ayuda */}
    </div>
  )

  return (
    <TopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
      secondaryMenu={secondaryMenuMarkup}
      searchResultsVisible={isSearchActive}
      searchField={searchFieldMarkup}
      searchResults={searchResultsMarkup}
      onSearchResultsDismiss={handleSearchResultsDismiss}
      onNavigationToggle={handleNavigationToggle}
    />
  )
}
