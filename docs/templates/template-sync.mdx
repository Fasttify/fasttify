# Sistema de Sincronización de Plantillas Liquid

Este sistema permite desarrollar y sincronizar en tiempo real plantillas Liquid con S3, facilitando el proceso de desarrollo de nuevas plantillas para tiendas.

## Características

- Observa cambios en archivos locales y los sincroniza automáticamente con S3
- Invalida automáticamente la caché para visualizar los cambios inmediatamente
- API para controlar la sincronización programáticamente
- Herramienta de línea de comandos para uso diario
- No requiere tokens de autorización adicionales (usa la autenticación existente de la aplicación)

## Requisitos

- Node.js 16 o superior
- Tener permisos de usuario suficientes en la aplicación
- Estar autenticado en la aplicación web

## Uso

### Desde línea de comandos

1. Inicia sesión en la aplicación web para estar autenticado
2. Verifica que tu sesión es válida:

```bash
npm run template-sync -- login
```

3. Inicia la sincronización desde un directorio local a una tienda:

```bash
npm run template-sync -- start <storeId> <rutaLocal>
```

4. Verifica el estado de la sincronización:

```bash
npm run template-sync -- status
```

5. Fuerza una sincronización completa de todos los archivos:

```bash
npm run template-sync -- sync
```

6. Detén la sincronización:

```bash
npm run template-sync -- stop
```

### Directamente desde API

También puedes controlar el sincronizador mediante solicitudes API:

```javascript
// Iniciar sincronización
await fetch('/api/stores/template-dev', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'start',
    storeId: 'mi-tienda',
    localDir: '/ruta/a/plantillas',
  }),
  credentials: 'include', // Importante: envía cookies de sesión
});

// Verificar estado
const status = await fetch('/api/stores/template-dev', {
  method: 'GET',
  credentials: 'include',
}).then((r) => r.json());

// Detener sincronización
await fetch('/api/stores/template-dev', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'stop' }),
  credentials: 'include',
});
```

## Estructura de directorios recomendada

Te recomendamos organizar las plantillas de la siguiente manera:

```
mi-tienda-template/
├── sections/
│   ├── header.liquid
│   ├── footer.liquid
│   └── ...
├── templates/
│   ├── index.liquid
│   ├── product.liquid
│   └── ...
├── snippets/
│   ├── cart-item.liquid
│   └── ...
├── assets/
│   ├── styles.css
│   ├── theme.js
│   └── ...
└── config/
    └── settings.json
```

## Flujo de trabajo recomendado

1. **Configura** tu entorno de desarrollo:
   - Clona las plantillas existentes o crea nuevas
   - Organiza tu estructura de directorios

2. **Inicia** la sincronización:

   ```
   npm run template-sync -- start mi-tienda ./mi-tienda-template
   ```

3. **Edita** tus archivos Liquid y observa los cambios en tiempo real

4. **Verifica** los cambios sincronizados:

   ```
   npm run template-sync -- status
   ```

5. **Detén** la sincronización cuando termines:
   ```
   npm run template-sync -- stop
   ```

## Notas importantes

- La sincronización es unidireccional: cambios locales van a S3, pero los cambios en S3 no se descargan automáticamente, esta en desarrollo la sincronización bidireccional.
- Debes estar autenticado en la aplicación web para usar el sistema
- Los cambios se reflejan instantáneamente si se invalida correctamente la caché
- El sistema utiliza las mismas credenciales que la aplicación principal para acceder a S3
