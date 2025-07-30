import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { logger } from '@/renderer-engine/lib/logger';
import { dataTransformer } from '@/renderer-engine/services/core/data-transformer';
import { cookiesClient } from '@/utils/server/AmplifyServer';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route para filtrar productos de forma eficiente
 * GET /api/stores/[storeId]/products/filter
 *
 * Query Parameters:
 * - price_min: número mínimo de precio
 * - price_max: número máximo de precio
 * - category: categoría específica
 * - availability: 'in_stock' para solo productos disponibles
 * - featured: 'true' para productos destacados
 * - sort_by: criterio de ordenamiento (price, name, created, etc.)
 * - nextToken: token para paginación (opcional)
 * - limit: productos por página (default: 20)
 */

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

export async function GET(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    const corsHeaders = await getNextCorsHeaders(request);

    // Extraer parámetros de filtro
    const filters: FilterParams = {
      price_min: searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : undefined,
      price_max: searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : undefined,
      category: searchParams.get('category') || undefined,
      categories: searchParams.get('categories') || undefined,
      tags: searchParams.get('tags') || undefined,
      vendors: searchParams.get('vendors') || undefined,
      collections: searchParams.get('collections') || undefined,
      availability: searchParams.get('availability') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      sort_by: searchParams.get('sort_by') || 'createdAt',
      token: searchParams.get('token') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
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
    // Construir filtros de Amplify
    const amplifyFilters: any = {
      status: { eq: 'active' }, // Solo productos activos
    };

    // Filtro de categoría (individual o múltiple)
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

    // Filtro de productos destacados
    if (filters.featured !== undefined) {
      amplifyFilters.featured = { eq: filters.featured };
    }

    // Filtro de disponibilidad (productos en stock)
    if (filters.availability === 'in_stock') {
      amplifyFilters.quantity = { gt: 0 };
    }

    // Filtro de rango de precios
    if (filters.price_min !== undefined && filters.price_max !== undefined) {
      // Usar between para rangos de precio
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
        limit: filters.limit!,
        nextToken: filters.token,
        filter: amplifyFilters,
      }
    );

    if (!response.data) {
      return { products: [], nextToken: null, totalCount: 0 };
    }

    // Aplicar ordenamiento (Amplify no soporta ordenamiento avanzado, se hace en memoria pero solo en el subset filtrado)
    let products = response.data.map(transformProduct);
    products = applySorting(products, filters.sort_by || 'createdAt');

    // Calcular totalCount: si hay nextToken, significa que hay más productos
    // Si no hay nextToken y tenemos menos productos que el límite, es el total
    let totalCount = products.length;
    if (response.nextToken) {
      // Hay más productos, pero no sabemos el total exacto
      // Para evitar consultas adicionales costosas, usamos una estimación
      // basada en el patrón de paginación
      totalCount = (filters.limit || 20) * 2; // Estimación conservadora
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
    slug: product.slug,
    featured: product.featured,
    tags: product.tags,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    vendor: product.supplier,
    sales_count: product.salesCount || 0,
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
    // Consulta ligera para obtener solo los campos necesarios para filtros
    // Amplify no soporta projection, pero podemos usar un límite más bajo y cachear
    const response = await cookiesClient.models.Product.listProductByStoreId(
      { storeId },
      {
        limit: 100, // Muestra más pequeña pero representativa
        filter: {
          status: { eq: 'active' },
        },
      }
    );

    const products = response.data || [];

    // Extraer categorías únicas
    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

    // Extraer tags únicos (si tags es un array JSON)
    const allTags = products.reduce((tags: string[], product: any) => {
      if (product.tags && Array.isArray(product.tags)) {
        tags.push(...product.tags);
      }
      return tags;
    }, []);
    const tags = [...new Set(allTags)];

    // Extraer rango de precios
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
