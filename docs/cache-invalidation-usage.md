# Guía de Uso: Invalidación Automática de Caché

## 🎯 **Invalidación Automática Integrada**

Todos los hooks CRUD ahora incluyen invalidación automática de caché. No necesitas hacer nada adicional.

## 📋 **Ejemplos de Uso**

### **Productos**

```typescript
import { useProducts } from '@/app/store/hooks/data/useProducts';

function ProductManager({ storeId }: { storeId: string }) {
  const { createProductMutation, updateProductMutation, deleteProductMutation } = useProducts(storeId);

  // ✅ Crear producto - Invalidación automática
  const handleCreate = async (productData) => {
    await createProductMutation.mutateAsync(productData);
    // La caché se invalida automáticamente
  };

  // ✅ Actualizar producto - Invalidación automática
  const handleUpdate = async (productId, productData) => {
    await updateProductMutation.mutateAsync({ id: productId, ...productData });
    // La caché se invalida automáticamente
  };

  // ✅ Eliminar producto - Invalidación automática
  const handleDelete = async (productId) => {
    await deleteProductMutation.mutateAsync(productId);
    // La caché se invalida automáticamente
  };
}
```

### **Colecciones**

```typescript
import { useCollections } from '@/app/store/hooks/data/useCollections';

function CollectionManager({ storeId }: { storeId: string }) {
  const { useCreateCollection, useUpdateCollection, useDeleteCollection } = useCollections();

  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();

  // ✅ Crear colección - Invalidación automática
  const handleCreate = async (collectionData) => {
    await createCollection.mutateAsync(collectionData);
    // La caché se invalida automáticamente
  };

  // ✅ Actualizar colección - Invalidación automática
  const handleUpdate = async (collectionId, collectionData) => {
    await updateCollection.mutateAsync({ id: collectionId, data: collectionData });
    // La caché se invalida automáticamente
  };

  // ✅ Eliminar colección - Invalidación automática
  const handleDelete = async (collectionId) => {
    await deleteCollection.mutateAsync({ id: collectionId, storeId });
    // La caché se invalida automáticamente
  };
}
```

### **Páginas**

```typescript
import { usePages } from '@/app/store/hooks/data/usePage';

function PageManager({ storeId }: { storeId: string }) {
  const { useCreatePage, useUpdatePage, useDeletePage } = usePages(storeId);

  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();

  // ✅ Crear página - Invalidación automática
  const handleCreate = async (pageData) => {
    await createPage.mutateAsync(pageData);
    // La caché se invalida automáticamente
  };

  // ✅ Actualizar página - Invalidación automática
  const handleUpdate = async (pageId, pageData) => {
    await updatePage.mutateAsync({ id: pageId, data: pageData });
    // La caché se invalida automáticamente
  };

  // ✅ Eliminar página - Invalidación automática
  const handleDelete = async (pageId) => {
    await deletePage.mutateAsync(pageId);
    // La caché se invalida automáticamente
  };
}
```

### **Navegación**

```typescript
import { useNavigationMenus } from '@/app/store/hooks/data/useNavigationMenus';

function NavigationManager({ storeId }: { storeId: string }) {
  const { useCreateNavigationMenu, useUpdateNavigationMenu, useDeleteNavigationMenu } = useNavigationMenus();

  const createMenu = useCreateNavigationMenu();
  const updateMenu = useUpdateNavigationMenu();
  const deleteMenu = useDeleteNavigationMenu();

  // ✅ Crear menú - Invalidación automática
  const handleCreate = async (menuData) => {
    await createMenu.mutateAsync(menuData);
    // La caché se invalida automáticamente
  };

  // ✅ Actualizar menú - Invalidación automática
  const handleUpdate = async (menuId, menuData) => {
    await updateMenu.mutateAsync({ id: menuId, data: menuData });
    // La caché se invalida automáticamente
  };

  // ✅ Eliminar menú - Invalidación automática
  const handleDelete = async (menuId) => {
    await deleteMenu.mutateAsync({ id: menuId, storeId });
    // La caché se invalida automáticamente
  };
}
```

## 🔄 **Qué Se Invalida Automáticamente**

### **Productos:**

- ✅ Producto específico
- ✅ Lista de productos
- ✅ Productos destacados
- ✅ Búsquedas relacionadas
- ✅ Colecciones que contengan el producto

### **Colecciones:**

- ✅ Colección específica
- ✅ Lista de colecciones
- ✅ Menús de navegación

### **Páginas:**

- ✅ Página específica
- ✅ Lista de páginas
- ✅ Menús de navegación

### **Navegación:**

- ✅ Menús de navegación

## 🚀 **Beneficios**

1. **Automático:** No necesitas recordar invalidar caché
2. **Transparente:** Los componentes no necesitan saber sobre caché
3. **Consistente:** Todas las operaciones CRUD invalidan automáticamente
4. **Doble invalidación:** React Query + Motor de renderizado
5. **Datos frescos:** Los usuarios ven cambios inmediatamente

## ⚠️ **Notas Importantes**

- **Eliminación:** Para eliminar colecciones y menús, debes pasar `{ id, storeId }`
- **StoreId requerido:** Asegúrate de tener el `storeId` disponible en el contexto
- **Error handling:** Las invalidaciones no bloquean las operaciones principales
- **Logging:** Todas las invalidaciones se registran en los logs

## ✅ **Validaciones Implementadas**

Todos los hooks incluyen validaciones robustas para prevenir errores:

### **Validaciones de Eliminación**

```typescript
// ✅ Correcto - Pasar objeto con id y storeId
await deleteCollection.mutateAsync({
  id: 'collection-id',
  storeId: 'store-id',
});

// ❌ Incorrecto - Solo pasar id (causará error)
await deleteCollection.mutateAsync('collection-id');
```

### **Mensajes de Error Descriptivos**

- `"Collection ID is required for deletion"`
- `"Store ID is required for cache invalidation"`
- `"Page ID is required for deletion"`
- `"Navigation menu ID is required for deletion"`

### **Validaciones Automáticas**

- ✅ Verificación de `id` no nulo antes de operaciones de eliminación
- ✅ Verificación de `storeId` para invalidación de caché
- ✅ Validación de parámetros requeridos en todas las mutaciones
- ✅ Manejo de errores consistente en todos los hooks
