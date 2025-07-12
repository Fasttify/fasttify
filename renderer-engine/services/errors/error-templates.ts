// Plantillas HTML para errores del sistema de renderizado
// Cada función retorna el HTML correspondiente para el error

export function getStoreNotFoundTemplate(): string {
  return `<!DOCTYPE html>
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
</html>`;
}

export function getTemplateNotFoundTemplate(): string {
  return `<!DOCTYPE html>
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
</html>`;
}

export function getRenderErrorTemplate(): string {
  return `<!DOCTYPE html>
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
</html>`;
}

export function getDataErrorTemplate(): string {
  return `<!DOCTYPE html>
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
</html>`;
}

export function getStoreNotActiveTemplate(): string {
  return `<!DOCTYPE html>
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
</html> `;
}

export function getFallbackErrorPageTemplate(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - Fasttify</title>
  <style>body { font-family: Arial, sans-serif; text-align: center; padding: 2rem; background: #f5f5f5; } .container { background: white; padding: 2rem; border-radius: 8px; max-width: 400px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }</style>
</head>
<body>
  <div class="container">
    <h1>🚧 Error Temporal</h1>
    <p>Se produjo un error inesperado. Por favor, inténtalo de nuevo más tarde.</p>
    <a href="/" style="color: #007bff;">Volver al inicio</a>
  </div>
</body>
</html>`;
}
