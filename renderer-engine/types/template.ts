import type { AssetCollector } from '@/renderer-engine/services/rendering/asset-collector'

export interface TemplateFile {
  path: string
  content: string
  contentType: string
  lastModified?: Date
  preloaded_sections?: Record<string, string> // Secciones pre-cargadas
  _assetCollector?: AssetCollector
}

export interface TemplateCache {
  content: string
  compiledTemplate?: any // Plantilla compilada de LiquidJS
  lastUpdated: Date
  ttl: number
}

export interface RenderContext {
  storeId?: string // Para snippets que necesitan el storeId
  shop: ShopContext
  store: ShopContext // Alias para compatibilidad
  page: PageContext
  page_title: string
  page_description: string
  products: ProductContext[]
  collections: CollectionContext[]
  linklists?: Record<string, any> // Navegación compatible con Shopify
  content_for_layout?: string // Contenido principal de la página
  content_for_header?: string // Contenido adicional para el <head>
  product?: ProductContext // Para páginas de producto
  collection?: CollectionContext // Para páginas de colección
  cart?: any // Para datos del carrito (mantenemos any por compatibilidad con Liquid)
  pagination?: PaginationContext // Para páginas con paginación
  preloaded_sections?: Record<string, string> // Secciones pre-cargadas
  _assetCollector?: AssetCollector
}

export interface ShopContext {
  name: string
  description: string
  domain: string
  url: string
  currency: string
  money_format: string
  email?: string
  phone?: string
  address?: string
  logo?: string
  favicon?: string
  banner?: string
  theme: string
  storeId?: string // Para snippets que necesitan el storeId
  collections?: CollectionContext[] // Para compatibilidad con Shopify Liquid
}

export interface PageContext {
  title: string
  url: string
  template: string // 'index', 'product', 'collection'
  handle?: string // Slug/handle for SEO friendly URLs
  metafields?: {
    pagefly?: {
      html_meta?: string
    }
    [key: string]: any
  }
}

export interface ProductContext {
  // Propiedades principales
  id: string
  storeId: string
  name: string
  description: string | null
  handle?: string // SEO friendly URL slug

  // Precios
  price: string
  compareAtPrice?: string | null
  compare_at_price?: string | null
  costPerItem?: number | null

  // URLs y navegación
  url: string
  slug: string | null

  // Imágenes y media
  images: Array<{
    url: string
    alt?: string
  }>

  // Variantes y opciones
  variants: Array<{
    id: string
    title: string
    price: string
    available: boolean
    sku?: string
    [key: string]: any
  }>

  attributes: Array<{
    name: string
    value: any
    [key: string]: any
  }>

  // Categorización
  category?: string | null
  type?: string
  collectionId?: string | null

  // Inventario y estado
  quantity: number

  status: string

  // Identificación y metadatos
  sku?: string | null
  barcode?: string | null
  vendor?: string | null
  supplier?: string | null
  owner?: string | null

  // Timestamps
  createdAt: string
  updatedAt: string

  // Permitir propiedades dinámicas para diferentes templates
  [key: string]: any
}

export interface CollectionContext {
  id: string
  storeId: string
  title: string
  description?: string
  slug: string
  url: string
  image?: string
  products: ProductContext[]
  nextToken?: string | null
  owner: string
  sortOrder?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PaginationContext {
  current_page: number
  items_per_page: number
  previous?: {
    title: string
    url: string
  }
  next?: {
    title: string
    url: string
  }
  parts: Array<{
    title: string
    url: string
    is_link: boolean
  }>
}

export interface RenderResult {
  html: string
  metadata: {
    title: string
    description: string
    canonical?: string
    openGraph: OpenGraphData
    schema: SchemaData
    icons: string
    keywords?: string[]
  }
  cacheKey: string
  cacheTTL: number
}

export interface OpenGraphData {
  title: string
  description: string
  url: string
  type: 'website' | 'product' | 'article'
  image?: string
  site_name: string
}

export interface SchemaData {
  '@context': string
  '@type': string
  [key: string]: any
}

export interface TemplateError {
  type:
    | 'STORE_NOT_FOUND'
    | 'TEMPLATE_NOT_FOUND'
    | 'RENDER_ERROR'
    | 'DATA_ERROR'
    | 'STORE_NOT_ACTIVE'
  message: string
  details?: any
  statusCode: number
}

// ==================== TIPOS PARA TEMPLATES JSON ====================

export interface SectionSettings {
  [key: string]: any
}

export interface TemplateSection {
  type: string
  settings: SectionSettings
  blocks?: any[]
}

export interface TemplateConfig {
  sections: Record<string, TemplateSection>
  order: string[]
}

export interface TemplateData {
  layout: string
  sections: Record<string, TemplateSection>
  order: string[]
}

export type PageType =
  | 'index'
  | 'product'
  | 'collection'
  | 'page'
  | 'blog'
  | 'article'
  | 'search'
  | 'cart'
  | '404'

export interface PageRenderOptions {
  pageType: PageType
  handle?: string // Para productos, colecciones, páginas específicas, etc.
  productId?: string // ID específico del producto
  collectionId?: string // ID específico de la colección
  searchQuery?: string // Para páginas de búsqueda
}
