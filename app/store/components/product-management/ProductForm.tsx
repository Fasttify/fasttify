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
import { productFormSchema, ProductFormValues, defaultValues } from '@/lib/schemas/product-schema'
import { useProducts, IProduct } from '@/app/store/hooks/useProducts'

interface ProductFormProps {
  storeId: string
  productId?: string
}

export function ProductForm({ storeId, productId }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createProduct, updateProduct, products } = useProducts(storeId, {
    skipInitialFetch: true,
  })

  // Si tenemos un productId, buscamos el producto para editar
  const productToEdit = productId ? products.find(p => p.id === productId) : null

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productToEdit ? mapProductToFormValues(productToEdit) : defaultValues,
    mode: 'onChange',
  })

  // Actualizamos el formulario cuando el producto a editar cambia
  useEffect(() => {
    if (productToEdit) {
      const formValues = mapProductToFormValues(productToEdit)
      Object.entries(formValues).forEach(([key, value]) => {
        form.setValue(key as any, value)
      })
    }
  }, [productToEdit, form])

  // Función para mapear un producto a los valores del formulario
  function mapProductToFormValues(product: IProduct): Partial<ProductFormValues> {
    return {
      name: product.name,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      costPerItem: product.costPerItem,
      sku: product.sku,
      barcode: product.barcode,
      quantity: product.quantity,
      category: product.category,
      images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
      attributes:
        typeof product.attributes === 'string'
          ? JSON.parse(product.attributes)
          : product.attributes,
      variants:
        typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants,
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
      status: product.status,
    }
  }

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true)

    try {
      // Preparamos solo los campos básicos que sabemos que son aceptados por la API
      // Usamos Record<string, any> para permitir propiedades dinámicas
      const basicProductData: Record<string, any> = {
        storeId,
        name: data.name,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        costPerItem: data.costPerItem,
        sku: data.sku,
        barcode: data.barcode,
        quantity: data.quantity,
        category: data.category,
        status: data.status,
      }

      // Convertimos los campos complejos a strings JSON si es necesario
      if (data.images && data.images.length > 0) {
        basicProductData.images = JSON.stringify(data.images)
      }

      if (data.attributes && data.attributes.length > 0) {
        basicProductData.attributes = JSON.stringify(data.attributes)
      }

      if (data.variants && data.variants.length > 0) {
        basicProductData.variants = JSON.stringify(data.variants)
      }

      if (data.tags && data.tags.length > 0) {
        basicProductData.tags = JSON.stringify(data.tags)
      }

      let result: IProduct | null

      if (productId) {
        result = await updateProduct({
          id: productId,
          ...basicProductData,
        })

        if (result) {
          toast.success('Producto actualizado', {
            description: `El producto "${result.name}" ha sido actualizado correctamente.`,
          })
        }
      } else {
        // Crear nuevo producto
        result = await createProduct({
          storeId: basicProductData.storeId,
          name: basicProductData.name,
          price: basicProductData.price,
          status: basicProductData.status,
          quantity: basicProductData.quantity,
          description: basicProductData.description,
          compareAtPrice: basicProductData.compareAtPrice,
          costPerItem: basicProductData.costPerItem,
          sku: basicProductData.sku,
          barcode: basicProductData.barcode,
          category: basicProductData.category,
          images: basicProductData.images,
          attributes: basicProductData.attributes,
          variants: basicProductData.variants,
          tags: basicProductData.tags,
        })

        if (result) {
          toast.success('Producto creado', {
            description: `El producto "${result.name}" ha sido creado correctamente.`,
          })
        }
      }

      if (result) {
        router.push(`/store/${storeId}/inventory`)
        router.refresh()
      } else {
        throw new Error('No se pudo guardar el producto')
      }
    } catch (error) {
      console.error('Error al guardar producto:', error)
      toast.error('Error', {
        description: 'Ha ocurrido un error al guardar el producto. Por favor, inténtelo de nuevo.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Información Básica</TabsTrigger>
            <TabsTrigger value="pricing">Precios e Inventario</TabsTrigger>
            <TabsTrigger value="images">Imágenes</TabsTrigger>
            <TabsTrigger value="attributes">Atributos</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-6">
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

          <TabsContent value="pricing" className="space-y-4 mt-6">
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

          <TabsContent value="images" className="space-y-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <ImageUpload
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

          <TabsContent value="attributes" className="space-y-4 mt-6">
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
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button className="bg-gray-800 hover:bg-gray-700" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Producto'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
