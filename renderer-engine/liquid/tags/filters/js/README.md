# Sistema de Filtros - Estructura Modular

Este directorio contiene el sistema de filtros dividido en módulos JavaScript separados para mejorar la mantenibilidad y legibilidad del código.

## Estructura de Archivos

### `filter-config.js`

- Configuración por defecto del sistema de filtros
- Estado inicial del filtro
- Función para crear configuración personalizada

### `dom-manager.js`

- Gestión de elementos del DOM
- Búsqueda de contenedores de productos
- Manejo de elementos de filtro

### `filter-state.js`

- Gestión del estado del filtro
- Actualización desde el DOM
- Verificación de filtros activos

### `filter-api.js`

- Llamadas a la API de filtros
- Construcción de parámetros de filtro
- Gestión de endpoints

### `product-renderer.js`

- Renderizado de productos
- Formateo de moneda
- Generación de HTML de productos

### `utils.js`

- Funciones utilitarias (debounce, URL handling)
- Manejo de eventos personalizados
- Utilidades de UI (loading, error, pagination)

### `url-loader.js`

- Carga de filtros desde la URL
- Parsing de parámetros de URL
- Restauración del estado desde URL

### `event-handler.js`

- Manejo de eventos del filtro
- Aplicación de filtros
- Limpieza de filtros

### `filter-main.js`

- Clase principal que orquesta todos los módulos
- Inicialización del sistema
- Punto de entrada principal

## Uso

El sistema se inicializa automáticamente importando el módulo principal:

```javascript
import { initFilterSystem } from '/renderer-engine/liquid/tags/filters/js/filter-main.js';

const config = {
  cssClass: 'product-filters',
  storeId: 'store-123',
  apiEndpoint: '/api/stores/store-123/products/filter',
  // ... otras opciones
};

initFilterSystem(config);
```

## Ventajas de la Estructura Modular

1. **Mantenibilidad**: Cada módulo tiene una responsabilidad específica
2. **Legibilidad**: Código más fácil de entender y modificar
3. **Reutilización**: Módulos pueden ser reutilizados en otros contextos
4. **Testing**: Cada módulo puede ser testeado independientemente
5. **Debugging**: Más fácil identificar y corregir problemas
6. **Escalabilidad**: Fácil agregar nuevas funcionalidades

## Compatibilidad

- Usa módulos ES6 (`import`/`export`)
- Requiere navegadores modernos que soporten módulos
- Compatible con el sistema de formateo de moneda global (`window.formatMoney`)
