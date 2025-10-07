/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Store types
export type { DomainResolution, Store, StoreConfig, StoreTemplate, TemplateFiles } from './store';

// Product types
export type {
  Collection,
  CollectionProduct,
  LiquidCollection,
  LiquidProduct,
  LiquidProductImage,
  LiquidProductVariant,
  Product,
  ProductImage,
  ProductVariant,
} from './product';

// Page types
export type { Page } from './page';

// Template types
export type {
  CollectionContext,
  OpenGraphData,
  PageContext,
  PaginationContext,
  PaginationInfo,
  ProductAttribute,
  ProductContext,
  RenderContext,
  RenderResult,
  SchemaData,
  ShopContext,
  TemplateCache,
  TemplateData,
  TemplateError,
  TemplateFile,
  TwitterCardData,
} from './template';

// Liquid types
export type {
  CommentTag,
  CompiledTemplate,
  DateFilter,
  ImageFilter,
  JavaScriptTag,
  LiquidContext,
  LiquidEngineConfig,
  LiquidFilter,
  LiquidTag,
  MoneyFilter,
  PaginateTag,
  ProductFormTag,
  RenderTag,
  ScriptTag,
  SectionTag,
  SectionsTag,
  StyleTag,
  UrlFilter,
} from './liquid';

// Cart types
export type { AddToCartRequest, Cart, CartContext, CartItem, CartRaw, CartResponse, UpdateCartRequest } from './cart';

// Checkout types
export type {
  Address,
  CartSnapshot,
  CheckoutContext,
  CheckoutResponse,
  CheckoutSession,
  CheckoutStatus,
  CustomerInfo,
  StartCheckoutRequest,
  UpdateCustomerInfoRequest,
} from './checkout';

// Order types
export type { CreateOrderItemRequest, CreateOrderRequest, Order, OrderItem } from './order';
