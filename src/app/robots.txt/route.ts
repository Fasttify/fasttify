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

import { domainResolver } from '@fasttify/liquid-forge';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Configuration constants for robots.txt generation
 */
const ROBOTS_CONFIG = {
  CACHE_MAX_AGE: 86400, // 24 hours
  CACHE_S_MAXAGE: 86400, // 24 hours for CDN
  CRAWL_DELAY: 1,
} as const;

/**
 * Main domains that should not generate robots.txt
 */
const MAIN_DOMAINS = ['fasttify.com', 'www.fasttify.com', 'localhost'] as const;

/**
 * Robots.txt directive configuration
 */
interface RobotsDirective {
  /** User agent pattern */
  userAgent: string;
  /** Array of disallowed paths */
  disallow: string[];
  /** Array of allowed paths */
  allow: string[];
  /** Crawl delay in seconds */
  crawlDelay?: number;
}

/**
 * Generates dynamic robots.txt for each store
 *
 * @param _request - The incoming request object (unused but required by Next.js)
 * @returns Promise<NextResponse> - Plain text robots.txt response or error
 *
 * @example
 * GET /robots.txt
 * Returns robots.txt for the current store domain
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

    const robotsContent = generateRobotsContent(hostname);
    return createRobotsResponse(robotsContent);
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
 * Checks if the hostname is a main domain that shouldn't generate robots.txt
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
 * Generates the complete robots.txt content
 *
 * @param hostname - The store hostname
 * @returns Formatted robots.txt content
 */
function generateRobotsContent(hostname: string): string {
  const baseUrl = `https://${hostname}`;
  const directives = createRobotsDirectives(baseUrl);

  return buildRobotsContent(directives, baseUrl);
}

/**
 * Creates robots.txt directives configuration
 *
 * @param baseUrl - The base URL for the store
 * @returns Array of robots directives
 */
function createRobotsDirectives(_baseUrl: string): RobotsDirective[] {
  return [
    {
      userAgent: '*',
      disallow: ['/admin/', '/api/', '/_next/', '/orders/', '/account/'],
      allow: ['/', '/products/', '/collections/', '/pages/', '/search'],
      crawlDelay: ROBOTS_CONFIG.CRAWL_DELAY,
    },
  ];
}

/**
 * Recursively builds robots.txt content from directives
 *
 * @param directives - Array of robots directives
 * @param baseUrl - The base URL for sitemap reference
 * @returns Formatted robots.txt content
 */
function buildRobotsContent(directives: RobotsDirective[], baseUrl: string): string {
  const contentParts: string[] = [];

  for (const directive of directives) {
    contentParts.push(...buildDirectiveContent(directive, baseUrl));
  }

  return contentParts.join('\n');
}

/**
 * Builds content for a single robots directive
 *
 * @param directive - The robots directive
 * @param baseUrl - The base URL for sitemap reference
 * @returns Array of content lines for this directive
 */
function buildDirectiveContent(directive: RobotsDirective, baseUrl: string): string[] {
  const lines: string[] = [];

  // User agent
  lines.push(`User-agent: ${directive.userAgent}`);

  // Allow directives
  for (const path of directive.allow) {
    lines.push(`Allow: ${path}`);
  }

  // Disallow directives
  for (const path of directive.disallow) {
    lines.push(`Disallow: ${path}`);
  }

  // Crawl delay
  if (directive.crawlDelay) {
    lines.push(`Crawl-delay: ${directive.crawlDelay}`);
  }

  // Add sitemap reference
  lines.push('');
  lines.push('# Sitemap');
  lines.push(`Sitemap: ${baseUrl}/sitemap.xml`);

  return lines;
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
 * Creates a successful robots.txt response
 *
 * @param robotsContent - The robots.txt content
 * @returns NextResponse with plain text content and proper headers
 */
function createRobotsResponse(robotsContent: string): NextResponse {
  return new NextResponse(robotsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': `public, max-age=${ROBOTS_CONFIG.CACHE_MAX_AGE}, s-maxage=${ROBOTS_CONFIG.CACHE_S_MAXAGE}`,
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
