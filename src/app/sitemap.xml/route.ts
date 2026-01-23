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

import { dataFetcher, domainResolver } from '@fasttify/liquid-forge';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Represents a URL entry in the sitemap XML
 */
interface SitemapUrl {
  /** The URL location */
  loc: string;
  /** Last modification date in ISO format */
  lastmod: string;
  /** Change frequency indicator */
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  /** Priority value between 0.0 and 1.0 */
  priority: number;
}

/**
 * Configuration constants for sitemap generation
 */
const SITEMAP_CONFIG = {
  CACHE_MAX_AGE: 3600, // 1 hour
  CACHE_S_MAXAGE: 3600, // 1 hour for CDN
  PRODUCTS_LIMIT: 250,
  COLLECTIONS_LIMIT: 250,
  PAGES_LIMIT: 5000,
  PRIORITIES: {
    HOMEPAGE: 1.0,
    PRODUCTS: 0.8,
    COLLECTIONS: 0.7,
    PAGES: 0.6,
  },
  CHANGE_FREQUENCIES: {
    HOMEPAGE: 'daily' as const,
    PRODUCTS: 'weekly' as const,
    COLLECTIONS: 'weekly' as const,
    PAGES: 'monthly' as const,
  },
} as const;

/**
 * Main domains that should not generate sitemaps
 */
const MAIN_DOMAINS = ['fasttify.com', 'www.fasttify.com', 'localhost'] as const;

/**
 * Content type configuration for recursive processing
 */
interface ContentTypeConfig {
  fetcher: () => Promise<any>;
  pathPrefix: string;
  slugField: string;
  priority: number;
  changefreq: string;
}

/**
 * Generates dynamic sitemap.xml for each store
 *
 * @param _request - The incoming request object (unused but required by Next.js)
 * @returns Promise<NextResponse> - XML sitemap response or error
 *
 * @example
 * GET /sitemap.xml
 * Returns sitemap for the current store domain
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const hostname = await extractHostnameFromHeaders();

    if (isMainDomain(hostname)) {
      return createNotFoundResponse();
    }

    const domain = resolveStoreDomain(hostname);
    const storeRecord = await resolveStoreRecord(domain);

    if (!storeRecord) {
      return createStoreNotFoundResponse();
    }

    const sitemapUrls = await generateSitemapUrls(storeRecord.storeId, hostname);
    const sitemapXml = generateSitemapXml(sitemapUrls);

    return createSitemapResponse(sitemapXml);
  } catch (_error) {
    return createInternalServerErrorResponse();
  }
}

/**
 * Extracts and cleans hostname from request headers
 *
 * @returns The cleaned hostname without port
 */
async function extractHostnameFromHeaders(): Promise<string> {
  const requestHeaders = await headers();
  const hostname = requestHeaders.get('host') || requestHeaders.get('x-forwarded-host') || '';
  return hostname.split(':')[0];
}

/**
 * Checks if the hostname is a main domain that shouldn't generate sitemaps
 *
 * @param hostname - The hostname to check
 * @returns True if it's a main domain
 */
function isMainDomain(hostname: string): boolean {
  return MAIN_DOMAINS.includes(hostname as any);
}

/**
 * Resolves the store domain based on hostname patterns
 *
 * @param hostname - The incoming hostname
 * @returns The resolved store domain for database lookup
 */
function resolveStoreDomain(hostname: string): string {
  if (hostname.endsWith('.fasttify.com')) {
    return convertSubdomainToStoreDomain(hostname, '.fasttify.com');
  }

  if (hostname.endsWith('.localhost')) {
    return convertSubdomainToStoreDomain(hostname, '.localhost');
  }

  return hostname; // Custom domain
}

/**
 * Converts a subdomain hostname to store domain format
 *
 * @param hostname - The full hostname
 * @param suffix - The suffix to remove
 * @returns The store domain in fasttify.com format
 */
function convertSubdomainToStoreDomain(hostname: string, suffix: string): string {
  const subdomain = hostname.replace(suffix, '');
  return `${subdomain}.fasttify.com`;
}

/**
 * Resolves store record from domain
 *
 * @param domain - The store domain
 * @returns Store record or null if not found
 */
async function resolveStoreRecord(domain: string) {
  return domainResolver.resolveStoreByDomain(domain);
}

/**
 * Generates all sitemap URLs for a store recursively
 *
 * @param storeId - The store identifier
 * @param hostname - The store hostname
 * @returns Array of sitemap URLs
 */
async function generateSitemapUrls(storeId: string, hostname: string): Promise<SitemapUrl[]> {
  const baseUrl = `https://${hostname}`;
  const urls: SitemapUrl[] = [];

  // Add homepage
  urls.push(createHomepageUrl(baseUrl));

  // Add content URLs recursively
  await addContentUrlsRecursively(storeId, baseUrl, urls);

  return urls;
}

/**
 * Recursively adds content URLs to the sitemap
 *
 * @param storeId - The store identifier
 * @param baseUrl - The base URL for the store
 * @param urls - Array to accumulate URLs
 */
