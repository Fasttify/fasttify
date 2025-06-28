import { useState, useCallback, useEffect, useMemo } from 'react'
import type {
  Page,
  PageFormValues,
} from '@/app/store/components/page-management/types/page-types'
import { createPageSchema } from '@/lib/zod-schemas/page'

interface UsePageFormProps {
  initialPage?: Page
  onSubmit: (data: PageFormValues) => Promise<boolean>
  generateSlug: (title: string) => string
  storeId: string
  isEditing: boolean
}

interface UsePageFormReturn {
  formData: Partial<PageFormValues>
  errors: Record<keyof PageFormValues, string>
  isLoading: boolean
  isDirty: boolean
  updateField: (field: keyof PageFormValues, value: any) => void
  handleSubmit: () => Promise<void>
}

export const usePageForm = ({
  initialPage,
  onSubmit,
  generateSlug,
  storeId,
  isEditing,
}: UsePageFormProps): UsePageFormReturn => {
  const getInitialData = useCallback((): Partial<PageFormValues> => {
    return initialPage
      ? {
          storeId: initialPage.storeId,
          title: initialPage.title,
          content: initialPage.content,
          slug: initialPage.slug,
          status: initialPage.status as 'published' | 'draft',
          isVisible: initialPage.isVisible,
          metaTitle: initialPage.metaTitle || '',
          metaDescription: initialPage.metaDescription || '',
          template: initialPage.template || '',
        }
      : { storeId, title: '', content: '', slug: '', status: 'draft', isVisible: true }
  }, [initialPage, storeId])

  const [initialData, setInitialData] = useState(getInitialData)
  const [formData, setFormData] = useState<Partial<PageFormValues>>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    const data = getInitialData()
    setInitialData(data)
    setFormData(data)
    setIsDirty(false)
  }, [getInitialData])

  useEffect(() => {
    if (isEditing) {
      setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData))
    }
  }, [formData, initialData, isEditing])

  const validate = useCallback(() => {
    const result = createPageSchema.safeParse(formData)
    if (result.success) {
      setErrors({})
      return true
    }
    const fieldErrors: Record<string, string> = {}
    result.error.errors.forEach(err => {
      if (err.path[0]) {
        fieldErrors[err.path[0] as string] = err.message
      }
    })
    setErrors(fieldErrors)
    return false
  }, [formData])

  const updateField = useCallback(
    (field: keyof PageFormValues, value: any) => {
      setFormData(prev => {
        const newFormData = { ...prev, [field]: value }
        if (field === 'title' && !newFormData.slug) {
          newFormData.slug = generateSlug(value)
        }
        return newFormData
      })
    },
    [generateSlug]
  )

  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      return
    }
    setIsLoading(true)
    try {
      const success = await onSubmit(formData as PageFormValues)
      if (!success) {
        setIsLoading(false)
      }
      // On success, isLoading remains true, and the component will unmount on redirect.
    } catch (error) {
      console.error('Error submitting form:', error)
      setIsLoading(false)
    }
  }, [onSubmit, formData, validate])

  return {
    formData,
    errors: errors as Record<keyof PageFormValues, string>,
    isLoading,
    isDirty,
    updateField,
    handleSubmit,
  }
}
