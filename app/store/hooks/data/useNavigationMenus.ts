import { useState, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '@/amplify/data/resource';
import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { validateNavigationMenu, validateUpdateNavigationMenu, validateMenuItems } from '@/lib/zod-schemas/navigation';

const client = generateClient<Schema>({
  authMode: 'userPool',
});

// Clave base para las consultas de menús
const NAVIGATION_MENUS_KEY = 'navigationMenus';

/**
 * Interfaz para los items de menú (objetos JavaScript)
 */
export interface MenuItem {
  label: string;
  type: 'internal' | 'external' | 'page' | 'collection' | 'product';
  isVisible: boolean;
  target?: '_blank' | '_self';
  sortOrder: number;

  // Campos condicionales según el tipo
  url?: string; // Para 'internal' y 'external'
  pageHandle?: string; // Para 'page'
  collectionHandle?: string; // Para 'collection'
  productHandle?: string; // Para 'product'
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
export type NavigationMenu = Schema['NavigationMenu']['type'];

/**
 * Hook personalizado para gestionar menús de navegación con React Query
 * Utiliza índices secundarios para obtener registros por storeId
 */
export const useNavigationMenus = () => {
  const [error, setError] = useState<any>(null);
  const queryClient = useQueryClient();

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
  const useListNavigationMenus = (storeId: string): UseQueryResult<NavigationMenu[], Error> => {
    return useQuery({
      queryKey: [NAVIGATION_MENUS_KEY, 'list', storeId],
      queryFn: () => {
        if (!storeId) {
          throw new Error('Store ID is required to list navigation menus.');
        }

        return performOperation(() => client.models.NavigationMenu.listNavigationMenuByStoreId({ storeId }));
      },
      staleTime: 5 * 60 * 1000, // 5 minutos en caché
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
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .trim()
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-'); // Remover guiones múltiples
  }, []);

  /**
   * Crea un nuevo menú de navegación usando React Query
   */
  const useCreateNavigationMenu = () => {
    return useMutation({
      mutationFn: async (menuInput: NavigationMenuInput) => {
        // Obtener el owner actual
        const { username } = await getCurrentUser();

        // Serializar menuData como JSON string
        const menuData = {
          ...menuInput,
          owner: username,
          menuData: JSON.stringify(menuInput.menuData),
        };

        return performOperation(() => client.models.NavigationMenu.create(menuData));
      },
      onSuccess: () => {
        // Invalidar consultas para actualizar la lista
        queryClient.invalidateQueries({ queryKey: [NAVIGATION_MENUS_KEY, 'list'] });
      },
    });
  };

  /**
   * Actualiza un menú de navegación existente usando React Query
   */
  const useUpdateNavigationMenu = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<NavigationMenuInput> }) => {
        // Remover owner del objeto de actualización para evitar errores de autorización
        const { owner, ...updateDataWithoutOwner } = data;

        // Si hay menuData, serializarlo como JSON string
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
      onSuccess: (data, variables) => {
        // Actualizar el menú en caché
        queryClient.invalidateQueries({ queryKey: [NAVIGATION_MENUS_KEY, variables.id] });
        queryClient.invalidateQueries({ queryKey: [NAVIGATION_MENUS_KEY, 'list'] });
      },
    });
  };

  /**
   * Elimina un menú de navegación usando React Query
   */
  const useDeleteNavigationMenu = () => {
    return useMutation({
      mutationFn: (id: string) => performOperation(() => client.models.NavigationMenu.delete({ id })),
      onSuccess: (_, id) => {
        // Eliminar el menú de la caché
        queryClient.removeQueries({ queryKey: [NAVIGATION_MENUS_KEY, id] });
        queryClient.invalidateQueries({ queryKey: [NAVIGATION_MENUS_KEY, 'list'] });
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
