export interface FiltersOptions {
  style?: 'sidebar' | 'horizontal' | 'modal';
  maxCategories?: number;
  maxTags?: number;
  only?: string[];
  except?: string[];
  cssClass?: string;
  customTemplate?: string;
  productRenderer?: string;
  productGridSelector?: string;
  noResultsMessage?: string;
  loadingMessage?: string;
  productsPerPage?: number;
}

export interface CustomProductRenderer {
  template: string;
  cssClass?: string;
  containerClass?: string;
}

export interface CustomFiltersConfig {
  cssFramework?: 'bootstrap' | 'tailwind' | 'bulma' | 'custom';
  theme?: 'default' | 'minimal' | 'modern' | 'custom';
  customCSS?: string;
  productTemplate?: string;
  containerSelector?: string;
}

export interface AvailableFilters {
  categories: string[];
  tags: string[];
  priceRange: {
    min: number;
    max: number;
  };
  sortOptions: Array<{
    value: string;
    label: string;
  }>;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  category?: string;
  vendor?: string;
  supplier?: string;
  images?: any[];
  slug?: string;
  tags?: string[];
}
