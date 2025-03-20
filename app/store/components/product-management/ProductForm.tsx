import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  productFormSchema,
  type ProductFormValues,
  defaultValues,
} from '@/lib/schemas/product-schema'
import { useProducts, type IProduct } from '@/app/store/hooks/useProducts'
import {
  mapProductToFormValues,
  prepareProductData,
  handleProductUpdate,
  handleProductCreate,
} from '@/app/store/components/product-management/utils/productUtils'
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning'
import { UnsavedChangesAlert } from '@/components/ui/unsaved-changes-alert'
import { BasicInfoSection } from '@/app/store/components/product-management/sections/basic-info-section'
import { PricingInventorySection } from '@/app/store/components/product-management/sections/pricing-inventory-section'
import { ImagesSection } from '@/app/store/components/product-management/sections/images-section'
import { AttributesSection } from '@/app/store/components/product-management/sections/attributes-section'

interface ProductFormProps {
  storeId: string
  productId?: string
}

export function ProductForm({ storeId, productId }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const { createProduct, updateProduct, products, fetchProduct } = useProducts(storeId, {
    skipInitialFetch: true,
  })

  const [productToEdit, setProductToEdit] = useState<IProduct | null>(null)

  useEffect(() => {
    const loadProduct = async () => {
      if (productId) {
        const existingProduct = products.find(p => p.id === productId)

        if (existingProduct) {
          setProductToEdit(existingProduct)
        } else {
          const product = await fetchProduct(productId)
          if (product) {
            setProductToEdit(product)
          }
        }
      }
    }

    loadProduct()
  }, [productId, products, fetchProduct])

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

  useEffect(() => {
    if (productToEdit) {
      form.reset(defaultValues)

      const formValues = mapProductToFormValues(productToEdit)

      if (formValues.status) {
        const validStatuses = ['draft', 'pending', 'active', 'inactive']
        formValues.status = validStatuses.includes(formValues.status) ? formValues.status : 'draft'
      } else {
        formValues.status = 'draft'
      }

      formValues.category = formValues.category || ''

      setTimeout(() => {
        form.reset(formValues)
      }, 100)
    }
  }, [productToEdit, form])

  async function onSubmit(data: ProductFormValues) {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const basicProductData = prepareProductData(data, storeId)
      let result: IProduct | null

      if (productId) {
        result = await handleProductUpdate(basicProductData, productId, storeId, updateProduct)
      } else {
        result = await handleProductCreate(basicProductData, createProduct)
      }

      if (result) {
        resetUnsavedChanges()
        router.push(`/store/${storeId}/products`)
        return
      } else {
        throw new Error('No se pudo guardar el producto')
      }
    } catch (error) {
      console.error('Error al guardar producto:', error)
      toast.error('Error', {
        description: 'Ha ocurrido un error al guardar el producto. Por favor, inténtelo de nuevo.',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {hasUnsavedChanges && (
        <UnsavedChangesAlert
          onSave={async () => {
            if (productId) {
              try {
                const isValid = await form.trigger()
                if (!isValid) {
                  return Promise.reject(new Error('Validation failed'))
                }

                const data = form.getValues()
                const basicProductData = prepareProductData(data, storeId)
                const result = await handleProductUpdate(
                  basicProductData,
                  productId,
                  storeId,
                  updateProduct
                )

                if (result) {
                  resetUnsavedChanges()
                  setIsRedirecting(true)
                  if (pendingNavigation) {
                    pendingNavigation()
                  } else {
                    router.push(`/store/${storeId}/products`)
                  }
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
            } else {
              try {
                const isValid = await form.trigger()
                if (!isValid) {
                  return Promise.reject(new Error('Validation failed'))
                }

                const data = form.getValues()
                const basicProductData = prepareProductData(data, storeId)
                const result = await handleProductCreate(basicProductData, createProduct)

                if (result) {
                  resetUnsavedChanges()
                  setIsRedirecting(true)
                  if (pendingNavigation) {
                    pendingNavigation()
                  } else {
                    router.push(`/store/${storeId}/products`)
                  }
                } else {
                  throw new Error('No se pudo crear el producto')
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
            }
          }}
          onDiscard={discardChanges}
          setIsSubmitting={setIsSubmitting}
        />
      )}
      <div className="max-w-5xl mx-auto px-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Información Básica</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    confirmNavigation(() => router.back())
                  }}
                  className="text-muted-foreground"
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
                  Volver
                </Button>
              </div>
              <Card className="shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <BasicInfoSection form={form} />
                </CardContent>
              </Card>

              <h2 className="text-xl font-bold">Precios e Inventario</h2>
              <Card className="shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <PricingInventorySection form={form} />
                </CardContent>
              </Card>

              <h2 className="text-xl font-bold">Imágenes</h2>
              <Card className="shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <ImagesSection form={form} storeId={storeId} />
                </CardContent>
              </Card>

              <h2 className="text-xl font-bold">Atributos</h2>
              <Card className="shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <AttributesSection form={form} />
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  confirmNavigation(() => router.back())
                }}
              >
                Cancelar
              </Button>

              {productId ? (
                <Button
                  type="button"
                  className="bg-[#2a2a2a] hover:bg-[#3a3a3a]"
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (isSubmitting) return
                    setIsSubmitting(true)

                    try {
                      const data = form.getValues()
                      const basicProductData = prepareProductData(data, storeId)
                      const result = await handleProductUpdate(
                        basicProductData,
                        productId,
                        storeId,
                        updateProduct
                      )

                      if (result) {
                        resetUnsavedChanges()
                        router.push(`/store/${storeId}/products`)
                      } else {
                        setIsSubmitting(false)
                      }
                    } catch (error) {
                      console.error('Error al actualizar producto:', error)
                      setIsSubmitting(false)
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar Producto'
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-[#2a2a2a] hover:bg-[#3a3a3a]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Producto'
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </>
  )
}
