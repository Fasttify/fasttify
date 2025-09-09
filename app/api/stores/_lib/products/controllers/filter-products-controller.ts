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

import { NextRequest, NextResponse } from 'next/server';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { logger } from '@/renderer-engine/lib/logger';
import { dataTransformer } from '@/renderer-engine/services/core/data-transformer';
import { cookiesClient } from '@/utils/server/AmplifyServer';

interface FilterParams {
  price_min?: number;
  price_max?: number;
  category?: string;
  categories?: string;
  tags?: string;
  vendors?: string;
  collections?: string;
  availability?: string;
  featured?: boolean;
  sort_by?: string;
  token?: string;
  limit?: number;
}

interface ProductsResponse {
  products: any[];
  nextToken?: string | null;
  totalCount?: number;
}

export async function filterProducts(request: NextRequest, storeId: string): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const corsHeaders = await getNextCorsHeaders(request);

    // Extraer parámetros de filtro
    const filters: FilterParams = {
      price_min: (() => {
        const value = searchParams.get('price_min');
        return value ? parseFloat(value) : undefined;
      })(),
      price_max: (() => {
        const value = searchParams.get('price_max');
        return value ? parseFloat(value) : undefined;
      })(),
      category: searchParams.get('category') || undefined,
      categories: searchParams.get('categories') || undefined,
      tags: searchParams.get('tags') || undefined,
      vendors: searchParams.get('vendors') || undefined,
      collections: searchParams.get('collections') || undefined,
      availability: searchParams.get('availability') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      sort_by: searchParams.get('sort_by') || 'createdAt',
      token: searchParams.get('token') || undefined,
      limit: (() => {
        const value = searchParams.get('limit');
        return value ? parseInt(value) : 20;
      })(),
    };

    // Filtrar productos directamente a nivel de base de datos
    const productsData = await getFilteredProducts(storeId, filters);

    // Preparar respuesta
    const response = {
      products: productsData.products,
      pagination: {
        limit: filters.limit,
        nextToken: productsData.nextToken,
        hasMore: !!productsData.nextToken,
        totalResults: productsData.totalCount || productsData.products.length,
      },
      totalCount: productsData.totalCount,
      filters_applied: getAppliedFiltersInfo(filters),
      available_filters: await getAvailableFilters(storeId),
    };

    return NextResponse.json(response, {
      headers: corsHeaders,
    });
  } catch (error) {
    logger.error('Error in products filter API', error, 'ProductsFilterAPI');
    return NextResponse.json({ error: 'Error filtering products' }, { status: 500 });
  }
}

/**
 * Obtiene productos filtrados directamente desde la base de datos
 * Utiliza las capacidades de filtrado de Amplify para mayor eficiencia
 */
async function getFilteredProducts(storeId: string, filters: FilterParams): Promise<ProductsResponse> {
  try {
    const amplifyFilters: any = {
      status: { eq: 'active' },
    };

    if (filters.category) {
      amplifyFilters.category = { eq: filters.category };
    } else if (filters.categories) {
      const categoryList = filters.categories.split(',').map((cat) => cat.trim());
      if (categoryList.length === 1) {
        amplifyFilters.category = { eq: categoryList[0] };
      } else {
        amplifyFilters.category = { in: categoryList };
      }
    }

    if (filters.featured !== undefined) {
      amplifyFilters.featured = { eq: filters.featured };
    }

    if (filters.availability === 'in_stock') {
      amplifyFilters.quantity = { gt: 0 };
    }

    // Filtro de rango de precios
    if (filters.price_min !== undefined && filters.price_max !== undefined) {
      amplifyFilters.price = {
        between: [filters.price_min, filters.price_max],
      };
    } else if (filters.price_min !== undefined) {
      amplifyFilters.price = { gte: filters.price_min };
    } else if (filters.price_max !== undefined) {
      amplifyFilters.price = { lte: filters.price_max };
    }

    const response = await cookiesClient.models.Product.listProductByStoreId(
      { storeId },
      {
        limit: filters.limit || 20,
        nextToken: filters.token,
        filter: amplifyFilters,
      }
    );

    if (!response.data) {
      return { products: [], nextToken: null, totalCount: 0 };
    }

    let products = response.data.map(transformProduct);
    products = applySorting(products, filters.sort_by || 'createdAt');

    let totalCount = products.length;
    if (response.nextToken) {
      totalCount = (filters.limit || 20) * 2;
    }

    return {
      products,
      nextToken: response.nextToken,
      totalCount,
    };
  } catch (error) {
    logger.error('Error in getFilteredProducts', error);
    throw error;
  }
}

