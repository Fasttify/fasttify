export interface TemplateFile {
  path: string
  content: string
  contentType: string
  lastModified?: Date
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
  products: any[]
  collections: any[]
  content_for_layout?: string // Contenido principal de la página
  content_for_header?: string // Contenido adicional para el <head>
  product?: any // Para páginas de producto
  collection?: any // Para páginas de colección
  pagination?: any // Para páginas con paginación
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
  id: string
  title: string
  description: string
  handle: string // SEO friendly URL slug
  price: string
  compare_at_price?: string
  url: string
  images: Array<{
    id: string
    url: string
    alt?: string
    width?: number
    height?: number
  }>
  variants: Array<{
    id: string
    title: string
    price: string
    available: boolean
    sku?: string
  }>
  tags: string[]
  available: boolean
  vendor?: string
  type?: string
}

export interface CollectionContext {
  id: string
  title: string
  description: string
  handle: string
  url: string
  image?: {
    id: string
    url: string
    alt?: string
  }
  products: ProductContext[]
  products_count: number
}

export interface PaginationContext {
  current_page: number
  current_offset: number
  total_pages: number
  total_items: number
  items_per_page: number
  previous_page?: number
  next_page?: number
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
  type: 'STORE_NOT_FOUND' | 'TEMPLATE_NOT_FOUND' | 'RENDER_ERROR' | 'DATA_ERROR'
  message: string
  details?: any
  statusCode: number
}
