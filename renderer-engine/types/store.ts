export interface Store {
  storeId: string
  userId: string
  storeName: string
  storeDescription?: string
  storeLogo?: string
  storeFavicon?: string
  storeBanner?: string
  storeTheme?: string
  storeCurrency: string
  storeType: string
  storeStatus: boolean
  storePolicy?: string
  storeAdress?: string
  contactEmail?: string
  contactPhone?: number
  contactName?: string
  customDomain?: string
  customDomainStatus?: 'pending' | 'active' | 'failed' | 'inactive'
  cloudflareHostnameId?: string
  customDomainVerifiedAt?: string
  onboardingCompleted: boolean
  wompiConfig?: string // JSON string
  mercadoPagoConfig?: string // JSON string
}

export interface StoreTemplate {
  storeId: string
  domain: string
  templateKey: string
  templateData: string // JSON string con las URLs de archivos
  isActive: boolean
  lastUpdated?: string
  owner: string
}

export interface NavigationMenuItem {
  label: string
  url?: string
  type: 'internal' | 'external' | 'page' | 'collection' | 'product'
  isVisible: boolean
  target?: '_blank' | '_self'
  sortOrder: number
  pageHandle?: string
  collectionHandle?: string
  productHandle?: string
}

export interface NavigationMenu {
  id: string
  storeId: string
  domain: string
  name: string
  handle: string
  isMain: boolean
  isActive: boolean
  menuData: NavigationMenuItem[]
  owner: string
  createdAt?: string
  updatedAt?: string
}

export interface ProcessedNavigationMenu {
  id: string
  storeId: string
  domain: string
  name: string
  handle: string
  isMain: boolean
  isActive: boolean
  items: ProcessedNavigationMenuItem[]
  owner: string
}

export interface ProcessedNavigationMenuItem {
  title: string
  url: string
  active: boolean
  type: string
  target?: string
}

export interface StoreConfig {
  name: string
  description: string
  domain: string
  currency: string
  theme: string
  logo?: string
  banner?: string
  email?: string
  phone?: string
  address?: string
}

export interface TemplateFiles {
  files: Array<{ key: string; path: string; size: number }>
  metadata: {
    storeName: string
    domain: string
    createdAt: string
    customizations: Record<string, any>
  }
}

export interface DomainResolution {
  storeId: string
  storeName: string
  customDomain: string
  isActive: boolean
}