/**
 * Transforma un producto de Amplify al formato esperado
 */
function transformProduct(product: any) {
  const images = dataTransformer.transformImages(product.images, product.name);
  const handle = dataTransformer.createHandle(product.name);
  const attributes = dataTransformer.transformAttributes(product.attributes);
  const tags = dataTransformer.transformTags(product.tags);

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    quantity: product.quantity,
    category: product.category,
    images: images,
    status: product.status,
    slug: handle,
    featured: product.featured,
    tags: tags,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    vendor: product.supplier,
    sales_count: product.salesCount || 0,
    url: `/products/${handle}`,
    attributes: attributes,
  };
}

/**
 * Aplica ordenamiento a los productos (solo al subset ya filtrado)
 */
function applySorting(products: any[], sortBy: string): any[] {
  const sortOrder = sortBy.includes('_desc') ? 'desc' : 'asc';
  const sortField = sortBy.replace('_desc', '');

  return products.sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'price':
        comparison = (a.price || 0) - (b.price || 0);
        break;
      case 'name':
      case 'title':
        comparison = (a.name || a.title || '').localeCompare(b.name || b.title || '');
        break;
      case 'created':
      case 'createdAt':
        comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        break;
      case 'updated':
      case 'updatedAt':
        comparison = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
        break;
      case 'vendor':
        comparison = (a.vendor || '').localeCompare(b.vendor || '');
        break;
      case 'best_selling':
        comparison = (a.sales_count || 0) - (b.sales_count || 0);
        break;
      case 'featured':
        comparison = (a.featured ? 1 : 0) - (b.featured ? 1 : 0);
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });
}

/**
 * Obtiene información sobre los filtros aplicados
 */
function getAppliedFiltersInfo(filters: FilterParams) {
  const applied = [];

  if (filters.price_min || filters.price_max) {
    applied.push({
      type: 'price',
      value: `$${filters.price_min || 0} - $${filters.price_max || '∞'}`,
    });
  }
  if (filters.category) applied.push({ type: 'category', value: filters.category });
  if (filters.categories) applied.push({ type: 'categories', value: filters.categories });
  if (filters.tags) applied.push({ type: 'tags', value: filters.tags });
  if (filters.vendors) applied.push({ type: 'vendors', value: filters.vendors });
  if (filters.collections) applied.push({ type: 'collections', value: filters.collections });
  if (filters.availability) applied.push({ type: 'availability', value: 'En stock' });
  if (filters.featured) applied.push({ type: 'featured', value: 'Destacados' });
  if (filters.sort_by && filters.sort_by !== 'createdAt') {
    applied.push({ type: 'sort', value: filters.sort_by });
  }

  return applied;
}

/**
 * Obtiene los filtros disponibles usando consultas eficientes
 * En lugar de cargar 1000 productos, usa consultas específicas
 */
async function getAvailableFilters(storeId: string) {
  try {
    const response = await cookiesClient.models.Product.listProductByStoreId(
      { storeId },
      {
        limit: 50,
        filter: {
          status: { eq: 'active' },
        },
      }
    );

    const products = response.data || [];

    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

    const allTags = products.reduce((tags: string[], product: any) => {
      if (product.tags && Array.isArray(product.tags)) {
        tags.push(...product.tags);
      }
      return tags;
    }, []);
    const tags = [...new Set(allTags)];

    const prices = products.map((p: any) => p.price || 0).filter((p: any) => p > 0);
    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 100000,
    };

    return {
      categories: categories.slice(0, 20),
      tags: tags.slice(0, 30),
      price_range: priceRange,
      sort_options: [
        { value: 'createdAt', label: 'Más recientes' },
        { value: 'createdAt_desc', label: 'Más antiguos' },
        { value: 'price', label: 'Precio: menor a mayor' },
        { value: 'price_desc', label: 'Precio: mayor a menor' },
        { value: 'name', label: 'Nombre A-Z' },
        { value: 'name_desc', label: 'Nombre Z-A' },
        { value: 'best_selling', label: 'Más vendidos' },
        { value: 'featured', label: 'Destacados' },
      ],
    };
  } catch (error) {
    logger.warn('Error getting available filters', error);
    return {
      categories: ['Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros'],
      tags: ['nuevo', 'oferta', 'popular', 'descuento'],
      price_range: { min: 0, max: 100000 },
      sort_options: [
        { value: 'createdAt', label: 'Más recientes' },
        { value: 'price', label: 'Precio: menor a mayor' },
        { value: 'name', label: 'Nombre A-Z' },
      ],
    };
  }
}
