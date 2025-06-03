'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader } from '@/components/ui/loader'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  productFormSchema,
  type ProductFormValues,
  defaultValues,
} from '@/lib/zod-schemas/product-schema'
import { useProducts } from '@/app/store/hooks/useProducts'
import {
  mapProductToFormValues,
  prepareProductData,
  handleProductUpdate,
  handleProductCreate,
} from '@/app/store/components/product-management/utils/productUtils'
import { useUnsavedChangesWarning } from '@/hooks/ui/use-unsaved-changes-warning'
import { UnsavedChangesAlert } from '@/components/ui/unsaved-changes-alert'
import { BasicInfoSection } from '@/app/store/components/product-management/product-sections/basic-info-section'
import { PricingInventorySection } from '@/app/store/components/product-management/product-sections/pricing-inventory-section'
import { ImagesSection } from '@/app/store/components/product-management/product-sections/images-section'
import { AttributesSection } from '@/app/store/components/product-management/product-sections/attributes-section'
import { PublicationSection } from '@/app/store/components/product-management/product-sections/publication-section'

interface ProductFormProps {
  storeId: string
  productId?: string
}

// Función helper para validar el status
const normalizeStatus = (status: any): 'draft' | 'pending' | 'active' | 'inactive' => {
  const validStatuses = ['draft', 'pending', 'active', 'inactive'] as const

  // Si el status es undefined, null o string vacío, retornar 'draft'
  if (!status || status === '') {
    return 'draft'
  }

  // Si el status es válido, retornarlo; sino, retornar 'draft'
  return validStatuses.includes(status) ? status : 'draft'
}

// Componente de Loading reutilizable
function ProductLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader color="black" text="Cargando producto..." size="large" />
    </div>
  )
}

// Componente del botón de volver
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="text-gray-800 text-lg"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-1"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      Añadir producto
    </Button>
  )
}

export function ProductForm({ storeId, productId }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(!!productId)

  const { createProduct, updateProduct, fetchProduct } = useProducts(storeId, {
    skipInitialFetch: true,
  })

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues,
    mode: 'onChange',
  })

  const {
    hasUnsavedChanges,
    resetUnsavedChanges,
    confirmNavigation,
    pendingNavigation,
    discardChanges,
  } = useUnsavedChangesWarning({
    form,
    isSubmitting,
  })

  // Cargar producto para edición
  useEffect(() => {
    if (!productId) {
      setIsLoadingProduct(false)
      return
    }

    const loadProduct = async () => {
      try {
        const product = await fetchProduct(productId)
        if (product) {
          const formValues = mapProductToFormValues(product)

          // Normalizar valores antes de establecerlos en el formulario
          formValues.status = normalizeStatus(formValues.status)
          formValues.category = formValues.category || ''

          // Establecer los valores en el formulario
          form.reset(formValues)
        }
      } catch (error) {
        console.error('Error loading product:', error)
        toast.error('Error', {
          description: 'No se pudo cargar el producto. Por favor, inténtelo de nuevo.',
        })
      } finally {
        setIsLoadingProduct(false)
      }
    }

    loadProduct()
  }, [productId, fetchProduct, form])

  // Función optimizada para manejar el guardado
  const handleSave = useCallback(
    async (isNavigating = false) => {
      try {
        const isValid = await form.trigger()
        if (!isValid) {
          throw new Error('Validation failed')
        }

        const data = form.getValues()
        const basicProductData = prepareProductData(data, storeId)

        const result = productId
          ? await handleProductUpdate(basicProductData, productId, storeId, updateProduct)
          : await handleProductCreate(basicProductData, createProduct)

        if (result) {
          resetUnsavedChanges()
          // Mantener isSubmitting true durante la redirección
          if (isNavigating && pendingNavigation) {
            pendingNavigation()
          } else {
            router.push(`/store/${storeId}/products`)
          }
          // No resetear isSubmitting aquí, se hará cuando se complete la navegación
        } else {
          throw new Error(
            productId ? 'Error al actualizar el producto' : 'Error al crear el producto'
          )
        }
      } catch (error) {
        console.error('Error al guardar producto:', error)

        if (!(error instanceof Error && error.message === 'Validation failed')) {
          toast.error('Error', {
            description:
              'Ha ocurrido un error al guardar el producto. Por favor, inténtelo de nuevo.',
          })
        }
        throw error
      }
    },
    [
      form,
      storeId,
      productId,
      updateProduct,
      createProduct,
      resetUnsavedChanges,
      pendingNavigation,
      router,
    ]
  )

  // Función para manejar el submit del formulario
  const onSubmit = async (data: ProductFormValues) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      await handleSave()
    } catch (error) {
      setIsSubmitting(false)
    }
  }

  // Función para manejar el guardado desde UnsavedChangesAlert
  const handleUnsavedSave = useCallback(async () => {
    setIsSubmitting(true)
    try {
      await handleSave(true)
      // Mantener isSubmitting true hasta la redirección
    } catch (error) {
      setIsSubmitting(false)
      throw error
    }
  }, [handleSave])

  // Función para manejar la navegación con confirmación
  const handleNavigation = useCallback(
    (destination: () => void) => {
      confirmNavigation(destination)
    },
    [confirmNavigation]
  )

  // Si está cargando, mostrar el loader
  if (isLoadingProduct) {
    return <ProductLoadingState />
  }

  return (
    <>
      {hasUnsavedChanges && (
        <UnsavedChangesAlert
          onSave={handleUnsavedSave}
          onDiscard={discardChanges}
          setIsSubmitting={setIsSubmitting}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex items-center mb-6">
          <BackButton onClick={() => handleNavigation(() => router.back())} />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-6">
            {/* Main content column */}
            <div className="flex-1 space-y-6 order-2 lg:order-1">
              <Card className="shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <BasicInfoSection form={form} />
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <ImagesSection form={form} storeId={storeId} />
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <PricingInventorySection form={form} />
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <AttributesSection form={form} />
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleNavigation(() => router.back())}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  className="bg-[#2a2a2a] hover:bg-[#3a3a3a]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader color="white" />
                      {productId ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : productId ? (
                    'Actualizar Producto'
                  ) : (
                    'Crear Producto'
                  )}
                </Button>
              </div>
            </div>

            {/* Sidebar column */}
            <div className="w-full lg:w-80 space-y-6 order-1 lg:order-2">
              <Card className="shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Publicación</h3>
                  </div>
                  <PublicationSection form={form} />
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </>
  )
}
