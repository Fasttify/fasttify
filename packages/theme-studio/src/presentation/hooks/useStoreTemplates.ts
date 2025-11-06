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

import { useQuery } from '@tanstack/react-query';
import type { TemplateType } from '../../domain/entities/template.entity';
import {
  HomeIcon,
  PackageIcon,
  PageIcon,
  SearchIcon,
  CartIcon,
  CreditCardIcon,
  AlertCircleIcon,
  BlogIcon,
} from '@shopify/polaris-icons';
import type { ComponentType } from 'react';

export interface StorePage {
  id: string;
  name: string;
  url: string;
  type: TemplateType;
  icon: ComponentType<any>;
}

interface UseStoreTemplatesParams {
  storeId: string | undefined;
  apiBaseUrl: string;
}

interface UseStoreTemplatesResult {
  pages: StorePage[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Mapeo de tipos de templates a nombres amigables, rutas e iconos de Polaris
 */
const TEMPLATE_MAP: Record<TemplateType, { name: string; url: string; icon: ComponentType<any> }> = {
  index: { name: 'Página principal', url: '/', icon: HomeIcon },
  product: { name: 'Páginas de producto', url: '/products', icon: PackageIcon },
  collection: { name: 'Páginas de colección', url: '/collections', icon: PackageIcon },
  page: { name: 'Páginas', url: '/pages', icon: PageIcon },
  blog: { name: 'Blogs', url: '/blogs', icon: BlogIcon },
  article: { name: 'Artículos de blog', url: '/blogs', icon: BlogIcon },
  search: { name: 'Buscador', url: '/search', icon: SearchIcon },
  cart: { name: 'Carrito', url: '/cart', icon: CartIcon },
  checkout: { name: 'Checkout', url: '/checkouts/start', icon: CreditCardIcon },
  checkout_start: { name: 'Checkout', url: '/checkouts/start', icon: CreditCardIcon },
  checkout_confirmation: { name: 'Confirmación de checkout', url: '/checkouts/confirmation', icon: CreditCardIcon },
  policies: { name: 'Políticas', url: '/policies', icon: BlogIcon },
  '404': { name: 'Página 404', url: '/404', icon: AlertCircleIcon },
};

/**
 * Hook para obtener los templates disponibles del tema desde S3
 */
export function useStoreTemplates({ storeId, apiBaseUrl }: UseStoreTemplatesParams): UseStoreTemplatesResult {
  const {
    data: templates,
    isLoading,
    error,
  } = useQuery<TemplateType[]>({
    queryKey: ['store-templates', storeId],
    queryFn: async () => {
      if (!storeId) throw new Error('Store ID is required');

      const response = await fetch(`${apiBaseUrl}/stores/${storeId}/themes/templates`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to list templates: ${response.statusText}`);
      }

      const data = await response.json();
      return data.templates || [];
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const pages = (templates || []).map((templateType) => {
    const templateInfo = TEMPLATE_MAP[templateType];
    return {
      id: templateType,
      name: templateInfo?.name || templateType,
      url: templateInfo?.url || `/${templateType}`,
      type: templateType,
      icon: templateInfo?.icon || PageIcon,
    };
  });

  return {
    pages,
    isLoading,
    error: error instanceof Error ? error : null,
  };
}
