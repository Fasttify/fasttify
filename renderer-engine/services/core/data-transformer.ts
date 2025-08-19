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

export class DataTransformer {
  /**
   * Crea un handle SEO-friendly a partir de un texto
   */
  public static createHandle(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[áàäâã]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöôõ]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Formatea un precio para mostrar en pesos colombianos
   */
  public static formatPrice(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Transforma array de imágenes desde JSON string o array
   */
  public static transformImages(images: any, productName: string): any[] {
    let imagesArray = [];
    if (images) {
      if (typeof images === 'string') {
        try {
          imagesArray = JSON.parse(images);
        } catch (error) {
          console.warn('Error parsing product images JSON:', error);
          imagesArray = [];
        }
      } else if (Array.isArray(images)) {
        imagesArray = images;
      }
    }

    return Array.isArray(imagesArray)
      ? imagesArray.map((img: any) => ({
          url: img.url || img.src || '',
          alt: img.altText || img.alt || productName || '',
        }))
      : [];
  }

  /**
   * Transforma array de variantes desde JSON string o array
   */
  public static transformVariants(variants: any, basePrice: number): any[] {
    let variantsArray = [];
    if (variants) {
      if (typeof variants === 'string') {
        try {
          variantsArray = JSON.parse(variants);
        } catch (error) {
          console.warn('Error parsing product variants JSON:', error);
          variantsArray = [];
        }
      } else if (Array.isArray(variants)) {
        variantsArray = variants;
      }
    }

    return Array.isArray(variantsArray)
      ? variantsArray.map((variant: any) => ({
          id: variant.id,
          title: variant.title || variant.name || 'Default',
          price: variant.price || basePrice || 0,
          available: (variant.quantity || variant.stock || 0) > 0,
          sku: variant.sku,
        }))
      : [];
  }

  /**
   * Transforma array de atributos
   */
  public static transformAttributes(attributes: any): any[] {
    let attributesArray = [];
    if (attributes) {
      if (typeof attributes === 'string') {
        try {
          attributesArray = JSON.parse(attributes);
        } catch (error) {
          console.warn('Error parsing product attributes JSON:', error);
          attributesArray = [];
        }
      } else if (Array.isArray(attributes)) {
        attributesArray = attributes;
      }
    }

    return Array.isArray(attributesArray)
      ? attributesArray.map((attribute: any) => ({
          name: attribute.name,
          values: attribute.values,
        }))
      : [];
  }

  /**
   * Transforma tags desde JSON string o array y normaliza a string[]
   */
  public static transformTags(tags: any): string[] {
    let tagsArray: any[] = [];
    if (tags) {
      if (typeof tags === 'string') {
        try {
          tagsArray = JSON.parse(tags);
        } catch (error) {
          console.warn('Error parsing product tags JSON:', error);
          // intentar CSV como fallback
          tagsArray = tags
            .split(',')
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 0);
        }
      } else if (Array.isArray(tags)) {
        tagsArray = tags;
      }
    }

    if (!Array.isArray(tagsArray)) return [];

    const normalized = tagsArray.map((t) => (typeof t === 'string' ? t.trim() : '')).filter((t) => t.length > 0);

    // remover duplicados preservando orden
    return Array.from(new Set(normalized));
  }
}

export const dataTransformer = DataTransformer;
