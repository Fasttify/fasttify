export interface DefaultCollection {
  title: string;
  description: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

export interface InitializationResult {
  success: boolean;
  message: string;
  collections?: string[];
  menus?: string[];
  pages?: string[];
}

export interface ValidationResult {
  storeId: string;
  domain: string;
  userId: string;
}

export interface DefaultMenuItem {
  label: string;
  url: string;
  type: 'internal' | 'external' | 'page' | 'collection' | 'product';
  isVisible: boolean;
  target?: '_blank' | '_self';
  sortOrder: number;
}

export interface DefaultNavigationMenu {
  name: string;
  handle: string;
  isMain: boolean;
  items: DefaultMenuItem[];
}

export interface DefaultPage {
  title: string;
  content: string;
  slug: string;
  isVisible: boolean;
  status: string;
  pageType: string;
}
