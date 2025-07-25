import { CollectionContent } from '@/app/store/components/product-management/collections/components/form/CollectionContent';
import { CollectionSidebar } from '@/app/store/components/product-management/collections/components/form/CollectionSidebar';
import { useCollectionForm } from '@/app/store/components/product-management/collections/utils/formUtils';
import { useCollections } from '@/app/store/hooks/data/useCollections';
import useStoreDataStore from '@/context/core/storeDataStore';
import useUserStore from '@/context/core/userStore';
import { routes } from '@/utils/client/routes';
import { getStoreId } from '@/utils/client/store-utils';
import { BlockStack, Card, ContextualSaveBar, Layout, Loading, Page, Text } from '@shopify/polaris';
import { useParams, usePathname, useRouter } from 'next/navigation';

export function FormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const storeId = getStoreId(params, pathname);
  const { currentStore } = useStoreDataStore();
  const { user } = useUserStore();

  const collectionId = (params?.collectionId as string) || (params?.id as string);
  const isEditing = !!collectionId;

  const {
    useGetCollection,
    useCreateCollection,
    useUpdateCollection,
    useDeleteCollection,
    addProductToCollection,
    removeProductFromCollection,
  } = useCollections();

  const { data: collectionData, isLoading: isLoadingCollectionData } = useGetCollection(collectionId);

  const {
    title,
    description,
    slug,
    isActive,
    imageUrl,
    isSubmitting,
    hasUnsavedChanges,
    selectedProducts,

    setTitle,
    setIsActive,
    handleAddProduct,
    handleRemoveProduct,
    handleDescriptionChange,
    handleImageChange,
    handleSaveCollection,
    handleDeleteCollection,
    handleDiscardChanges,
  } = useCollectionForm({
    isEditing,
    collectionId,
    storeId,
    collectionData,
    currentStore,
    user,
    useCreateCollection,
    useUpdateCollection,
    useDeleteCollection,
    addProductToCollection,
    removeProductFromCollection,
  });

  const pageTitle = isEditing ? 'Editar colección' : 'Nueva colección';
  const customDomain = currentStore?.defaultDomain || '';

  const secondaryActions = isEditing
    ? [
        {
          content: 'Eliminar colección',
          destructive: true,
          onAction: handleDeleteCollection,
          disabled: isSubmitting,
        },
      ]
    : [];

  const saveBarMarkup = hasUnsavedChanges ? (
    <ContextualSaveBar
      message="Cambios sin guardar"
      saveAction={{
        onAction: handleSaveCollection,
        loading: isSubmitting,
      }}
      discardAction={{
        onAction: handleDiscardChanges,
      }}
    />
  ) : null;

  if (isLoadingCollectionData && !isSubmitting) {
    return <Loading />;
  }

  return (
    <Page
      backAction={{
        content: 'Colecciones',
        onAction: () => router.push(routes.store.products.collections(storeId)),
      }}
      title={pageTitle}
      primaryAction={{
        content: 'Guardar',
        onAction: handleSaveCollection,
        loading: isSubmitting,
        disabled: !hasUnsavedChanges,
      }}
      secondaryActions={secondaryActions}>
      {saveBarMarkup}
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Información de la Colección
                </Text>
                <CollectionContent
                  title={title}
                  description={description}
                  slug={slug}
                  selectedProducts={selectedProducts}
                  currentStoreCustomDomain={customDomain}
                  onTitleChange={setTitle}
                  onDescriptionChange={handleDescriptionChange}
                  onAddProduct={handleAddProduct}
                  onRemoveProduct={handleRemoveProduct}
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Imágenes
                </Text>
                <CollectionSidebar
                  isActive={isActive}
                  imageUrl={imageUrl}
                  onActiveChange={setIsActive}
                  onImageChange={handleImageChange}
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
