// Main components
export { FormPage } from '@/app/store/components/product-management/collection-form/form-page'
export { ProductSection } from '@/app/store/components/product-management/collection-form/product-section'

// Sub-components
export { CollectionContent } from '@/app/store/components/product-management/collection-form/components/CollectionContent'
export { CollectionSidebar } from '@/app/store/components/product-management/collection-form/components/CollectionSidebar'
export { ProductControls } from '@/app/store/components/product-management/collection-form/components/ProductControls'
export { SelectedProductsList } from '@/app/store/components/product-management/collection-form/components/SelectedProductsList'
export { ProductSelectionDialog } from '@/app/store/components/product-management/collection-form/components/ProductSelectionDialog'

// Hooks
export { useProductSelection } from '@/app/store/components/product-management/collection-form/hooks/useProductSelection'

// Types
export type {
  ProductSectionProps,
  ProductItemProps,
  ProductSelectionDialogProps,
  SortOption,
  IProduct,
} from '@/app/store/components/product-management/collection-form/types/productTypes'

// Utils
export {
  filterProducts,
  sortProducts,
  getProductImageUrl,
  formatPrice,
} from '@/app/store/components/product-management/collection-form/utils/productUtils'

// Config
export { configureAmplify } from '@/lib/amplify-config'
