# @fasttify/liquid-forge

Motor de renderizado Liquid para la plataforma Fasttify.

## 🚀 Características

- **Motor Liquid**: Renderizado de templates Liquid con soporte completo
- **Gestión de Assets**: Inyección automática de CSS y JavaScript
- **Cache Inteligente**: Sistema de cache con TTL configurable
- **Análisis de Templates**: Detección automática de dependencias de datos
- **Soporte Multi-idioma**: Renderizado con contexto de idioma
- **Optimización**: Minificación y optimización automática de assets

## 📦 Instalación

```bash
# Desde la raíz del proyecto
npm install

# O instalar dependencias específicas del paquete
cd liquid-forge
npm install
```

## 🔧 Uso

### Importación Básica

```typescript
import { LiquidEngine } from '@fasttify/liquid-forge/liquid/engine';
import { StoreRendererFactory } from '@fasttify/liquid-forge/factories/store-renderer-factory';

// Crear instancia del motor
const engine = LiquidEngine.getInstance();

// Renderizar template
const html = await engine.render(templateContent, context);
```

### Renderizado de Páginas

```typescript
import { StoreRendererFactory } from '@fasttify/liquid-forge/factories/store-renderer-factory';

const renderer = new StoreRendererFactory();
const result = await renderer.renderPage(domain, path, searchParams);
```

## 🏗️ Estructura del Paquete

```
liquid-forge/
├── liquid/                    # Motor Liquid principal
│   ├── engine.ts            # Clase principal del motor
│   ├── filters/             # Filtros personalizados
│   └── tags/                # Tags personalizados
├── renderers/                # Renderizadores específicos
├── services/                 # Servicios de datos
├── factories/                # Factories para crear instancias
└── types/                    # Tipos TypeScript
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 🔨 Desarrollo

```bash
# Compilar TypeScript
npm run build

# Modo desarrollo (watch)
npm run dev

# Verificar tipos
npm run type-check

# Limpiar build
npm run clean
```

## 📚 Dependencias Principales

- **liquidjs**: Motor de templates Liquid
- **@aws-sdk/client-s3**: Cliente S3 para assets
- **chokidar**: File watching para desarrollo
- **jszip**: Manejo de archivos ZIP
- **uuid**: Generación de IDs únicos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia Apache 2.0 - ver el archivo [LICENSE](../LICENSE) para más detalles.
