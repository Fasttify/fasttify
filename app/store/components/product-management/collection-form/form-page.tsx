import { useRouter, useParams, usePathname } from 'next/navigation'
import { Page, Layout, PageActions, ContextualSaveBar } from '@shopify/polaris'
import useStoreDataStore from '@/context/core/storeDataStore'
import useUserStore from '@/context/core/userStore'
import { useCollections } from '@/app/store/hooks/useCollections'
import { getStoreId } from '@/utils/store-utils'
import { useCollectionForm } from '@/app/store/components/product-management/utils/collection-form-utils'

import { CollectionContent } from '@/app/store/components/product-management/collection-form/components/CollectionContent'
import { CollectionSidebar } from '@/app/store/components/product-management/collection-form/components/CollectionSidebar'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()

export function FormPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const storeId = getStoreId(params, pathname)
  const { currentStore } = useStoreDataStore()
  const { user } = useUserStore()

  const collectionId = (params?.collectionId as string) || (params?.id as string)
  const isEditing = !!collectionId

  const {
    useGetCollection,
    useCreateCollection,
    useUpdateCollection,
    useDeleteCollection,
    addProductToCollection,
    removeProductFromCollection,
  } = useCollections()

  const { data: collectionData } = useGetCollection(collectionId)

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
  })

  const pageTitle = isEditing ? 'Editar colección' : 'Nueva colección'

  const secondaryActions = isEditing
    ? [
        {
          content: 'Eliminar colección',
          destructive: true,
          onAction: handleDeleteCollection,
        },
      ]
    : []

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
  ) : null

  return (
    <Page
      title={pageTitle}
      backAction={{ content: 'Colecciones', onAction: router.back }}
      fullWidth
    >
      {saveBarMarkup}
      <Layout>
        <Layout.Section>
          <CollectionContent
            title={title}
            description={description}
            slug={slug}
            selectedProducts={selectedProducts}
            currentStoreCustomDomain={currentStore?.customDomain || ''}
            onTitleChange={setTitle}
            onDescriptionChange={handleDescriptionChange}
            onAddProduct={handleAddProduct}
            onRemoveProduct={handleRemoveProduct}
          />
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <CollectionSidebar
            isActive={isActive}
            imageUrl={imageUrl}
            onActiveChange={setIsActive}
            onImageChange={handleImageChange}
          />
        </Layout.Section>
      </Layout>

      <PageActions
        primaryAction={{
          content: 'Guardar',
          loading: isSubmitting,
          onAction: handleSaveCollection,
          disabled: !hasUnsavedChanges,
        }}
        secondaryActions={secondaryActions}
      />
    </Page>
  )
}
