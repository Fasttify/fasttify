'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function StoreError({ error, reset }: ErrorProps) {
  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Error - Fasttify</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #333;
            }
            .error-container {
              background: white;
              border-radius: 20px;
              padding: 3rem;
              text-align: center;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              max-width: 500px;
              margin: 2rem;
            }
            .error-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            .error-title {
              font-size: 2rem;
              font-weight: 700;
              color: #2d3748;
              margin-bottom: 1rem;
            }
            .error-message {
              font-size: 1.1rem;
              color: #718096;
              margin-bottom: 2rem;
              line-height: 1.6;
            }
            .suggestions {
              background: #f7fafc;
              border-radius: 12px;
              padding: 1.5rem;
              margin: 2rem 0;
              text-align: left;
            }
            .suggestions h3 {
              margin: 0 0 1rem 0;
              color: #2d3748;
              font-size: 1.1rem;
            }
            .suggestions ul {
              margin: 0;
              padding-left: 1.2rem;
              color: #4a5568;
            }
            .suggestions li {
              margin-bottom: 0.5rem;
            }
            .action-buttons {
              margin: 2rem 0;
            }
            .action-button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 0.8rem 2rem;
              border-radius: 25px;
              text-decoration: none;
              font-weight: 600;
              transition: background 0.3s ease;
              margin: 0 0.5rem;
              border: none;
              cursor: pointer;
              font-size: 1rem;
            }
            .action-button:hover {
              background: #5a67d8;
            }
            .action-button.secondary {
              background: transparent;
              color: #667eea;
              border: 2px solid #667eea;
            }
            .action-button.secondary:hover {
              background: #667eea;
              color: white;
            }
            .error-details {
              margin-top: 2rem;
              padding: 1rem;
              background: #fed7d7;
              border-radius: 8px;
              border-left: 4px solid #e53e3e;
              text-align: left;
              font-family: monospace;
              font-size: 0.9rem;
              color: #742a2a;
              max-height: 200px;
              overflow-y: auto;
            }
          `,
          }}
        />
      </head>
      <body>
        <div className="error-container">
          <div className="error-icon">🚧</div>
          <h1 className="error-title">¡Oops! Algo salió mal</h1>
          <p className="error-message">
            Experimentamos un problema técnico temporal. Nuestro equipo ya está trabajando en
            solucionarlo.
          </p>

          <div className="suggestions">
            <h3>Puedes intentar:</h3>
            <ul>
              <li>Recargar la página</li>
              <li>Volver a la página anterior</li>
              <li>Contactar soporte si el problema persiste</li>
            </ul>
          </div>

          <div className="action-buttons">
            <button onClick={reset} className="action-button">
              Intentar de nuevo
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="action-button secondary"
            >
              Ir al inicio
            </button>
          </div>

          {process.env.APP_ENV === 'development' && (
            <div className="error-details">
              <strong>Detalles técnicos (solo en desarrollo):</strong>
              <br />
              {error.message}
              <br />
              {error.digest && `Digest: ${error.digest}`}
            </div>
          )}
        </div>
      </body>
    </html>
  )
}