async function addContentUrlsRecursively(storeId: string, baseUrl: string, urls: SitemapUrl[]): Promise<void> {
  const contentTypes: ContentTypeConfig[] = [
    {
      fetcher: () => dataFetcher.getStoreProducts(storeId, { limit: SITEMAP_CONFIG.PRODUCTS_LIMIT }),
      pathPrefix: '/products',
      slugField: 'slug',
      priority: SITEMAP_CONFIG.PRIORITIES.PRODUCTS,
      changefreq: SITEMAP_CONFIG.CHANGE_FREQUENCIES.PRODUCTS,
    },
    {
      fetcher: () => dataFetcher.getStoreCollections(storeId, { limit: SITEMAP_CONFIG.COLLECTIONS_LIMIT }),
      pathPrefix: '/collections',
      slugField: 'slug',
      priority: SITEMAP_CONFIG.PRIORITIES.COLLECTIONS,
      changefreq: SITEMAP_CONFIG.CHANGE_FREQUENCIES.COLLECTIONS,
    },
    {
      fetcher: () => dataFetcher.getStorePages(storeId, { limit: SITEMAP_CONFIG.PAGES_LIMIT }),
      pathPrefix: '/pages',
      slugField: 'handle',
      priority: SITEMAP_CONFIG.PRIORITIES.PAGES,
      changefreq: SITEMAP_CONFIG.CHANGE_FREQUENCIES.PAGES,
    },
  ];

  for (const contentType of contentTypes) {
    await addContentTypeUrls(contentType, baseUrl, urls);
  }
}

/**
 * Adds URLs for a specific content type
 *
 * @param contentType - Content type configuration
 * @param baseUrl - Base URL for the store
 * @param urls - Array to accumulate URLs
 */
async function addContentTypeUrls(contentType: ContentTypeConfig, baseUrl: string, urls: SitemapUrl[]): Promise<void> {
  try {
    const response = await contentType.fetcher();
    const items = response.products || response.collections || response.pages || [];
    const uniqueSlugs = new Set<string>();

    for (const item of items) {
      const slug = item[contentType.slugField];
      if (slug && !uniqueSlugs.has(slug)) {
        uniqueSlugs.add(slug);
        urls.push(
          createContentUrl(baseUrl, contentType.pathPrefix, slug, item, contentType.priority, contentType.changefreq)
        );
      }
    }
  } catch (_error) {
    // Silently continue if content can't be fetched
  }
}

/**
 * Creates a homepage URL entry
 *
 * @param baseUrl - The base URL
 * @returns Homepage sitemap URL
 */
function createHomepageUrl(baseUrl: string): SitemapUrl {
  return {
    loc: baseUrl,
    lastmod: new Date().toISOString(),
    changefreq: SITEMAP_CONFIG.CHANGE_FREQUENCIES.HOMEPAGE,
    priority: SITEMAP_CONFIG.PRIORITIES.HOMEPAGE,
  };
}

/**
 * Creates a content URL entry
 *
 * @param baseUrl - The base URL
 * @param pathPrefix - URL path prefix
 * @param slug - Content slug
 * @param item - Content item
 * @param priority - URL priority
 * @param changefreq - Change frequency
 * @returns Content sitemap URL
 */
function createContentUrl(
  baseUrl: string,
  pathPrefix: string,
  slug: string,
  item: any,
  priority: number,
  changefreq: string
): SitemapUrl {
  return {
    loc: `${baseUrl}${pathPrefix}/${slug}`,
    lastmod: item.updatedAt || new Date().toISOString(),
    changefreq: changefreq as any,
    priority,
  };
}

/**
 * Generates the XML structure for the sitemap
 *
 * @param urls - Array of sitemap URLs
 * @returns XML string representation of the sitemap
 */
function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map(
      (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Escapes XML special characters to prevent parsing errors
 *
 * @param unsafe - String that may contain XML special characters
 * @returns Escaped XML-safe string
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Creates a 404 Not Found response
 *
 * @returns NextResponse with 404 status
 */
function createNotFoundResponse(): NextResponse {
  return new NextResponse('Not Found', { status: 404 });
}

/**
 * Creates a store not found response
 *
 * @returns NextResponse with 404 status
 */
function createStoreNotFoundResponse(): NextResponse {
  return new NextResponse('Store not found', { status: 404 });
}

/**
 * Creates a successful sitemap XML response
 *
 * @param sitemapXml - The XML content
 * @returns NextResponse with XML content and proper headers
 */
function createSitemapResponse(sitemapXml: string): NextResponse {
  return new NextResponse(sitemapXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `public, max-age=${SITEMAP_CONFIG.CACHE_MAX_AGE}, s-maxage=${SITEMAP_CONFIG.CACHE_S_MAXAGE}`,
    },
  });
}

/**
 * Creates an internal server error response
 *
 * @returns NextResponse with 500 status
 */
function createInternalServerErrorResponse(): NextResponse {
  return new NextResponse('Internal Server Error', { status: 500 });
}
