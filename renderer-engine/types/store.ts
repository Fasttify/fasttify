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
  storeStatus: string
  storePolicy?: string
  storeAdress?: string
  contactEmail?: string
  contactPhone?: number
  contactName?: string
  customDomain: string
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
