/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { dataTransformer } from '../../core/data-transformer';
import type { ProductAttribute, ProductContext } from '../../../types';
import type { ProductData } from './types/product-types';

export class ProductTransformer {
  /**
   * Transforma un producto al formato Liquid
   */
  public transformProduct(product: ProductData, collectionHandle?: string): ProductContext {
    const handle = product.slug || dataTransformer.createHandle(product.name);
    const price = product.price || 0;
    const compareAtPrice = product.compareAtPrice || undefined;
    const transformedImages = dataTransformer.transformImages(product.images, product.name);
    const variants = dataTransformer.transformVariants(product.variants, product.price);
    const attributes: ProductAttribute[] = dataTransformer.transformAttributes(product.attributes);
    const tags: string[] = dataTransformer.transformTags(product.tags);
    const featured_image = transformedImages.length > 0 ? transformedImages[0].url : undefined;
    const images = transformedImages.map((img) => img.url || img);
    const cleanCollectionHandle = collectionHandle ? dataTransformer.createHandle(collectionHandle) : undefined;
    const url = cleanCollectionHandle
      ? `/collections/${cleanCollectionHandle}/products/${handle}`
      : `/products/${handle}`;

    return {
      id: product.id,
      storeId: product.storeId,
      name: product.name,
      title: product.name,
      slug: handle,
      attributes: attributes,
      featured_image: featured_image,
      quantity: product.quantity,
      description: product.description,
      price: price,
      compare_at_price: compareAtPrice,
      url: url,
      images: images,
      variants: variants,
      status: product.status,
      category: product.category,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      tags,
    };
  }

  /**
   * Transforma múltiples productos
   */
  public transformProducts(products: ProductData[], collectionHandle?: string): ProductContext[] {
    return products.map((product) => this.transformProduct(product, collectionHandle));
  }
}

export const productTransformer = new ProductTransformer();
