import { liquidEngine } from '@/renderer-engine/liquid/engine'
import type { TemplateError, RenderResult, ShopContext } from '@/renderer-engine/types'

export interface ErrorRenderOptions {
  storeId?: string
  domain: string
  path?: string
  store?: ShopContext
}

export class ErrorRenderer {
  /**
   * Renderiza una página de error amigable usando templates Liquid
   */
  public async renderError(
    error: TemplateError,
    options: ErrorRenderOptions
  ): Promise<RenderResult> {
    try {
      // Crear contexto básico para el error
      const context = this.createErrorContext(error, options)

      // Seleccionar template según el tipo de error
      const template = this.getErrorTemplate(error.type)

      // Renderizar el error con Liquid
      const html = await liquidEngine.render(template, context, `error_${error.type}`)

      const storeName = this.extractStoreName(options.domain)
      const title = this.getErrorTitle(error.type, storeName)

      return {
        html,
        metadata: {
          icons: options.store?.favicon || '/favicon.ico',
          title,
          description: this.getErrorDescription(error.type),
          openGraph: {
            title,
            description: this.getErrorDescription(error.type),
            url: options.domain + (options.path || ''),
            type: 'website',
            site_name: storeName,
          },
          schema: {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: title,
            description: this.getErrorDescription(error.type),
          },
        },
        cacheKey: `error_${error.type}_${Date.now()}`,
        cacheTTL: 0, // No cachear errores
      }
    } catch (renderError) {
      // Si falla el renderizado de error, devolver HTML básico
      console.error('Error rendering error page:', renderError)
      return this.getFallbackErrorPage(error, options)
    }
  }

  /**
   * Crea el contexto para renderizar errores
   */
  private createErrorContext(error: TemplateError, options: ErrorRenderOptions) {
    const storeName = this.extractStoreName(options.domain)

    return {
      error: {
        type: error.type,
        message: error.message,
        status_code: error.statusCode,
        friendly_message: this.getFriendlyMessage(error.type),
        suggestions: this.getErrorSuggestions(error.type),
        show_details: process.env.NODE_ENV === 'development',
        details: error.details,
      },
      store: options.store || {
        name: storeName,
        domain: options.domain,
        url: `https://${options.domain}`,
      },
      page: {
        title: this.getErrorTitle(error.type, storeName),
        template: 'error',
        url: options.domain + (options.path || ''),
      },
      settings: {
        show_breadcrumbs: false,
        show_navigation: false,
      },
    }
  }

  /**
   * Obtiene el template HTML para cada tipo de error
   */
  private getErrorTemplate(errorType: TemplateError['type']): string {
    const templates = {
      STORE_NOT_FOUND: this.getStoreNotFoundTemplate(),
      TEMPLATE_NOT_FOUND: this.getTemplateNotFoundTemplate(),
      RENDER_ERROR: this.getRenderErrorTemplate(),
      DATA_ERROR: this.getDataErrorTemplate(),
      STORE_NOT_ACTIVE: this.getStoreNotActiveTemplate(),
    }

    return templates[errorType] || templates.RENDER_ERROR
  }

