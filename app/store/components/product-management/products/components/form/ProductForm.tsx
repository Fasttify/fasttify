'use client';

import { lazy, Suspense } from 'react';
import { SkeletonBodyText, SkeletonDisplayText, Box, BlockStack } from '@shopify/polaris';

// Lazy load de componentes pesados del formulario
const BasicInfoSection = lazy(() =>
  import('./BasicInfoSection').then((module) => ({ default: module.BasicInfoSection }))
);
const CustomContextualSaveBar = lazy(() =>
  import('./ContextualSaveBar').then((module) => ({ default: module.CustomContextualSaveBar }))
);
const ProductFormLayout = lazy(() =>
  import('./ProductFormLayout').then((module) => ({ default: module.ProductFormLayout }))
);
const ProductFormSidebar = lazy(() =>
  import('./ProductFormSidebar').then((module) => ({ default: module.ProductFormSidebar }))
);

// Componente de loading que se carga inmediatamente
import { ProductFormLoading } from './ProductFormLoading';
import { useProductFormActions } from '@/app/store/components/product-management/products/hooks/useProductFormActions';
import { useProductFormData } from '@/app/store/components/product-management/products/hooks/useProductFormData';
import { routes } from '@/utils/client/routes';
import { Form, Layout, Page } from '@shopify/polaris';
import { useRouter } from 'next/navigation';

interface ProductFormProps {
  storeId: string;
  productId?: string;
}

export function ProductForm({ storeId, productId }: ProductFormProps) {
  const router = useRouter();

  // Hooks personalizados para manejar la lógica del formulario
  const { form, isDirty, isLoadingProduct } = useProductFormData({ storeId, productId });
  const { isSubmitting, handleSave } = useProductFormActions({ storeId, productId, form });

  if (isLoadingProduct) {
    return <ProductFormLoading />;
  }

  return (
    <Page
      backAction={{
        content: 'Productos',
        onAction: () => router.push(routes.store.products.main(storeId)),
      }}
      title={productId ? 'Editar producto' : 'Añadir producto'}
      primaryAction={{
        content: 'Guardar',
        onAction: handleSave,
        loading: isSubmitting,
        disabled: !isDirty,
      }}>
      <Form onSubmit={handleSave}>
        <Suspense
          fallback={
            <Box padding="400">
              <BlockStack gap="200">
                <SkeletonBodyText lines={1} />
                <SkeletonBodyText lines={1} />
              </BlockStack>
            </Box>
          }>
          <CustomContextualSaveBar
            isDirty={isDirty}
            isSubmitting={isSubmitting}
            onSave={handleSave}
            onDiscard={() => form.reset()}
            saveMessage="Cambios sin guardar"
            saveButtonText="Guardar"
            discardButtonText="Descartar"
            navigateBackOnDiscard={true}
            router={router}
          />
        </Suspense>
        <Layout>
          <Layout.Section>
            <Suspense
              fallback={
                <Box padding="400">
                  <BlockStack gap="400">
                    <SkeletonDisplayText size="medium" />
                    <SkeletonBodyText lines={3} />
                    <Box paddingBlockStart="400">
                      <SkeletonBodyText lines={2} />
                    </Box>
                    <Box paddingBlockStart="400">
                      <SkeletonBodyText lines={1} />
                    </Box>
                  </BlockStack>
                </Box>
              }>
              <BasicInfoSection form={form} />
            </Suspense>
            <Box paddingBlockStart="400" />
            <Suspense
              fallback={
                <Box padding="400">
                  <BlockStack gap="400">
                    <SkeletonDisplayText size="medium" />
                    <SkeletonBodyText lines={4} />
                    <Box paddingBlockStart="400">
                      <SkeletonBodyText lines={3} />
                    </Box>
                    <Box paddingBlockStart="400">
                      <SkeletonBodyText lines={2} />
                    </Box>
                    <Box paddingBlockStart="400">
                      <SkeletonBodyText lines={1} />
                    </Box>
                  </BlockStack>
                </Box>
              }>
              <ProductFormLayout storeId={storeId} form={form} />
            </Suspense>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Suspense
              fallback={
                <Box padding="400">
                  <BlockStack gap="400">
                    <SkeletonDisplayText size="small" />
                    <SkeletonBodyText lines={2} />
                    <Box paddingBlockStart="400">
                      <SkeletonBodyText lines={3} />
                    </Box>
                    <Box paddingBlockStart="400">
                      <SkeletonBodyText lines={1} />
                    </Box>
                  </BlockStack>
                </Box>
              }>
              <ProductFormSidebar form={form} />
            </Suspense>
          </Layout.Section>
        </Layout>
      </Form>
    </Page>
  );
}
