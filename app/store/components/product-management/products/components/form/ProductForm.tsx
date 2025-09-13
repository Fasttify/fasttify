'use client';

import { BasicInfoSection } from '@/app/store/components/product-management/products/components/form/BasicInfoSection';
import { CustomContextualSaveBar } from '@/app/store/components/product-management/products/components/form/ContextualSaveBar';
import { ProductFormLayout } from '@/app/store/components/product-management/products/components/form/ProductFormLayout';
import { ProductFormLoading } from '@/app/store/components/product-management/products/components/form/ProductFormLoading';
import { ProductFormSidebar } from '@/app/store/components/product-management/products/components/form/ProductFormSidebar';
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
        <Layout>
          <Layout.Section>
            <BasicInfoSection form={form} />
            <ProductFormLayout storeId={storeId} form={form} />
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <ProductFormSidebar form={form} />
          </Layout.Section>
        </Layout>
      </Form>
    </Page>
  );
}
