import { useState, useCallback, useEffect } from 'react'
import type { IPage, PageFormValues } from '../types/page-types'

interface UsePageFormProps {
  initialPage?: IPage
  onSubmit: (data: PageFormValues) => Promise<boolean>
  onCancel?: () => void
}

interface UsePageFormReturn {
  formData: PageFormValues
  isLoading: boolean
  isValid: boolean
  updateField: (field: keyof PageFormValues, value: any) => void
  handleSubmit: () => Promise<void>
  generateSlugFromTitle: () => void
}

const defaultFormData: PageFormValues = {
  title: '',
  content: '',
  slug: '',
  metaTitle: '',
  metaDescription: '',
  status: 'draft',
  isVisible: true,
  template: '',
}

export const usePageForm = ({
  initialPage,
  onSubmit,
  onCancel,
}: UsePageFormProps): UsePageFormReturn => {
  // Estados del formulario
  const [formData, setFormData] = useState<PageFormValues>(defaultFormData)
  const [isLoading, setIsLoading] = useState(false)

  // Inicializar formulario con datos existentes
  useEffect(() => {
    if (initialPage) {
      setFormData({
        title: initialPage.title,
        content: initialPage.content,
        slug: initialPage.slug,
        metaTitle: initialPage.metaTitle || '',
        metaDescription: initialPage.metaDescription || '',
        status: initialPage.status,
        isVisible: initialPage.isVisible,
        template: initialPage.template || '',
      })
    }
  }, [initialPage])

  // Validación simple - solo requerir título
  const isValid = formData.title.trim().length > 0

  // Actualizar campo individual
  const updateField = useCallback((field: keyof PageFormValues, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  // Generar slug desde el título
  const generateSlugFromTitle = useCallback(() => {
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
      .replace(/^-|-$/g, '') // Remover guiones al inicio y final

    updateField('slug', slug)
  }, [formData.title, updateField])

  // Auto-generar slug cuando cambia el título (solo si el slug está vacío)
  useEffect(() => {
    if (formData.title && !formData.slug) {
      generateSlugFromTitle()
    }
  }, [formData.title, formData.slug, generateSlugFromTitle])

  // Manejar envío del formulario
  const handleSubmit = useCallback(async () => {
    if (!isValid) return

    try {
      setIsLoading(true)

      // Si no hay slug, generarlo automáticamente
      const finalData = {
        ...formData,
        slug:
          formData.slug ||
          formData.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, ''),
      }

      // Enviar datos
      const success = await onSubmit(finalData)

      if (success && !initialPage) {
        // Resetear formulario si es creación nueva
        setFormData(defaultFormData)
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error)
    } finally {
      setIsLoading(false)
    }
  }, [formData, onSubmit, initialPage, isValid])

  return {
    formData,
    isLoading,
    isValid,
    updateField,
    handleSubmit,
    generateSlugFromTitle,
  }
}
