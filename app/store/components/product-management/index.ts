/**
 * Productos
 */
// Páginas
export { ProductManager } from './products/pages/ProductManager';
export { ProductsPage } from './products/pages/ProductPage';

// Componentes
export { ProductForm } from './products/components/form/ProductForm';
export { ProductCardMobile } from './products/components/listing/ProductCardMobile';
export { ProductEmptyState } from './products/components/listing/ProductEmtyState';
export { ProductFilters } from './products/components/listing/ProductFilters';
export { ProductList } from './products/components/listing/ProductList';
export { ProductPagination } from './products/components/listing/ProductPagination';
export { ProductTableDesktop } from './products/components/listing/ProductTableDesktop';

// Hooks
export { usePriceSuggestion } from './products/hooks/usePriceSuggestion';
export { useProductDescription } from './products/hooks/useProductDescription';
export { useProductFilters } from './products/hooks/useProductFilters';
export { useProductSelection } from './products/hooks/useProductSelection';

// Utilidades
export * from './products/utils/displayUtils';
export * from './products/utils/formUtils';

/**
 * Colecciones
 */
// Páginas
export { FormPage as CollectionFormPage } from './collections/pages/CollectionFormPage';
export { CollectionsPage } from './collections/pages/CollectionsPage';

// Componentes
export { CollectionContent } from './collections/components/form/CollectionContent';
export { CollectionSidebar } from './collections/components/form/CollectionSidebar';
export { ProductControls } from './collections/components/form/ProductControls';
export { ProductSelectionDialog } from './collections/components/form/ProductSelectionDialog';
export { SelectedProductsList } from './collections/components/form/SelectedProductsList';

// Hooks
export { useProductSelection as useCollectionProductSelection } from './collections/hooks/useProductSelection';
export { useCollectionForm } from './collections/utils/formUtils';

// Utilidades
export {
  filterProducts as filterCollectionProducts,
  getProductImageUrl as getCollectionProductImageUrl,
  sortProducts as sortCollectionProducts,
} from './collections/utils/collectionUtils';

/**
 * Inventario
 */
// Páginas
export { InventoryManager } from './inventory/pages/InventoryManager';
export { InventoryPage } from './inventory/pages/InventoryPage';
export { InventoryTracking } from './inventory/pages/InventoryTracking';

// Componentes
export { default as InventoryActions } from './inventory/components/InventoryActions';
export { InventoryCardMobile } from './inventory/components/InventoryCardMobile';
export { default as InventoryFilter } from './inventory/components/InventoryFilter';
export { default as InventoryFooter } from './inventory/components/InventoryFooter';
export { default as InventoryHeader } from './inventory/components/InventoryHeader';
export { default as InventoryTable } from './inventory/components/InventoryTable';

/**
 * Utilidades Compartidas
 */
export * from './shared/utils/commonUtils';
export * from './shared/utils/exportUtils';
