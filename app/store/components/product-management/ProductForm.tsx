'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ImageUpload } from '@/app/store/components/product-management/ImageUpload'
import { AttributesForm } from '@/app/store/components/product-management/AttributesForm'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
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
      const formValues = mapProductToFormValues(productToEdit)
      Object.entries(formValues).forEach(([key, value]) => {
        form.setValue(key as any, value)
      })
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
                const isValid = await form.trigger(['name'])
                if (!isValid) {
                  toast.error('Error de validación', {
                    description: 'Por favor complete el nombre del producto.',
                  })
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
                toast.error('Error', {
                  description:
                    'Ha ocurrido un error al guardar el producto. Por favor, inténtelo de nuevo.',
                })
                throw error
              }
            } else {
              try {
                const isValid = await form.trigger(['name'])
                if (!isValid) {
                  toast.error('Error de validación', {
                    description: 'Por favor complete el nombre del producto.',
                  })
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
                toast.error('Error', {
                  description:
                    'Ha ocurrido un error al guardar el producto. Por favor, inténtelo de nuevo.',
                })
                throw error
              }
            }
          }}
          onDiscard={discardChanges}
          setIsSubmitting={setIsSubmitting}
        />
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="flex flex-wrap w-full md:grid md:grid-cols-4 gap-2">
              <TabsTrigger value="basic" className="flex-1 min-w-[120px]">
                Información Básica
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex-1 min-w-[120px]">
                Precios e Inventario
              </TabsTrigger>
              <TabsTrigger value="images" className="flex-1 min-w-[120px]">
                Imágenes
              </TabsTrigger>
              <TabsTrigger value="attributes" className="flex-1 min-w-[120px]">
                Atributos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-16 sm:mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Producto</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingrese el nombre del producto" {...field} />
                          </FormControl>
                          <FormDescription>
                            El nombre de su producto como aparecerá a los clientes.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ingrese la descripción del producto"
                            className="min-h-32 resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Proporcione una descripción detallada de su producto.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="clothing">Ropa</SelectItem>
                            <SelectItem value="electronics">Electrónica</SelectItem>
                            <SelectItem value="home">Hogar y Cocina</SelectItem>
                            <SelectItem value="beauty">Belleza y Cuidado Personal</SelectItem>
                            <SelectItem value="sports">Deportes y Aire Libre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Seleccione la categoría que mejor se adapte a su producto.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Borrador</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="inactive">Inactivo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Establezca el estado actual de este producto.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="creationDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha de Creación</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP', { locale: es })
                                  ) : (
                                    <span>Seleccione una fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={date => date > new Date()}
                                initialFocus
                                locale={es}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>Cuando se creó este producto.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastModifiedDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha de Última Modificación</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                  disabled
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP', { locale: es })
                                  ) : (
                                    <span>Se actualiza automáticamente</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={date => date > new Date()}
                                initialFocus
                                locale={es}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Se actualiza automáticamente cuando se guarda el producto.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-16 sm:mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5">$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  className="pl-7"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>El precio que pagarán los clientes.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="compareAtPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio de Comparación</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5">$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  className="pl-7"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Precio original antes del descuento (opcional).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="costPerItem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Costo por Artículo</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="pl-7"
                                {...field}
                                value={field.value || ''}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Su costo para comprar o producir este artículo (opcional).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU (Código de Artículo)</FormLabel>
                            <FormControl>
                              <Input placeholder="SKU-123456" {...field} />
                            </FormControl>
                            <FormDescription>
                              Un identificador único para su producto.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="barcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código de Barras (ISBN, UPC, GTIN, etc.)</FormLabel>
                            <FormControl>
                              <Input placeholder="123456789012" {...field} />
                            </FormControl>
                            <FormDescription>
                              Ingrese un código de barras para su producto.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="1" placeholder="0" {...field} />
                          </FormControl>
                          <FormDescription>El número de artículos en stock.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-4 mt-16 sm:mt-6">
              <Card>
                <CardContent className="pt-6">
                  <ImageUpload
                    storeId={storeId}
                    value={(form.watch('images') || []).map(img => ({
                      url: img.url,
                      alt: img.alt || '',
                    }))}
                    onChange={images => {
                      const validImages = images.filter(
                        (img): img is { url: string; alt: string } =>
                          typeof img.url === 'string' && typeof img.alt === 'string'
                      )
                      form.setValue('images', validImages, { shouldValidate: true })
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attributes" className="space-y-4 mt-16 sm:mt-6">
              <Card>
                <CardContent className="pt-6">
                  <AttributesForm
                    value={form.watch('attributes') || []}
                    onChange={attributes =>
                      form.setValue('attributes', attributes, { shouldValidate: true })
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
    </>
  )
}