  /**
   * Template para tienda no encontrada
   */
  private getStoreNotFoundTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page.title }}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding: 20px 0;
      text-align: center;
      border-bottom: 1px solid #e5e7eb;
      background: white;
    }
    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #6b7280;
      font-size: 14px;
      text-decoration: none;
    }
    .header-content:hover {
      color: #4b5563;
    }
    .arrow {
      font-size: 12px;
    }
    .main-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    .error-container {
      text-align: center;
      max-width: 600px;
      width: 100%;
    }
    .error-title {
      font-size: 2.5rem;
      font-weight: 400;
      color: #1f2937;
      margin-bottom: 3rem;
    }
    .button-group {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 4rem;
      flex-wrap: wrap;
    }
    .btn {
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      cursor: pointer;
      display: inline-block;
    }
    .btn-primary {
      background-color: #1f2937;
      color: white;
      border-color: #1f2937;
    }
    .btn-primary:hover {
      background-color: #111827;
      border-color: #111827;
    }
    .btn-secondary {
      background-color: white;
      color: #1f2937;
      border-color: #d1d5db;
    }
    .btn-secondary:hover {
      background-color: #f9fafb;
      border-color: #9ca3af;
    }
    .info-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 3rem;
      margin-bottom: 4rem;
    }
    .info-section {
      text-align: left;
    }
    .info-section h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }
    .info-section p {
      color: #6b7280;
      margin-bottom: 1rem;
      font-size: 14px;
      line-height: 1.6;
    }
    .info-section a {
      color: #1f2937;
      text-decoration: underline;
      font-weight: 500;
      font-size: 14px;
    }
    .info-section a:hover {
      color: #111827;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
    }
    .footer a {
      color: #6b7280;
      text-decoration: none;
    }
    .footer a:hover {
      color: #4b5563;
    }
    .error-details {
      margin-top: 2rem;
      padding: 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      text-align: left;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 12px;
      color: #991b1b;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    @media (max-width: 768px) {
      .error-title {
        font-size: 2rem;
      }
      .button-group {
        flex-direction: column;
        align-items: center;
      }
      .btn {
        width: 200px;
      }
      .info-sections {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <a href="https://fasttify.com" class="header-content">
      <span class="arrow">←</span>
      <span>FASTTIFY</span>
    </a>
  </div>
  
  <div class="main-content">
    <div class="error-container">
      <h1 class="error-title">Esta tienda no existe.</h1>
      
      <div class="button-group">
        <a href="https://fasttify.com/stores" class="btn btn-primary">Explorar otras tiendas</a>
        <a href="https://fasttify.com/login" class="btn btn-secondary">Crear tu tienda gratis</a>
      </div>
      
      <div class="info-sections">
        <div class="info-section">
          <h3>Crear tu tienda online</h3>
          <p>Comienza con una prueba gratuita de 3 días, luego continúa desde $29/mes los próximos 3 meses.</p>
          <a href="https://fasttify.com/login">Regístrate ahora</a>
        </div>
        
        <div class="info-section">
          <h3>Vender en persona</h3>
          <p>Obtén las características que necesitas para administrar tu negocio ya sea que estés empezando o creciendo.</p>
          <a href="https://fasttify.com/pos">Prueba gratuita</a>
        </div>
        
        <div class="info-section">
          <h3>Explorar Fasttify</h3>
          <p>Con 100+ actualizaciones de productos, puedes ser más productivo, creativo y poderoso en el comercio.</p>
          <a href="https://fasttify.com/features">Explorar características</a>
        </div>
      </div>
      
      {% if error.show_details %}
      <div class="error-details">
        <strong>Detalles técnicos:</strong><br>
        Tipo: {{ error.type }}<br>
        Mensaje: {{ error.message }}<br>
        Código: {{ error.status_code }}
      </div>
      {% endif %}
    </div>
  </div>
  
  <div class="footer">
    <span>powered by </span><a href="https://fasttify.com"><strong>fasttify</strong></a>
  </div>
</body>
</html>
    `
  }

  /**
   * Template para plantillas no encontradas
   */
  private getTemplateNotFoundTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page.title }}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding: 20px 0;
      text-align: center;
      border-bottom: 1px solid #e5e7eb;
      background: white;
    }
    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #6b7280;
      font-size: 14px;
      text-decoration: none;
    }
    .header-content:hover {
      color: #4b5563;
    }
    .arrow {
      font-size: 12px;
    }
    .main-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    .error-container {
      text-align: center;
      max-width: 600px;
      width: 100%;
    }
    .error-title {
      font-size: 2.5rem;
      font-weight: 400;
      color: #1f2937;
      margin-bottom: 1rem;
    }
    .error-subtitle {
      font-size: 1.1rem;
      color: #6b7280;
      margin-bottom: 3rem;
    }
    .button-group {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 4rem;
      flex-wrap: wrap;
    }
    .btn {
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      cursor: pointer;
      display: inline-block;
    }
    .btn-primary {
      background-color: #1f2937;
      color: white;
      border-color: #1f2937;
    }
    .btn-primary:hover {
      background-color: #111827;
      border-color: #111827;
    }
    .btn-secondary {
      background-color: white;
      color: #1f2937;
      border-color: #d1d5db;
    }
    .btn-secondary:hover {
      background-color: #f9fafb;
      border-color: #9ca3af;
    }
    .info-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 3rem;
      margin-bottom: 4rem;
    }
    .info-section {
      text-align: left;
    }
    .info-section h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }
    .info-section p {
      color: #6b7280;
      margin-bottom: 1rem;
      font-size: 14px;
      line-height: 1.6;
    }
    .info-section a {
      color: #1f2937;
      text-decoration: underline;
      font-weight: 500;
      font-size: 14px;
    }
    .info-section a:hover {
      color: #111827;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
    }
    .footer a {
      color: #6b7280;
      text-decoration: none;
    }
    .footer a:hover {
      color: #4b5563;
    }
    .error-details {
      margin-top: 2rem;
      padding: 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      text-align: left;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 12px;
      color: #991b1b;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    @media (max-width: 768px) {
      .error-title {
        font-size: 2rem;
      }
      .button-group {
        flex-direction: column;
        align-items: center;
      }
      .btn {
        width: 200px;
      }
      .info-sections {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <a href="https://fasttify.com" class="header-content">
      <span class="arrow">←</span>
      <span>FASTTIFY</span>
    </a>
  </div>
  
  <div class="main-content">
    <div class="error-container">
      <h1 class="error-title">Esta tienda está siendo configurada.</h1>
      <p class="error-subtitle">Estará disponible pronto. Mientras tanto, puedes explorar otras opciones.</p>
      
      <div class="button-group">
        <a href="https://fasttify.com/stores" class="btn btn-primary">Explorar otras tiendas</a>
        <a href="https://fasttify.com/login" class="btn btn-secondary">Crear tu tienda gratis</a>
      </div>
      
      <div class="info-sections">
        <div class="info-section">
          <h3>¿Eres el propietario?</h3>
          <p>Completa la configuración de tu tienda para que esté disponible para tus clientes.</p>
          <a href="https://fasttify.com/admin">Ir al panel de administración</a>
        </div>
        
        <div class="info-section">
          <h3>Crear tu tienda online</h3>
          <p>Comienza con una prueba gratuita de 3 días, luego continúa desde $29/mes los próximos 3 meses.</p>
          <a href="https://fasttify.com/login">Regístrate ahora</a>
        </div>
        
        <div class="info-section">
          <h3>Obtener ayuda</h3>
          <p>Nuestro equipo de soporte está disponible 24/7 para ayudarte con cualquier pregunta o problema.</p>
          <a href="https://fasttify.com/support">Contactar soporte</a>
        </div>
      </div>
      
      {% if error.show_details %}
      <div class="error-details">
        <strong>Detalles técnicos:</strong><br>
        Tipo: {{ error.type }}<br>
        Mensaje: {{ error.message }}<br>
        Código: {{ error.status_code }}
      </div>
      {% endif %}
    </div>
  </div>
  
  <div class="footer">
    <span>powered by </span><a href="https://fasttify.com"><strong>fasttify</strong></a>
  </div>
</body>
</html>
    `
  }

  /**
   * Template para errores de renderizado
   */
  private getRenderErrorTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page.title }}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding: 20px 0;
      text-align: center;
      border-bottom: 1px solid #e5e7eb;
      background: white;
    }
    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #6b7280;
      font-size: 14px;
      text-decoration: none;
    }
    .header-content:hover {
      color: #4b5563;
    }
    .arrow {
      font-size: 12px;
    }
    .main-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    .error-container {
      text-align: center;
      max-width: 600px;
      width: 100%;
    }
    .error-title {
      font-size: 2.5rem;
      font-weight: 400;
      color: #1f2937;
      margin-bottom: 1rem;
    }
    .error-subtitle {
      font-size: 1.1rem;
      color: #6b7280;
      margin-bottom: 3rem;
    }
    .button-group {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 4rem;
      flex-wrap: wrap;
    }
    .btn {
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      cursor: pointer;
      display: inline-block;
    }
    .btn-primary {
      background-color: #1f2937;
      color: white;
      border-color: #1f2937;
    }
    .btn-primary:hover {
      background-color: #111827;
      border-color: #111827;
    }
    .btn-secondary {
      background-color: white;
      color: #1f2937;
      border-color: #d1d5db;
    }
    .btn-secondary:hover {
      background-color: #f9fafb;
      border-color: #9ca3af;
    }
    .info-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 3rem;
      margin-bottom: 4rem;
    }
    .info-section {
      text-align: left;
    }
    .info-section h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }
    .info-section p {
      color: #6b7280;
      margin-bottom: 1rem;
      font-size: 14px;
      line-height: 1.6;
    }
    .info-section a {
      color: #1f2937;
      text-decoration: underline;
      font-weight: 500;
      font-size: 14px;
    }
    .info-section a:hover {
      color: #111827;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
    }
    .footer a {
      color: #6b7280;
      text-decoration: none;
    }
    .footer a:hover {
      color: #4b5563;
    }
    .error-details {
      margin-top: 2rem;
      padding: 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      text-align: left;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 12px;
      color: #991b1b;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    @media (max-width: 768px) {
      .error-title {
        font-size: 2rem;
      }
      .button-group {
        flex-direction: column;
        align-items: center;
      }
      .btn {
        width: 200px;
      }
      .info-sections {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <a href="https://fasttify.com" class="header-content">
      <span class="arrow">←</span>
      <span>FASTTIFY</span>
    </a>
  </div>
  
  <div class="main-content">
    <div class="error-container">
      <h1 class="error-title">Algo salió mal temporalmente.</h1>
      <p class="error-subtitle">Estamos trabajando para solucionarlo. Puedes intentar de nuevo en unos momentos.</p>
      
      <div class="button-group">
        <a href="javascript:location.reload()" class="btn btn-primary">Recargar página</a>
        <a href="/" class="btn btn-secondary">Ir al inicio</a>
      </div>
      
      <div class="info-sections">
        <div class="info-section">
          <h3>Intentar de nuevo</h3>
          <p>A veces estos errores se resuelven automáticamente. Recarga la página para intentar de nuevo.</p>
          <a href="javascript:location.reload()">Recargar ahora</a>
        </div>
        
        <div class="info-section">
          <h3>Contactar soporte</h3>
          <p>Si el problema persiste, nuestro equipo de soporte puede ayudarte a resolverlo rápidamente.</p>
          <a href="https://fasttify.com/support">Obtener ayuda</a>
        </div>
        
        <div class="info-section">
          <h3>Estado del servicio</h3>
          <p>Verifica si hay mantenimientos programados o problemas conocidos en nuestro servicio.</p>
          <a href="https://status.fasttify.com">Ver estado</a>
        </div>
      </div>
      
      {% if error.show_details %}
      <div class="error-details">
        <strong>Detalles técnicos:</strong><br>
        Tipo: {{ error.type }}<br>
        Mensaje: {{ error.message }}<br>
        Código: {{ error.status_code }}
      </div>
      {% endif %}
    </div>
  </div>
  
  <div class="footer">
    <span>powered by </span><a href="https://fasttify.com"><strong>fasttify</strong></a>
  </div>
</body>
</html>
    `
  }

  /**
   * Template para errores de datos
   */
  private getDataErrorTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page.title }}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding: 20px 0;
      text-align: center;
      border-bottom: 1px solid #e5e7eb;
      background: white;
    }
    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #6b7280;
      font-size: 14px;
      text-decoration: none;
    }
    .header-content:hover {
      color: #4b5563;
    }
    .arrow {
      font-size: 12px;
    }
    .main-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    .error-container {
      text-align: center;
      max-width: 600px;
      width: 100%;
    }
    .error-title {
      font-size: 2.5rem;
      font-weight: 400;
      color: #1f2937;
      margin-bottom: 1rem;
    }
    .error-subtitle {
      font-size: 1.1rem;
      color: #6b7280;
      margin-bottom: 3rem;
    }
    .button-group {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 4rem;
      flex-wrap: wrap;
    }
    .btn {
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      cursor: pointer;
      display: inline-block;
    }
    .btn-primary {
      background-color: #1f2937;
      color: white;
      border-color: #1f2937;
    }
    .btn-primary:hover {
      background-color: #111827;
      border-color: #111827;
    }
    .btn-secondary {
      background-color: white;
      color: #1f2937;
      border-color: #d1d5db;
    }
    .btn-secondary:hover {
      background-color: #f9fafb;
      border-color: #9ca3af;
    }
    .info-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 3rem;
      margin-bottom: 4rem;
    }
    .info-section {
      text-align: left;
    }
    .info-section h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }
    .info-section p {
      color: #6b7280;
      margin-bottom: 1rem;
      font-size: 14px;
      line-height: 1.6;
    }
    .info-section a {
      color: #1f2937;
      text-decoration: underline;
      font-weight: 500;
      font-size: 14px;
    }
    .info-section a:hover {
      color: #111827;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
    }
    .footer a {
      color: #6b7280;
      text-decoration: none;
    }
    .footer a:hover {
      color: #4b5563;
    }
    .error-details {
      margin-top: 2rem;
      padding: 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      text-align: left;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 12px;
      color: #991b1b;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    @media (max-width: 768px) {
      .error-title {
        font-size: 2rem;
      }
      .button-group {
        flex-direction: column;
        align-items: center;
      }
      .btn {
        width: 200px;
      }
      .info-sections {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <a href="https://fasttify.com" class="header-content">
      <span class="arrow">←</span>
      <span>FASTTIFY</span>
    </a>
  </div>
  
  <div class="main-content">
    <div class="error-container">
      <h1 class="error-title">Error de conexión.</h1>
      <p class="error-subtitle">No pudimos cargar los datos necesarios. Revisa tu conexión e inténtalo de nuevo.</p>
      
      <div class="button-group">
        <a href="javascript:location.reload()" class="btn btn-primary">Reintentar</a>
        <a href="/" class="btn btn-secondary">Ir al inicio</a>
      </div>
      
      <div class="info-sections">
        <div class="info-section">
          <h3>Verificar conexión</h3>
          <p>Asegúrate de que tu dispositivo esté conectado a internet y que la conexión sea estable.</p>
          <a href="javascript:location.reload()">Reintentar ahora</a>
        </div>
        
        <div class="info-section">
          <h3>Estado del servicio</h3>
          <p>Verifica si hay mantenimientos programados o interrupciones conocidas en nuestros servicios.</p>
          <a href="https://status.fasttify.com">Ver estado del servicio</a>
        </div>
        
        <div class="info-section">
          <h3>Contactar soporte</h3>
          <p>Si el problema persiste, nuestro equipo técnico puede ayudarte a resolverlo.</p>
          <a href="https://fasttify.com/support">Obtener ayuda</a>
        </div>
      </div>
      
      {% if error.show_details %}
      <div class="error-details">
        <strong>Detalles técnicos:</strong><br>
        Tipo: {{ error.type }}<br>
        Mensaje: {{ error.message }}<br>
        Código: {{ error.status_code }}
      </div>
      {% endif %}
    </div>
  </div>
  
  <div class="footer">
    <span>powered by </span><a href="https://fasttify.com"><strong>fasttify</strong></a>
  </div>
</body>
</html>
    `
  }

  private getStoreNotActiveTemplate(): string {
    return `
         <!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page.title }}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding: 20px 0;
      text-align: center;
      border-bottom: 1px solid #e5e7eb;
      background: white;
    }
    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #6b7280;
      font-size: 14px;
      text-decoration: none;
    }
    .header-content:hover {
      color: #4b5563;
    }
    .arrow {
      font-size: 12px;
    }
    .main-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    .error-container {
      text-align: center;
      max-width: 600px;
      width: 100%;
    }
    .error-title {
      font-size: 2.5rem;
      font-weight: 400;
      color: #1f2937;
      margin-bottom: 1rem;
    }
    .error-subtitle {
      font-size: 1.1rem;
      color: #6b7280;
      margin-bottom: 3rem;
    }
    .button-group {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 4rem;
      flex-wrap: wrap;
    }
    .btn {
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      cursor: pointer;
      display: inline-block;
    }
    .btn-primary {
      background-color: #1f2937;
      color: white;
      border-color: #1f2937;
    }
    .btn-primary:hover {
      background-color: #111827;
      border-color: #111827;
    }
    .btn-secondary {
      background-color: white;
      color: #1f2937;
      border-color: #d1d5db;
    }
    .btn-secondary:hover {
      background-color: #f9fafb;
      border-color: #9ca3af;
    }
    .info-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 3rem;
      margin-bottom: 4rem;
    }
    .info-section {
      text-align: left;
    }
    .info-section h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }
    .info-section p {
      color: #6b7280;
      margin-bottom: 1rem;
      font-size: 14px;
      line-height: 1.6;
    }
    .info-section a {
      color: #1f2937;
      text-decoration: underline;
      font-weight: 500;
      font-size: 14px;
    }
    .info-section a:hover {
      color: #111827;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
    }
    .footer a {
      color: #6b7280;
      text-decoration: none;
    }
    .footer a:hover {
      color: #4b5563;
    }
    .error-details {
      margin-top: 2rem;
      padding: 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      text-align: left;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 12px;
      color: #991b1b;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    @media (max-width: 768px) {
      .error-title {
        font-size: 2rem;
      }
      .button-group {
        flex-direction: column;
        align-items: center;
      }
      .btn {
        width: 200px;
      }
      .info-sections {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <a href="https://fasttify.com" class="header-content">
      <span class="arrow">←</span>
      <span>FASTTIFY</span>
    </a>
  </div>
  
  <div class="main-content">
    <div class="error-container">
        <h1 class="error-title">La tienda que buscas no está activa o no está pagada.</h1>
      <p class="error-subtitle">Por favor, contacta al propietario de la tienda para resolver el problema.</p>
      
      <div class="button-group">
        <a href="javascript:location.reload()" class="btn btn-primary">Reintentar</a>
        <a href="/" class="btn btn-secondary">Ir al inicio</a>
      </div>
      
      <div class="info-sections">
        <div class="info-section">
          <h3>Verificar pago</h3>
          <p>Asegúrate de que la tienda esté pagada y activa.</p>
          <a href="https://fasttify.com/dashboard">Verificar pago</a>
        </div>
        
        <div class="info-section">
          <h3>Contactar soporte</h3>
          <p>Si el problema persiste, nuestro equipo técnico puede ayudarte a resolverlo.</p>
          <a href="https://fasttify.com/support">Obtener ayuda</a>
        </div>
        
        <div class="info-section">
          <h3>Explorar otras tiendas</h3>
          <p>Explora otras tiendas en Fasttify.</p>
          <a href="https://fasttify.com">Explorar otras tiendas</a>
        </div>
      </div>
      
      {% if error.show_details %}
      <div class="error-details">
        <strong>Detalles técnicos:</strong><br>
        Tipo: {{ error.type }}<br>
        Mensaje: {{ error.message }}<br>
        Código: {{ error.status_code }}
      </div>
      {% endif %}
    </div>
  </div>
  
  <div class="footer">
    <span>powered by </span><a href="https://fasttify.com"><strong>fasttify</strong></a>
  </div>
</body>
</html> 
    `
  }

  /**
   * Obtiene mensajes amigables para cada tipo de error
   */
  private getFriendlyMessage(errorType: TemplateError['type']): string {
    const messages = {
      STORE_NOT_FOUND: 'Lo sentimos, la tienda que buscas no existe o ha sido desactivada.',
      TEMPLATE_NOT_FOUND: 'Esta tienda está siendo configurada y estará disponible pronto.',
      RENDER_ERROR:
        'Experimentamos un problema técnico temporal. Nuestro equipo ya está trabajando en solucionarlo.',
      DATA_ERROR:
        'Hubo un problema al cargar los datos de la tienda. Inténtalo de nuevo en unos momentos.',
      STORE_NOT_ACTIVE: 'La tienda que buscas no está activa o no está pagada.',
    }

    return messages[errorType] || 'Se produjo un error inesperado.'
  }

  /**
   * Obtiene sugerencias para cada tipo de error
   */
  private getErrorSuggestions(errorType: TemplateError['type']): string[] {
    const suggestions = {
      STORE_NOT_FOUND: [
        'Verificar que la URL de la tienda esté escrita correctamente',
        'Contactar al propietario de la tienda si crees que debería existir',
        'Explorar otras tiendas en Fasttify',
      ],
      TEMPLATE_NOT_FOUND: [
        'La tienda está en proceso de configuración',
        'Vuelve a intentar en unos minutos',
        'Contacta al propietario si el problema persiste',
      ],
      RENDER_ERROR: [
        'Recargar la página',
        'Intentar navegar a otra sección',
        'Contactar soporte si el problema persiste',
      ],
      DATA_ERROR: [
        'Verificar tu conexión a internet',
        'Intentar de nuevo en unos momentos',
        'Contactar soporte si el error continúa',
      ],
      STORE_NOT_ACTIVE: [
        'Verificar que la tienda esté activa y pagada',
        'Contactar al propietario de la tienda si crees que debería estar activa',
        'Explorar otras tiendas en Fasttify',
      ],
    }

    return suggestions[errorType] || ['Intentar de nuevo más tarde']
  }

  /**
   * Obtiene títulos para cada tipo de error
   */
  private getErrorTitle(errorType: TemplateError['type'], storeName?: string): string {
    const storeNamePart = storeName ? ` | ${storeName}` : ''

    const titles = {
      STORE_NOT_FOUND: `Tienda No Encontrada${storeNamePart} - Fasttify`,
      TEMPLATE_NOT_FOUND: `${storeName || 'Tienda'} en Construcción - Fasttify`,
      RENDER_ERROR: `${storeName || 'Tienda'} - Error Temporal - Fasttify`,
      DATA_ERROR: `${storeName || 'Tienda'} - Error de Conexión - Fasttify`,
      STORE_NOT_ACTIVE: `${storeName || 'Tienda'} No Activa - Fasttify`,
    }

    return titles[errorType] || `${storeName || 'Tienda'} - Error - Fasttify`
  }

  /**
   * Obtiene descripciones para cada tipo de error
   */
  private getErrorDescription(errorType: TemplateError['type']): string {
    const descriptions = {
      STORE_NOT_FOUND: 'La tienda que buscas no existe o no está disponible en este momento.',
      TEMPLATE_NOT_FOUND: 'Esta tienda está siendo configurada y estará disponible pronto.',
      RENDER_ERROR:
        'Se produjo un error técnico temporal. Nuestro equipo está trabajando para solucionarlo.',
      DATA_ERROR: 'Hubo un problema al cargar los datos. Inténtalo de nuevo en unos momentos.',
      STORE_NOT_ACTIVE: 'La tienda que buscas no está activa o no está pagada.',
    }

    return descriptions[errorType] || 'Se produjo un error inesperado.'
  }

  /**
   * Extrae el nombre de la tienda del dominio de forma más amigable
   */
  private extractStoreName(domain: string): string {
    // Si es un dominio personalizado (tienda.com, etc), usar el nombre del dominio
    if (domain.includes('.') && !domain.endsWith('.fasttify.com')) {
      // Para dominios personalizados, usar todo el dominio sin el TLD
      const withoutTLD = domain.split('.').slice(0, -1).join('.')
      return withoutTLD.charAt(0).toUpperCase() + withoutTLD.slice(1)
    }

    // Para subdominios de fasttify.com, usar solo la primera parte
    const parts = domain.split('.')
    const storeName = parts[0] || domain
    return storeName.charAt(0).toUpperCase() + storeName.slice(1)
  }

  /**
   * Página de error de respaldo si falla el renderizado de error
   */
  private getFallbackErrorPage(error: TemplateError, options: ErrorRenderOptions): RenderResult {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - Fasttify</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 2rem;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 400px;
      margin: 0 auto;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚧 Error Temporal</h1>
    <p>Se produjo un error inesperado. Por favor, inténtalo de nuevo más tarde.</p>
    <a href="/" style="color: #007bff;">Volver al inicio</a>
  </div>
</body>
</html>
    `

    return {
      html,
      metadata: {
        icons: '/favicon.ico',
        title: 'Error - Fasttify',
        description: 'Se produjo un error inesperado',
        openGraph: {
          title: 'Error - Fasttify',
          description: 'Se produjo un error inesperado',
          url: options.domain,
          type: 'website',
          site_name: 'Fasttify',
        },
        schema: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Error',
        },
      },
      cacheKey: `fallback_error_${Date.now()}`,
      cacheTTL: 0,
    }
  }
}

// Exportar instancia singleton
export const errorRenderer = new ErrorRenderer()
