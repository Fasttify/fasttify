/**
 * Cliente centralizado de AWS Amplify
 *
 * Este archivo centraliza la creación del cliente de Amplify para mejorar el rendimiento
 * de TypeScript y evitar la regeneración costosa de tipos en cada archivo.
 *
 * Problema resuelto:
 * - Los tipos de Amplify Gen2 son extremadamente pesados computacionalmente
 * - generateClient<FullSchema> crea un "universo de tipos" que TypeScript debe procesar
 * - Cada llamada a generateClient causa lentitud en el editor y compilación
 *
 * Solución:
 * - Un solo cliente centralizado con FullSchema
 * - Exportación de tipos comunes para reutilización
 * - Importación única del cliente en todos los archivos
 */

import { generateClient } from 'aws-amplify/data';
import type { FullSchema, StoreSchema } from '@/data-schema';

// Cliente principal con el schema completo (incluye funciones de IA)
export const client = generateClient<FullSchema>({
  authMode: 'userPool',
});

// Cliente optimizado solo para operaciones de store (sin funciones de IA)
export const storeClient = generateClient<StoreSchema>({
  authMode: 'userPool',
});

// Cliente para funciones de IA que requieren API key
export const aiClient = generateClient<FullSchema>({
  authMode: 'apiKey',
});

// Exportación de tipos comunes para evitar reimportaciones costosas
export type User = FullSchema['UserProfile']['type'];
export type UserStore = FullSchema['UserStore']['type'];
export type Product = FullSchema['Product']['type'];
export type Collection = FullSchema['Collection']['type'];
export type NavigationMenu = FullSchema['NavigationMenu']['type'];
export type Page = FullSchema['Page']['type'];
export type Cart = FullSchema['Cart']['type'];
export type CartItem = FullSchema['CartItem']['type'];
export type CheckoutSession = FullSchema['CheckoutSession']['type'];
export type Order = FullSchema['Order']['type'];
export type OrderItem = FullSchema['OrderItem']['type'];
export type StorePaymentConfig = FullSchema['StorePaymentConfig']['type'];
export type StoreCustomDomain = FullSchema['StoreCustomDomain']['type'];
export type UserTheme = FullSchema['UserTheme']['type'];
export type Notification = FullSchema['Notification']['type'];
export type NotificationReturn = FullSchema['NotificationReturn']['type'];
export type StoreAnalytics = FullSchema['StoreAnalytics']['type'];
export type UserSubscription = FullSchema['UserSubscription']['type'];

// Tipos de Store Schema (optimizados)
export type StoreUser = StoreSchema['UserProfile']['type'];
export type StoreUserStore = StoreSchema['UserStore']['type'];
export type StoreProduct = StoreSchema['Product']['type'];
export type StoreCollection = StoreSchema['Collection']['type'];
export type StoreNavigationMenu = StoreSchema['NavigationMenu']['type'];
export type StorePage = StoreSchema['Page']['type'];
export type StoreCart = StoreSchema['Cart']['type'];
export type StoreCartItem = StoreSchema['CartItem']['type'];
export type StoreCheckoutSession = StoreSchema['CheckoutSession']['type'];
export type StoreOrder = StoreSchema['Order']['type'];
export type StoreOrderItem = StoreSchema['OrderItem']['type'];
export type StorePaymentConfigType = StoreSchema['StorePaymentConfig']['type'];
export type StoreCustomDomainType = StoreSchema['StoreCustomDomain']['type'];
export type StoreUserTheme = StoreSchema['UserTheme']['type'];
export type StoreNotification = StoreSchema['Notification']['type'];
export type StoreNotificationReturn = StoreSchema['NotificationReturn']['type'];
export type StoreAnalyticsType = StoreSchema['StoreAnalytics']['type'];
export type StoreUserSubscription = StoreSchema['UserSubscription']['type'];

// Tipos de entrada para mutaciones comunes
export type CreateUserStoreInput = Omit<
  UserStore,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'products'
  | 'collections'
  | 'carts'
  | 'cartItems'
  | 'orders'
  | 'orderItems'
  | 'pages'
  | 'navigationMenus'
  | 'storePaymentConfig'
  | 'storeCustomDomain'
  | 'userThemes'
  | 'checkoutSessions'
  | 'notifications'
  | 'storeAnalytics'
>;

export type UpdateUserStoreInput = Omit<Partial<UserStore>, 'id' | 'createdAt' | 'updatedAt'> & {
  storeId: string;
};

export type CreateProductInput = Omit<
  Product,
  'id' | 'createdAt' | 'updatedAt' | 'cartItems' | 'orderItems' | 'userStore' | 'collection'
>;

export type UpdateProductInput = Omit<Partial<Product>, 'id' | 'createdAt' | 'updatedAt'> & {
  id: string;
};

// Tipos para configuración de pagos
export type PaymentGatewayType = 'mercadoPago' | 'wompi';

export interface PaymentGatewayConfig {
  publicKey: string;
  privateKey: string;
  isActive: boolean;
  createdAt: string;
}

// Tipos para resultados de operaciones
export interface StoreInitializationResult {
  success: boolean;
  message: string;
  collections?: string[];
  menus?: string[];
}

export interface MenuItem {
  label: string;
  url: string;
  type: 'internal' | 'external' | 'page' | 'collection' | 'product';
  isVisible: boolean;
  target?: '_blank' | '_self';
  sortOrder: number;
}

// Re-exportación de schemas para compatibilidad
export type { FullSchema, StoreSchema } from '@/data-schema';
