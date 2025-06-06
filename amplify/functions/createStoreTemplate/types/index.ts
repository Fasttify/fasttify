export interface SectionSettings {
  [key: string]: any
}

export interface TemplateSection {
  type: string
  settings: SectionSettings
  blocks?: any[]
}

export interface TemplateData {
  layout: string
  sections: Record<string, TemplateSection>
  order: string[]
}

export interface DefaultCollection {
  title: string
  description: string
  slug: string
  isActive: boolean
  sortOrder: number
}

export interface InitializationResult {
  success: boolean
  message: string
  templateId?: string
  templateData?: TemplateData
  collections?: string[]
}

export interface ValidationResult {
  storeId: string
  domain: string
  userId: string
}

export interface ExistingTemplateCheck {
  canProceed: boolean
  result: InitializationResult
}

export interface CreateTemplateResult {
  storeId: string
}

// ==================== TIPOS DE CONFIGURACIÓN ====================

export type LayoutType = 'theme' | 'minimal' | 'modern'

export type SectionType =
  | 'header'
  | 'hero-banner'
  | 'featured-products'
  | 'collection-list'
  | 'footer'
  | 'testimonials'
  | 'newsletter'
  | 'blog'
  | 'video'
  | 'gallery'

export type HeaderCartType = 'drawer' | 'page'
export type ButtonStyle = 'primary' | 'secondary' | 'outline'
export type ButtonSize = 'small' | 'medium' | 'large'
export type TextAlignment = 'left' | 'center' | 'right'
export type ImageRatio = 'natural' | 'square' | 'portrait' | 'landscape'
export type HoverEffect = 'none' | 'zoom' | 'fade' | 'slide'
export type Spacing = 'small' | 'medium' | 'large'
export type OverlayStyle = 'none' | 'solid' | 'gradient'
export type FooterLayout = 'three-columns' | 'four-columns' | 'simple'

// ==================== INTERFACES ESPECÍFICAS DE SECCIONES ====================

export interface HeaderSettings extends SectionSettings {
  logo: string
  logo_width: number
  logo_height: number
  menu_title: string
  show_search: boolean
  show_cart: boolean
  show_wishlist: boolean
  show_account: boolean
  sticky_header: boolean
  background_color: string
  text_color: string
  border_bottom: boolean
  search_placeholder: string
  cart_type: HeaderCartType
  menu_items: Array<{
    title: string
    url: string
    active: boolean
  }>
}

export interface HeroSettings extends SectionSettings {
  heading: string
  heading_size: ButtonSize | 'extra-large'
  subheading: string
  subheading_size: ButtonSize
  button_text: string
  button_link: string
  button_style: ButtonStyle
  button_size: ButtonSize
  background_image: string
  background_position: string
  background_size: string
  text_color: string
  text_alignment: TextAlignment
  overlay_opacity: number
  overlay_color: string
  height: ButtonSize | 'full-screen'
  content_width: ButtonSize | 'full'
  enable_parallax: boolean
  show_scroll_indicator: boolean
}

export interface ProductsSettings extends SectionSettings {
  heading: string
  heading_alignment: TextAlignment
  description: string
  products_to_show: number
  columns_desktop: number
  columns_tablet: number
  columns_mobile: number
  show_price: boolean
  show_compare_price: boolean
  show_description: boolean
  show_vendor: boolean
  show_rating: boolean
  show_quick_view: boolean
  show_add_to_cart: boolean
  show_wishlist: boolean
  image_ratio: ImageRatio
  enable_slider: boolean
  autoplay: boolean
  autoplay_speed: number
  show_navigation: boolean
  show_pagination: boolean
  card_style: 'default' | 'minimal' | 'detailed'
  hover_effect: HoverEffect
  spacing: Spacing
}
