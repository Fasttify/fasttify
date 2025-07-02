export interface Product {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  barcode?: string;
  quantity: number;
  weight?: number;
  category?: string;
  tags?: string[];
  images?: ProductImage[];
  variants?: ProductVariant[];
  isActive: boolean;
  isDigital: boolean;
  requiresShipping: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  position: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  barcode?: string;
  quantity: number;
  weight?: number;
  options: Record<string, string>; // { "Color": "Red", "Size": "L" }
}

export interface Collection {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  isActive: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionProduct {
  collectionId: string;
  productId: string;
  position: number;
}

// Tipos para el contexto de Liquid
export interface LiquidProduct {
  id: string;
  title: string;
  description: string;
  price: string; // Formateado con moneda
  compare_at_price?: string;
  url: string; // URL del producto
  images: LiquidProductImage[];
  variants: LiquidProductVariant[];
  tags: string[];
  vendor?: string;
  type?: string;
  available: boolean;
}

export interface LiquidProductImage {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface LiquidProductVariant {
  id: string;
  title: string;
  price: string;
  available: boolean;
  sku?: string;
  weight?: number;
  option1?: string;
  option2?: string;
  option3?: string;
}

export interface LiquidCollection {
  id: string;
  title: string;
  description: string;
  url: string;
  image?: LiquidProductImage;
  products: LiquidProduct[];
}
