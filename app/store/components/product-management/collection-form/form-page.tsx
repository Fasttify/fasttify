import { useRouter, useParams, usePathname } from 'next/navigation'
import useStoreDataStore from '@/context/core/storeDataStore'
import useUserStore from '@/context/core/userStore'
import { useCollections } from '@/app/store/hooks/useCollections'
import { getStoreId } from '@/utils/store-utils'
import { UnsavedChangesAlert } from '@/components/ui/unsaved-changes-alert'
import { useCollectionForm } from '@/app/store/components/product-management/utils/collection-form-utils'

import { CollectionHeader } from '@/app/store/components/product-management/collection-form/components/CollectionHeader'
import { CollectionContent } from '@/app/store/components/product-management/collection-form/components/CollectionContent'
import { CollectionSidebar } from '@/app/store/components/product-management/collection-form/components/CollectionSidebar'
import { CollectionFooter } from '@/app/store/components/product-management/collection-form/components/CollectionFooter'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()

export function FormPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const storeId = getStoreId(params, pathname)
  const { currentStore } = useStoreDataStore()
  const { user } = useUserStore()

  // Obtener el ID de la colección de los parámetros
  const collectionId = (params?.collectionId as string) || (params?.id as string)
  const isEditing = !!collectionId

  // Usar el hook de colecciones
  const {
    useGetCollection,
    useCreateCollection,
    useUpdateCollection,
    useDeleteCollection,
    addProductToCollection,
    removeProductFromCollection,
  } = useCollections()

  // Consultar datos de la colección si estamos editando
  const { data: collectionData, isLoading, error } = useGetCollection(collectionId || '')

  // Usar el hook personalizado para la lógica del formulario
  const {
    title,
    description,
    slug,
    isActive,
    imageUrl,
    isSubmitting,
    hasUnsavedChanges,
    selectedProducts,
    isDataLoaded,
    setTitle,
    setIsActive,
    setIsSubmitting,
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans mt-8">
      <div className="max-w-7xl mx-auto p-4">
        <CollectionHeader isEditing={isEditing} onBack={router.back} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <CollectionSidebar
            isActive={isActive}
            imageUrl={imageUrl}
            onActiveChange={setIsActive}
            onImageChange={handleImageChange}
          />
        </div>

        <CollectionFooter
          isEditing={isEditing}
          isSubmitting={isSubmitting}
          onSave={handleSaveCollection}
          onDelete={isEditing ? handleDeleteCollection : undefined}
        />
      </div>

      {/* Alerta de cambios sin guardar - only show if data is loaded */}
      {hasUnsavedChanges && !isSubmitting && isDataLoaded && (
        <UnsavedChangesAlert
          onSave={handleSaveCollection}
          onDiscard={handleDiscardChanges}
          setIsSubmitting={setIsSubmitting}
        />
      )}
    </div>
  )
}
