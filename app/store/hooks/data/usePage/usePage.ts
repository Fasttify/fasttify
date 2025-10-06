import { useCacheInvalidation } from '@/hooks/cache/useCacheInvalidation';
import { CreatePageInput, createPageSchema, UpdatePageInput, updatePageSchema } from '@/lib/zod-schemas/page';
import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { getCurrentUser } from 'aws-amplify/auth';
import { useCallback, useState } from 'react';
import { storeClient, type StorePage } from '@/lib/amplify-client';
import { ensureUniquePageSlug } from './utils/slugUnique';

// Clave base para las consultas de páginas
const PAGES_KEY = 'pages';

/**
 * Interfaz para los items de página (objetos JavaScript)
 */

export type Page = StorePage;
export type PageSummary = Pick<Page, 'id' | 'title' | 'slug' | 'isVisible' | 'status' | 'createdAt' | 'pageType'>;
export type { CreatePageInput, UpdatePageInput };

export const usePages = (storeId: string) => {
  const [error, setError] = useState<any>(null);
  const queryClient = useQueryClient();
  const { invalidatePageCache } = useCacheInvalidation();

  const performOperation = async <T>(
    operation: () => Promise<{ data: T | null; errors?: any[] }>
  ): Promise<T | null> => {
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

  const useListPagesByStore = (): UseQueryResult<PageSummary[], Error> => {
    return useQuery({
      queryKey: [PAGES_KEY, 'list', storeId],
      queryFn: async () => {
        if (!storeId) {
          throw new Error('Store ID is required to list pages.');
        }
        const response = await performOperation(() =>
          storeClient.models.Page.listPageByStoreId(
            { storeId },
            { selectionSet: ['id', 'title', 'slug', 'isVisible', 'status', 'createdAt', 'pageType'] }
          )
        );
        return response || [];
      },
      staleTime: 5 * 60 * 1000, // 5 minutos en caché
      enabled: !!storeId,
    });
  };

  const useListPageSummaries = (): UseQueryResult<PageSummary[], Error> => {
    return useQuery({
      queryKey: [PAGES_KEY, 'list', storeId, 'summary'],
      queryFn: async () => {
        if (!storeId) {
          throw new Error('Store ID is required to list page summaries.');
        }
        // Usamos .list() con selectionSet para traer solo los datos necesarios
        const { data: pages, errors } = await storeClient.models.Page.listPageByStoreId(
          {
            storeId,
          },
          { selectionSet: ['id', 'title', 'slug', 'pageType'] }
        );

        if (errors) {
          console.error('Error fetching page summaries:', errors);
          throw new Error('Error al cargar el resumen de páginas.');
        }

        return (pages as PageSummary[]) || [];
      },
      staleTime: 5 * 60 * 1000, // 5 minutos en caché
      enabled: !!storeId,
    });
  };

  const useGetPage = (id: string): UseQueryResult<Page | null, Error> => {
    return useQuery({
      queryKey: [PAGES_KEY, id],
      queryFn: () => {
        if (!id) return null;
        return performOperation(() => storeClient.models.Page.get({ id }));
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    });
  };

  const generateSlug = useCallback((title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s\-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }, []);

  const useCreatePage = () => {
    return useMutation({
      mutationFn: async (pageInput: CreatePageInput) => {
        const { username } = await getCurrentUser();
        // Generar slug único si se envía slug o se puede derivar del título
        const proposed = pageInput.slug || (pageInput.title ? generateSlug(pageInput.title) : '');
        const finalSlug = proposed ? await ensureUniquePageSlug(pageInput.storeId, proposed) : proposed;
        const ensuredSlug = finalSlug || generateSlug(pageInput.title);
        const validatedInput = createPageSchema.parse({ ...pageInput, slug: ensuredSlug });
        // Asegurar que slug sea string en el payload final para el modelo
        return performOperation(() =>
          storeClient.models.Page.create({ ...validatedInput, slug: ensuredSlug, owner: username })
        );
      },
      onSuccess: async (_newPage) => {
        queryClient.invalidateQueries({ queryKey: [PAGES_KEY, 'list', storeId] });

        // Invalidar caché del motor de renderizado
        await invalidatePageCache(storeId);
      },
    });
  };

  const useUpdatePage = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdatePageInput }) => {
        return performOperation(async () => {
          let nextSlug = data.slug || (data.title ? generateSlug(data.title) : undefined);
          if (nextSlug && (data as any)?.storeId) {
            nextSlug = await ensureUniquePageSlug((data as any).storeId, nextSlug, id);
          }
          const validatedInput = updatePageSchema.parse({ ...data, ...(nextSlug ? { slug: nextSlug } : {}) });
          return storeClient.models.Page.update({ id, ...validatedInput });
        });
      },
      onSuccess: async (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: [PAGES_KEY, variables.id] });
        queryClient.invalidateQueries({ queryKey: [PAGES_KEY, 'list', storeId] });

        // Invalidar caché del motor de renderizado
        await invalidatePageCache(storeId, variables.id);
      },
    });
  };

  const useDeletePage = () => {
    return useMutation({
      mutationFn: (id: string) => {
        if (!id) {
          throw new Error('Page ID is required for deletion');
        }
        return performOperation(() => storeClient.models.Page.delete({ id }));
      },
      onSuccess: async (_data, deletedId) => {
        queryClient.removeQueries({ queryKey: [PAGES_KEY, deletedId] });
        queryClient.invalidateQueries({ queryKey: [PAGES_KEY, 'list', storeId] });

        // Invalidar caché del motor de renderizado
        await invalidatePageCache(storeId, deletedId);
      },
    });
  };

  return {
    error,
    useListPagesByStore,
    useListPageSummaries,
    useGetPage,
    useCreatePage,
    useUpdatePage,
    useDeletePage,
    generateSlug,
    validateCreatePage: createPageSchema,
    validateUpdatePage: updatePageSchema,
  };
};
