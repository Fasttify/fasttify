import type { StoreSchema } from '@/data-schema';
import { useCacheInvalidation } from '@/hooks/cache/useCacheInvalidation';
import { validateMenuItems, validateNavigationMenu, validateUpdateNavigationMenu } from '@/lib/zod-schemas/navigation';
import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { useCallback, useState } from 'react';

const client = generateClient<StoreSchema>({
  authMode: 'userPool',
});

const NAVIGATION_MENUS_KEY = 'navigationMenus';

/**
 * Interfaz para los items de menú
 */
export interface MenuItem {
  label: string;
  type: 'internal' | 'external' | 'page' | 'collection' | 'product';
  isVisible: boolean;
  target?: '_blank' | '_self';
  sortOrder: number;

  url?: string;
  pageHandle?: string;
  collectionHandle?: string;
  productHandle?: string;
}

/**
 * Función para generar la URL final basada en el tipo y campos del MenuItem
 */
export function generateMenuItemURL(item: MenuItem): string {
  switch (item.type) {
    case 'product':
      return item.productHandle ? `/products/${item.productHandle}` : '/products';

    case 'collection':
      return item.collectionHandle ? `/collections/${item.collectionHandle}` : '/collections';

    case 'page':
      return item.pageHandle ? `/pages/${item.pageHandle}` : '/pages';

    case 'internal':
    case 'external':
      return item.url || '/';

    default:
      return '/';
  }
}

/**
 * Interfaz para los datos de entrada de un menú de navegación
 */
export interface NavigationMenuInput {
  storeId: string;
  domain: string;
  name: string;
  handle: string;
  isMain: boolean;
  isActive: boolean;
  menuData: MenuItem[];
  owner: string;
}

/**
 * Tipo para los datos del menú desde la base de datos
 */
export type NavigationMenu = StoreSchema['NavigationMenu']['type'];
export type NavigationMenuSummary = Pick<NavigationMenu, 'id' | 'name' | 'handle' | 'isMain' | 'isActive'>;

/**
 * Hook personalizado para gestionar menús de navegación con React Query
 * Utiliza índices secundarios para obtener registros por storeId
 */
export const useNavigationMenus = () => {
  const [error, setError] = useState<any>(null);
  const queryClient = useQueryClient();
  const { invalidateNavigationCache } = useCacheInvalidation();

  /**
   * Función auxiliar para ejecutar operaciones con manejo de errores
   */
  const performOperation = async <T>(operation: () => Promise<{ data: T; errors?: any[] }>): Promise<T> => {
    setError(null);
    try {
      const result = await operation();
      if (result.errors && result.errors.length > 0) {
        setError(result.errors);
        throw new Error(result.errors[0].message || 'Operation error');
      }
      return result.data;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  /**
   * Lista todos los menús de una tienda usando el índice secundario por storeId
   */
  const useListNavigationMenus = (storeId: string): UseQueryResult<NavigationMenuSummary[], Error> => {
    return useQuery({
      queryKey: [NAVIGATION_MENUS_KEY, 'list', storeId],
      queryFn: () => {
        if (!storeId) {
          throw new Error('Store ID is required to list navigation menus.');
        }

        return performOperation(() =>
          client.models.NavigationMenu.listNavigationMenuByStoreId(
            { storeId },

            {
              selectionSet: ['id', 'name', 'handle', 'isMain', 'isActive'],
            }
          )
        );
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!storeId,
    });
  };

  /**
   * Obtiene un menú por su ID usando React Query
   */
  const useGetNavigationMenu = (id: string): UseQueryResult<NavigationMenu | null, Error> => {
    return useQuery({
      queryKey: [NAVIGATION_MENUS_KEY, id],
      queryFn: () => {
        if (!id) {
          return null;
        }
        return performOperation(() => client.models.NavigationMenu.get({ id }));
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    });
  };

  /**
   * Función auxiliar para parsear menuData JSON string a array de MenuItem
   */
  const parseMenuData = useCallback((menuDataString: string): MenuItem[] => {
    try {
      if (!menuDataString) return [];
      return JSON.parse(menuDataString) as MenuItem[];
    } catch (error) {
      console.error('Error parsing menu data:', error);
      return [];
    }
  }, []);

  /**
   * Función auxiliar para generar un handle único basado en el nombre
   */
  const generateHandle = useCallback((name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }, []);

  /**
   * Crea un nuevo menú de navegación usando React Query
   */
  const useCreateNavigationMenu = () => {
    return useMutation({
      mutationFn: async (menuInput: NavigationMenuInput) => {
        const { username } = await getCurrentUser();

        const menuData = {
          ...menuInput,
          owner: username,
          menuData: JSON.stringify(menuInput.menuData),
        };

        return performOperation(() => client.models.NavigationMenu.create(menuData));
      },
      onSuccess: async (newMenu) => {
        queryClient.invalidateQueries({ queryKey: [NAVIGATION_MENUS_KEY, 'list'] });

        // Invalidar caché del motor de renderizado
        if (newMenu?.storeId) {
          await invalidateNavigationCache(newMenu.storeId);
        }
      },
    });
  };

  /**
   * Actualiza un menú de navegación existente usando React Query
   */
  const useUpdateNavigationMenu = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<NavigationMenuInput> }) => {
        const { owner: _owner, ...updateDataWithoutOwner } = data;

        const updateData = updateDataWithoutOwner.menuData
          ? { ...updateDataWithoutOwner, menuData: JSON.stringify(updateDataWithoutOwner.menuData) }
          : updateDataWithoutOwner;

        return performOperation(() =>
          client.models.NavigationMenu.update({
            id,
            ...updateData,
          })
        );
      },
      onSuccess: async (data, variables) => {
        queryClient.invalidateQueries({ queryKey: [NAVIGATION_MENUS_KEY, variables.id] });
        queryClient.invalidateQueries({ queryKey: [NAVIGATION_MENUS_KEY, 'list'] });

        // Invalidar caché del motor de renderizado
        if (data?.storeId) {
          await invalidateNavigationCache(data.storeId);
        }
      },
    });
  };

  /**
   * Elimina un menú de navegación usando React Query
   */
  const useDeleteNavigationMenu = () => {
    return useMutation({
      mutationFn: ({ id, storeId }: { id: string; storeId: string }) => {
        if (!id) {
          throw new Error('Navigation menu ID is required for deletion');
        }
        if (!storeId) {
          throw new Error('Store ID is required for cache invalidation');
        }
        return performOperation(() => client.models.NavigationMenu.delete({ id }));
      },
      onSuccess: async (_, variables) => {
        queryClient.removeQueries({ queryKey: [NAVIGATION_MENUS_KEY, variables.id] });
        queryClient.invalidateQueries({ queryKey: [NAVIGATION_MENUS_KEY, 'list'] });

        // Invalidar caché del motor de renderizado
        await invalidateNavigationCache(variables.storeId);
      },
    });
  };

  return {
    error,
    useListNavigationMenus,
    useGetNavigationMenu,
    useCreateNavigationMenu,
    useUpdateNavigationMenu,
    useDeleteNavigationMenu,
    parseMenuData,
    generateHandle,
    generateMenuItemURL,
    validateNavigationMenu,
    validateUpdateNavigationMenu,
    validateMenuItems,
  };
};
