import { useState, useCallback } from 'react'
import { generateClient } from 'aws-amplify/data'
import { getCurrentUser } from 'aws-amplify/auth'
import type { Schema } from '@/amplify/data/resource'
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'
import {
  createPageSchema,
  updatePageSchema,
  CreatePageInput,
  UpdatePageInput,
} from '@/lib/zod-schemas/page'

const client = generateClient<Schema>({
  authMode: 'userPool',
})

// Clave base para las consultas de páginas
const PAGES_KEY = 'pages'

/**
 * Interfaz para los items de página (objetos JavaScript)
 */

export type Page = Schema['Page']['type']
export type { CreatePageInput, UpdatePageInput }

export const usePages = (storeId: string) => {
  const [error, setError] = useState<any>(null)
  const queryClient = useQueryClient()

  const performOperation = async <T>(
    operation: () => Promise<{ data: T | null; errors?: any[] }>
  ): Promise<T | null> => {
    setError(null)
    try {
      const result = await operation()
      if (result.errors && result.errors.length > 0) {
        setError(result.errors)
        throw new Error(result.errors[0].message || 'Operation error')
      }
      return result.data
    } catch (err) {
      setError(err)
      throw err
    }
  }

  const useListPagesByStore = (): UseQueryResult<Page[], Error> => {
    return useQuery({
      queryKey: [PAGES_KEY, 'list', storeId],
      queryFn: async () => {
        if (!storeId) {
          throw new Error('Store ID is required to list pages.')
        }
        const response = await performOperation(() =>
          client.models.Page.listPageByStoreId({ storeId })
        )
        return response || []
      },
      staleTime: 5 * 60 * 1000, // 5 minutos en caché
      enabled: !!storeId,
    })
  }

  const useGetPage = (id: string): UseQueryResult<Page | null, Error> => {
    return useQuery({
      queryKey: [PAGES_KEY, id],
      queryFn: () => {
        if (!id) return null
        return performOperation(() => client.models.Page.get({ id }))
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    })
  }

  const generateSlug = useCallback((title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }, [])

  const useCreatePage = () => {
    return useMutation({
      mutationFn: async (pageInput: CreatePageInput) => {
        const { username } = await getCurrentUser()
        const validatedInput = createPageSchema.parse(pageInput)
        return performOperation(() =>
          client.models.Page.create({ ...validatedInput, owner: username })
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [PAGES_KEY, 'list', storeId] })
      },
    })
  }

  const useUpdatePage = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdatePageInput }) => {
        const validatedInput = updatePageSchema.parse(data)
        return performOperation(() =>
          client.models.Page.update({
            id,
            ...validatedInput,
          })
        )
      },
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: [PAGES_KEY, variables.id] })
        queryClient.invalidateQueries({ queryKey: [PAGES_KEY, 'list', storeId] })
      },
    })
  }

  const useDeletePage = () => {
    return useMutation({
      mutationFn: (id: string) =>
        performOperation(() => client.models.Page.delete({ id })),
      onSuccess: (_data, id) => {
        queryClient.removeQueries({ queryKey: [PAGES_KEY, id] })
        queryClient.invalidateQueries({ queryKey: [PAGES_KEY, 'list', storeId] })
      },
    })
  }

  return {
    error,
    useListPagesByStore,
    useGetPage,
    useCreatePage,
    useUpdatePage,
    useDeletePage,
    generateSlug,
    validateCreatePage: createPageSchema,
    validateUpdatePage: updatePageSchema,
  }
}
