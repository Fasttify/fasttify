import { ArrowLeft, Edit } from 'lucide-react'
import { Loader } from '@/components/ui/loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DescriptionEditor } from '@/app/store/components/product-management/collection-form/description-editor'
import { ProductSection } from '@/app/store/components/product-management/collection-form/product-section'
import { PublicationSection } from '@/app/store/components/product-management/collection-form/publication-section'
import { ImageSection } from '@/app/store/components/product-management/collection-form/image-section'
import { useRouter, useParams, usePathname } from 'next/navigation'
import useStoreDataStore from '@/zustand-states/storeDataStore'
import useUserStore from '@/zustand-states/userStore'
import { useCollections } from '@/app/store/hooks/useCollections'
import { Amplify } from 'aws-amplify'
import { getStoreId } from '@/utils/store-utils'
import outputs from '@/amplify_outputs.json'
import { UnsavedChangesAlert } from '@/components/ui/unsaved-changes-alert'
import { useCollectionForm } from '@/app/store/components/product-management/utils/collection-form-utils'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
})

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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={router.back}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-medium">
              {isEditing ? 'Editar colección' : 'Nueva colección'}
            </h1>
          </div>
          <Button
            variant="outline"
            className="bg-gray-100 hover:bg-gray-200 rounded-md px-4 py-1 h-8 text-sm"
          >
            Ver
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Title Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Título
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="border-gray-300"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Descripción
                  </label>
                  <DescriptionEditor
                    initialValue={description}
                    onChange={handleDescriptionChange}
                  />
                </div>
              </div>
            </div>

            {/* Products Section */}
            <ProductSection
              selectedProducts={selectedProducts}
              onAddProduct={handleAddProduct}
              onRemoveProduct={handleRemoveProduct}
            />

            {/* SEO Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-medium">Publicación del motor de búsqueda</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="text-sm">Mi tienda</div>
                <div className="text-xs text-blue-600">
                  {currentStore?.customDomain} › collections › {slug || 'frontpage'}
                </div>
                <div className="text-blue-600 text-base font-medium">{title}</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Publication Section */}
            <PublicationSection isActive={isActive} onActiveChange={setIsActive} />

            {/* Image Section */}
            <ImageSection imageUrl={imageUrl} onImageChange={handleImageChange} />

            {/* Theme Template Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-sm font-medium mb-4">Plantilla de tema</h2>
              <Select defaultValue="coleccion">
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Seleccionar plantilla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coleccion">Colección predeterminada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">
          {isEditing && (
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteCollection}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Eliminando...' : 'Eliminar colección'}
            </Button>
          )}
          <Button
            className="bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
            onClick={handleSaveCollection}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader color="white" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </div>
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
