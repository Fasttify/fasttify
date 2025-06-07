import { NextRequest, NextResponse } from 'next/server'
import { storeRenderer } from '@/lib/store-renderer'

/**
 * API endpoint para renderizar páginas de tiendas
 *
 * GET /api/stores/render?domain=example.com&path=/products/mi-producto
 *
 * Query params:
 * - domain: Dominio de la tienda (requerido)
 * - path: Path de la página a renderizar (opcional, default: '/')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const domain = searchParams.get('domain')
    const path = searchParams.get('path') || '/'

    // Validar parámetros requeridos
    if (!domain) {
      return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 })
    }

    // Validar formato del dominio
    if (!isValidDomain(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
    }

    // Renderizar página usando el sistema de renderizado
    const result = await storeRenderer.renderPage(domain, path)

    // Configurar headers de respuesta
    const headers = new Headers({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': `public, max-age=${Math.floor(result.cacheTTL / 1000)}`,
      'X-Store-Cache-Key': result.cacheKey,
    })

    // Añadir headers SEO si existen
    if (result.metadata.canonical) {
      headers.set('Link', `<${result.metadata.canonical}>; rel="canonical"`)
    }

    // Crear respuesta HTML con metadata incluida
    const fullHtml = generateFullHTML(result.html, result.metadata)

    return new NextResponse(fullHtml, {
      status: 200,
      headers,
    })
  } catch (error: any) {
    console.error('Error rendering store page:', error)

    // Manejar errores tipados del sistema de renderizado
    if (error.type && error.statusCode) {
      return NextResponse.json(
        {
          error: error.message,
          type: error.type,
          details: process.env.APP_ENV === 'development' ? error.details : undefined,
        },
        { status: error.statusCode }
      )
    }

    // Error genérico
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: process.env.APP_ENV === 'development' ? error.message : 'Something went wrong',
      },
      { status: 500 }
    )
  }
}

/**
 * Valida si un dominio tiene formato correcto
 */
function isValidDomain(domain: string): boolean {
  const domainRegex =
    /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.([a-zA-Z]{2,}|[a-zA-Z]{2,}\.[a-zA-Z]{2,})$/
  return domainRegex.test(domain) || domain.includes('.fasttify.com')
}

/**
 * Genera HTML completo con metadata SEO
 */
function generateFullHTML(body: string, metadata: any): string {
  const { title, description, canonical, openGraph, schema } = metadata

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- SEO Meta Tags -->
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}">` : ''}
  
  <!-- Open Graph -->
  ${openGraph ? generateOpenGraphTags(openGraph) : ''}
  
  <!-- Schema.org JSON-LD -->
  ${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}
  
  <!-- Favicon -->
  <link rel="icon" href="/favicon.ico">
  
  <!-- Estilos básicos para tiendas -->
  <style>
    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    img { max-width: 100%; height: auto; }
    .price { font-weight: bold; color: #2563eb; }
    .btn { 
      display: inline-block; 
      padding: 12px 24px; 
      background: #2563eb; 
      color: white; 
      text-decoration: none; 
      border-radius: 6px;
      transition: background 0.2s;
    }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  ${body}
  
  <!-- Analytics y tracking scripts irían aquí -->
</body>
</html>`
}

/**
 * Genera tags de Open Graph
 */
function generateOpenGraphTags(og: any): string {
  return `
  <meta property="og:title" content="${escapeHtml(og.title)}">
  <meta property="og:description" content="${escapeHtml(og.description)}">
  <meta property="og:url" content="${escapeHtml(og.url)}">
  <meta property="og:type" content="${escapeHtml(og.type)}">
  ${og.image ? `<meta property="og:image" content="${escapeHtml(og.image)}">` : ''}
  ${og.site_name ? `<meta property="og:site_name" content="${escapeHtml(og.site_name)}">` : ''}
  
  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(og.title)}">
  <meta name="twitter:description" content="${escapeHtml(og.description)}">
  ${og.image ? `<meta name="twitter:image" content="${escapeHtml(og.image)}">` : ''}
  `.trim()
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text: string): string {
  if (!text) return ''

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
