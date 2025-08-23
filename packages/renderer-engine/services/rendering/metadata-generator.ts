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

import type { OpenGraphData, RenderResult, SchemaData, TwitterCardData } from '@/renderer-engine/types/template';

export class MetadataGenerator {
  /**
   * Genera metadata SEO para la homepage
   */
  public generateMetadata(store: any, pageTitle?: string): RenderResult['metadata'] {
    // Si se proporciona un título de página específico, usarlo con el nombre de la tienda
    const title = pageTitle ? `${pageTitle} | ${store.storeName}` : `${store.storeName} - Tienda Online`;

    const description = store.storeDescription;
    const activeDomain =
      store.storeCustomDomain?.customDomain && store.storeCustomDomain.customDomainStatus === 'ACTIVE'
        ? store.storeCustomDomain.customDomain
        : store.defaultDomain;
    const url = `https://${activeDomain}`;
    const image = store.storeLogo || store.storeBanner;

    const openGraph: OpenGraphData = {
      title,
      description,
      url,
      type: 'website',
      image,
      site_name: store.storeName,
    };

    const schema: SchemaData = {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: store.storeName,
      description,
      url,
      logo: image,
      image,
      email: store.contactEmail,
      telephone: store.contactPhone,
      address: store.storeAdress
        ? {
            '@type': 'PostalAddress',
            addressLocality: store.storeAdress,
          }
        : undefined,
      currenciesAccepted: store.storeCurrency,
      paymentAccepted: ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'PayPal'],
    };

    const twitterCardData: TwitterCardData = {
      card: image ? 'summary_large_image' : 'summary',
      site: '@tu_nombre_de_usuario_twitter',
      title,
      description,
      image,
      image_alt: `${store.storeName} logo`,
    };

    return {
      title,
      description,
      canonical: url,
      openGraph,
      schema,
      icons: image,
      keywords: ['ecommerce', 'tienda online', store.storeName, 'compras online'],
      twitterCardData,
    };
  }

  /**
   * Genera el contenido para el <head> incluyendo favicon y meta tags
   */
  public generateHeadContent(store: any): string {
    const headContent = [];

    // Favicon con soporte para diferentes tipos
    if (store.storeFavicon) {
      const faviconUrl = store.storeFavicon;
      let mimeType = 'image/x-icon';

      // Detectar tipo de archivo por extensión
      if (faviconUrl.includes('.png')) {
        mimeType = 'image/png';
      } else if (faviconUrl.includes('.svg')) {
        mimeType = 'image/svg+xml';
      } else if (faviconUrl.includes('.jpg') || faviconUrl.includes('.jpeg')) {
        mimeType = 'image/jpeg';
      }

      // Generar una sola etiqueta de favicon con múltiples atributos
      headContent.push(
        `<link
          rel="icon"
          type="${mimeType}"
          href="${faviconUrl}"
          sizes="16x16 32x32 48x48 180x180"
        >`
      );
    }

    // Open Graph meta tags adicionales
    if (store.storeBanner) {
      headContent.push(`<meta property="og:image" content="${store.storeBanner}">`);
    }

    // Meta tags adicionales para SEO
    headContent.push(`<meta name="author" content="${store.storeName}">`);
    headContent.push(`<meta name="robots" content="index, follow">`);

    // Canonical URL
    const activeDomain =
      store.storeCustomDomain?.customDomain && store.storeCustomDomain.customDomainStatus === 'ACTIVE'
        ? store.storeCustomDomain.customDomain
        : store.defaultDomain;
    if (activeDomain) {
      headContent.push(`<link rel="canonical" href="https://${activeDomain}">`);
    }

    return headContent.join('\n    ');
  }
}

export const metadataGenerator = new MetadataGenerator();
