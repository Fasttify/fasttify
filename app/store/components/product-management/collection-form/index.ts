// Main components
export { FormPage } from './form-page'
export { ProductSection } from './product-section'

// Sub-components
export { CollectionHeader } from './components/CollectionHeader'
export { CollectionContent } from './components/CollectionContent'
export { CollectionSidebar } from './components/CollectionSidebar'
export { CollectionFooter } from './components/CollectionFooter'
export { ProductControls } from './components/ProductControls'
export { SelectedProductsList } from './components/SelectedProductsList'
export { ProductSelectionDialog } from './components/ProductSelectionDialog'
export { ProductItem } from './components/ProductItem'

// Hooks
export { useProductSelection } from './hooks/useProductSelection'

// Types
export type {
  ProductSectionProps,
  ProductItemProps,
  ProductSelectionDialogProps,
  SortOption,
  IProduct,
} from './types/productTypes'

// Utils
export { filterProducts, sortProducts, getProductImageUrl, formatPrice } from './utils/productUtils'

// Config
export { configureAmplify } from './config/amplifyConfig'
