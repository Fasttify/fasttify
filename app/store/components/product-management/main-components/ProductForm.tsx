'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import {
  Page,
  Layout,
  Card,
  Button,
  Form,
  FormLayout,
  ContextualSaveBar,
  BlockStack,
  Spinner,
  Select,
  Text,
} from '@shopify/polaris'
import { useToast } from '@/app/store/context/ToastContext'
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
import { BasicInfoSection } from '@/app/store/components/product-management/product-sections/basic-info-section'
import { PricingInventorySection } from '@/app/store/components/product-management/product-sections/pricing-inventory-section'
import { ImageUpload } from '@/app/store/components/product-management/main-components/ImageUpload'
import { AttributesForm } from '@/app/store/components/product-management/main-components/AttributesForm'
import { PublicationSection } from '@/app/store/components/product-management/product-sections/publication-section'

interface ProductFormProps {
  storeId: string
  productId?: string
}

const normalizeStatus = (status: any): 'draft' | 'pending' | 'active' | 'inactive' => {
  const validStatuses = ['draft', 'pending', 'active', 'inactive'] as const
  if (!status || status === '') return 'draft'
  return validStatuses.includes(status) ? status : 'draft'
}

function ProductLoadingState() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
      }}
    >
      <Spinner accessibilityLabel="Cargando producto" />
    </div>
  )
}

export function ProductForm({ storeId, productId }: ProductFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(!!productId)

  const { createProduct, updateProduct, fetchProduct } = useProducts(storeId, {
    skipInitialFetch: true,
  })

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  const {
    formState: { isDirty },
  } = form

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
          formValues.status = normalizeStatus(formValues.status)
          formValues.category = formValues.category || ''
          form.reset(formValues)
        }
      } catch (error) {
        console.error('Error loading product:', error)
        showToast('No se pudo cargar el producto. Por favor, inténtelo de nuevo.', true)
      } finally {
        setIsLoadingProduct(false)
      }
    }

    loadProduct()
  }, [productId, fetchProduct, form, showToast])

  const handleSave = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const isValid = await form.trigger()
      if (!isValid) {
        showToast('Por favor, complete todos los campos requeridos.', true)
        throw new Error('Validation failed')
      }
      const data = form.getValues()
      const basicProductData = prepareProductData(data, storeId)
      const result = productId
        ? await handleProductUpdate(basicProductData, productId, storeId, updateProduct)
        : await handleProductCreate(basicProductData, createProduct)

      if (result) {
        form.reset(form.getValues()) // Resets dirty state
        showToast(`Producto ${productId ? 'actualizado' : 'creado'} con éxito.`)
        router.push(`/store/${storeId}/products`)
      } else {
        throw new Error(productId ? 'Error al actualizar producto' : 'Error al crear producto')
      }
    } catch (error) {
      if (!(error instanceof Error && error.message === 'Validation failed')) {
        showToast('Ha ocurrido un error al guardar el producto.', true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [form, storeId, productId, updateProduct, createProduct, router, showToast])

  if (isLoadingProduct) {
    return <ProductLoadingState />
  }

  const categoryOptions = [
    { label: 'Ropa', value: 'Ropa' },
    { label: 'Electrónica', value: 'Electronicos' },
    { label: 'Hogar y Cocina', value: 'Hogar' },
    { label: 'Belleza y Cuidado Personal', value: 'Belleza' },
    { label: 'Deportes y Aire Libre', value: 'Deporte' },
  ]

  const statusOptions = [
    { label: 'Borrador', value: 'draft' },
    { label: 'Pendiente', value: 'pending' },
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
  ]

  return (
    <Page
      backAction={{
        content: 'Productos',
        onAction: () => router.push(`/store/${storeId}/products`),
      }}
      title={productId ? 'Editar producto' : 'Añadir producto'}
      primaryAction={{
        content: 'Guardar',
        onAction: handleSave,
        loading: isSubmitting,
        disabled: !isDirty,
      }}
    >
      <Form onSubmit={handleSave}>
        {isDirty && (
          <ContextualSaveBar
            message="Cambios sin guardar"
            saveAction={{
              onAction: handleSave,
              loading: isSubmitting,
              content: 'Guardar',
            }}
            discardAction={{
              onAction: () => form.reset(),
              content: 'Descartar',
            }}
          />
        )}
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <BasicInfoSection form={form} />
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Imágenes
                  </Text>
                  <Controller
                    name="images"
                    control={form.control}
                    render={({ field }) => (
                      <ImageUpload
                        storeId={storeId}
                        value={field.value ?? []}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </BlockStack>
              </Card>
              <PricingInventorySection form={form} />
              <Card>
                <Controller
                  name="attributes"
                  control={form.control}
                  render={({ field }) => (
                    <AttributesForm value={field.value ?? []} onChange={field.onChange} />
                  )}
                />
              </Card>
            </BlockStack>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Estado
                  </Text>
                  <Controller
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        label="Estado del producto"
                        labelHidden
                        options={statusOptions}
                        onChange={field.onChange}
                        value={field.value}
                      />
                    )}
                  />
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Categoría
                  </Text>
                  <Controller
                    name="category"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        label="Categoría del producto"
                        labelHidden
                        options={categoryOptions}
                        onChange={field.onChange}
                        value={field.value}
                      />
                    )}
                  />
                </BlockStack>
              </Card>
              <PublicationSection form={form} />
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Form>
    </Page>
  )
}
