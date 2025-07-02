import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/store/context/ToastContext';
import { IProduct } from '@/app/store/hooks/data/useProducts';
import { CollectionInput } from '@/app/store/hooks/data/useCollections';
import { routes } from '@/utils/routes';

export interface CollectionFormState {
  title: string;
  description: string;
  slug: string;
  isActive: boolean;
  imageUrl: string;
  selectedProducts: IProduct[];
}

export interface CollectionFormActions {
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setSlug: (slug: string) => void;
  setIsActive: (isActive: boolean) => void;
  setImageUrl: (imageUrl: string) => void;
  handleAddProduct: (product: IProduct) => void;
  handleRemoveProduct: (productId: string) => void;
}

export interface UseCollectionFormProps {
  isEditing: boolean;
  collectionId: string;
  storeId: string;
  collectionData: any;
  currentStore: any;
  user: any;
  useCreateCollection: any;
  useUpdateCollection: any;
  useDeleteCollection: any;
  addProductToCollection: (collectionId: string, productId: string) => Promise<any>;
  removeProductFromCollection: (productId: string) => Promise<any>;
}

export const useCollectionForm = ({
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
}: UseCollectionFormProps) => {
  const router = useRouter();
  const { showToast } = useToast();

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Estados para el formulario
  const [title, setTitle] = useState('Página de inicio');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para controlar cambios sin guardar
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormState, setInitialFormState] = useState({
    title: '',
    description: '',
    slug: '',
    isActive: true,
    imageUrl: '',
  });

  // Estado para almacenar los productos seleccionados
  const [selectedProducts, setSelectedProducts] = useState<IProduct[]>([]);
  const [initialSelectedProducts, setInitialSelectedProducts] = useState<IProduct[]>([]);

  // Mutaciones para crear, actualizar y eliminar colecciones
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();

  // Cargar datos de la colección si estamos editando
  useEffect(() => {
    if (isEditing && collectionData) {
      const title = collectionData.title || '';
      const description = collectionData.description || '';
      const slug = collectionData.slug || '';
      const isActive = collectionData.isActive;
      const imageUrl = collectionData.image || '';

      // Establecer valores iniciales
      setTitle(title);
      setDescription(description);
      setSlug(slug);
      setIsActive(isActive);
      setImageUrl(imageUrl);

      // Guardar estado inicial del formulario
      setInitialFormState({
        title,
        description,
        slug,
        isActive,
        imageUrl,
      });

      // Si hay productos en la colección, establecerlos como seleccionados
      if (collectionData.products && collectionData.products.length > 0) {
        setSelectedProducts(collectionData.products);
        setInitialSelectedProducts(collectionData.products);
      }

      setIsDataLoaded(true);
    } else if (!isEditing) {
      // Para nueva colección, establecer valores por defecto
      const defaultTitle = 'Página de inicio';
      setInitialFormState({
        title: defaultTitle,
        description: '',
        slug: '',
        isActive: true,
        imageUrl: '',
      });

      setIsDataLoaded(true);
    }
  }, [isEditing, collectionData]);

  // Detectar cambios en el formulario
  useEffect(() => {
    if (isDataLoaded && !isSubmitting) {
      const currentState = {
        title,
        description,
        slug,
        isActive,
        imageUrl,
      };

      const productsChanged = JSON.stringify(selectedProducts) !== JSON.stringify(initialSelectedProducts);

      const formChanged =
        currentState.title !== initialFormState.title ||
        currentState.description !== initialFormState.description ||
        currentState.slug !== initialFormState.slug ||
        currentState.isActive !== initialFormState.isActive ||
        currentState.imageUrl !== initialFormState.imageUrl ||
        productsChanged;

      setHasUnsavedChanges(formChanged);
    }
  }, [
    title,
    description,
    slug,
    isActive,
    imageUrl,
    selectedProducts,
    initialFormState,
    initialSelectedProducts,
    isSubmitting,
    isDataLoaded,
  ]);

  // Función para añadir un producto a la selección
  const handleAddProduct = (product: IProduct) => {
    setSelectedProducts((prev) => [...prev, product]);
  };

  // Función para eliminar un producto de la selección
  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Función para manejar la descripción desde el editor
  const handleDescriptionChange = (content: string) => {
    setDescription(content);
  };

  // Función para manejar la imagen seleccionada
  const handleImageChange = (url: string) => {
    setImageUrl(url);
  };

  // Función para guardar la colección
  const handleSaveCollection = async () => {
    if (!currentStore?.storeId || !user?.userId) {
      showToast('No se pudo identificar la tienda o el usuario.', true);
      return;
    }

    setIsSubmitting(true);

    try {
      const collectionData: CollectionInput = {
        storeId: currentStore.storeId,
        title,
        description,
        image: imageUrl,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
        isActive,
        sortOrder: 0,
        owner: user.userId,
      };

      let savedCollection;

      if (isEditing) {
        // Actualizar colección existente
        const { owner, ...dataWithoutOwner } = collectionData;
        savedCollection = await updateCollection.mutateAsync({
          id: collectionId,
          data: dataWithoutOwner,
        });

        // Obtener los productos actuales de la colección
        const currentProductIds = new Set(initialSelectedProducts.map((p) => p.id));
        const newProductIds = new Set(selectedProducts.map((p) => p.id));

        // Productos a eliminar (están en currentProductIds pero no en newProductIds)
        for (const product of initialSelectedProducts) {
          if (!newProductIds.has(product.id)) {
            // Eliminar producto de la colección
            await removeProductFromCollection(product.id);
          }
        }

        // Productos a añadir (están en newProductIds pero no en currentProductIds)
        for (const product of selectedProducts) {
          if (!currentProductIds.has(product.id)) {
            // Añadir producto a la colección
            await addProductToCollection(savedCollection.id, product.id);
          }
        }
      } else {
        // Crear nueva colección
        savedCollection = await createCollection.mutateAsync(collectionData);

        // Añadir todos los productos seleccionados a la nueva colección
        for (const product of selectedProducts) {
          await addProductToCollection(savedCollection.id, product.id);
        }
      }

      // Actualizar estado inicial para reflejar el estado actual
      setInitialFormState({
        title,
        description,
        slug,
        isActive,
        imageUrl,
      });
      setInitialSelectedProducts([...selectedProducts]);
      setHasUnsavedChanges(false);

      showToast('Colección guardada exitosamente.');

      // Redirigir a la lista de colecciones
      await router.push(routes.store.products.collections(storeId));
    } catch (error) {
      console.error('Error saving collection:', error);
      showToast('Error al guardar la colección.', true);
    }
  };

  // Función para eliminar la colección
  const handleDeleteCollection = async () => {
    if (!isEditing) return;

    if (confirm('¿Estás seguro de que deseas eliminar esta colección?')) {
      setIsSubmitting(true);
      try {
        await deleteCollection.mutateAsync(collectionId);
        showToast('Colección eliminada.');
        // Esperar a que el redirect termine antes de quitar el loading
        await router.push(routes.store.products.collections(storeId));
      } catch (error) {
        console.error('Error deleting collection:', error);
        showToast('Error al eliminar la colección.', true);
        setIsSubmitting(false);
      }
    }
  };

  // Función para descartar cambios
  const handleDiscardChanges = () => {
    if (isEditing && collectionData) {
      setTitle(initialFormState.title);
      setDescription(initialFormState.description);
      setSlug(initialFormState.slug);
      setIsActive(initialFormState.isActive);
      setImageUrl(initialFormState.imageUrl);
      setSelectedProducts(initialSelectedProducts);
    } else {
      // Para nueva colección, restablecer a valores por defecto
      setTitle('Página de inicio');
      setDescription('');
      setSlug('');
      setIsActive(true);
      setImageUrl('');
      setSelectedProducts([]);
    }
    setHasUnsavedChanges(false);
  };

  return {
    // Estado
    title,
    description,
    slug,
    isActive,
    imageUrl,
    isSubmitting,
    hasUnsavedChanges,
    selectedProducts,
    isDataLoaded,

    // Acciones
    setTitle,
    setDescription,
    setSlug,
    setIsActive,
    setImageUrl,
    setIsSubmitting,
    handleAddProduct,
    handleRemoveProduct,
    handleDescriptionChange,
    handleImageChange,
    handleSaveCollection,
    handleDeleteCollection,
    handleDiscardChanges,
  };
};
