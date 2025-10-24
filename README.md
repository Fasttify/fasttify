# [Fasttify](https://fasttify.com) &middot; [![GitHub license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/Fasttify/fasttify/blob/main/LICENSE) [![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black?logo=next.js&logoColor=white)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![AWS Amplify](https://img.shields.io/badge/AWS%20Amplify-Gen2-orange?logo=aws&logoColor=white)](https://aws.amazon.com/amplify/) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Fasttify/fasttify/blob/main/CONTRIBUTING.md)

Fasttify es una plataforma SaaS completa para crear y gestionar tiendas online con motor de plantillas Liquid 100% compatible con Shopify.

- **Multi-Tenant:** Arquitectura de Database Sharding con DynamoDB para escalabilidad infinita. Cada tienda obtiene su propia partición aislada para máximo rendimiento.
- **E-commerce Completo:** Sistema de carrito avanzado, checkout tokenizado, filtros automáticos con scroll infinito y búsqueda AJAX en tiempo real.
- **Dominios Personalizados:** Configuración automatizada con CloudFront Multi-Tenant, SSL automático y verificación DNS inteligente.
- **Motor Liquid:** 100% compatible con Shopify incluyendo tags, filtros y plantillas. Renderizado SSR/SSG optimizado con cache multinivel.

[Ver documentación completa](./docs/) | [Comenzar desarrollo](./docs/engine/theme-development-guide.mdx)

## Instalación

Fasttify está diseñado para adopción gradual y **puedes usar tanto o tan poco como necesites**:

- [Guía de inicio rápido](./docs/engine/theme-development-guide.mdx) para probar Fasttify.
- [Configuración de desarrollo](./docs/architecture/development-setup.mdx) para configurar tu entorno local.
- [Despliegue en producción](./docs/architecture/production-deployment.mdx) para configurar AWS Amplify Gen2.

### Prerrequisitos

- Node.js +20.18.3 con pnpm 10.18.0
- AWS CLI configurado
- Cuenta AWS con permisos para Amplify
- Git

### Configuración rápida

```bash
# Clonar el repositorio
git clone https://github.com/Fasttify/fasttify.git
cd fasttify

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Inicializar sandbox de desarrollo
npx ampx sandbox

# Ejecutar en desarrollo
pnpm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Documentación

Puedes encontrar la documentación de Fasttify [en el sitio web](./docs/).

Consulta la [Guía de inicio](./docs/engine/theme-development-guide.mdx) para una visión general rápida.

La documentación está dividida en varias secciones:

- [Guía de inicio](./docs/engine/theme-development-guide.mdx)
- [Arquitectura](./docs/architecture/) - Database sharding, S3 storage
- [Motor de Plantillas](./docs/engine/) - Liquid tags, filtros, carrito, checkout
- [Dominios Personalizados](./docs/domains/) - CloudFront Multi-Tenant
- [Desarrollo de Temas](./docs/templates/) - Guías y referencias
- [API Reference](./docs/api/) - Documentación de APIs
- [Soporte](./docs/troubleshooting/) - Resolución de problemas
- [Guía de Contribución](./CONTRIBUTING.md)

Puedes mejorarla enviando pull requests a [este repositorio](https://github.com/Fasttify/fasttify).

## Ejemplos

Tenemos varios ejemplos [en la documentación](./docs/). Aquí tienes el primero para comenzar:

```liquid
<!-- Filtros automáticos - Solo una línea -->
{% filters storeId: store.id %}

<!-- El sistema genera automáticamente:
     - Filtros de precio (slider)
     - Filtros de categorías (checkboxes)
     - Filtros de etiquetas (pills)
     - Ordenamiento (dropdown)
     - Grid de productos con AJAX
     - JavaScript completo incluido
-->
```

Este ejemplo renderizará un sistema completo de filtros de productos en tu tienda.

Notarás que usamos una sintaxis similar a HTML; [lo llamamos Liquid](https://shopify.github.io/liquid/). Liquid no es requerido para usar Fasttify, pero hace el código más legible y escribir se siente como escribir HTML.

## Características principales

### Sistema Multi-Tenant

- Arquitectura de Database Sharding con DynamoDB
- Dominios personalizados automatizados con CloudFront Multi-Tenant
- Motor Liquid 100% compatible con Shopify
- Gestión independiente de múltiples tiendas por usuario

### E-commerce Completo

- Sistema de carrito avanzado con side cart modular
- Checkout tokenizado con sesiones seguras
- Filtros de productos automáticos con scroll infinito
- Búsqueda AJAX en tiempo real con autocompletado

### Integraciones

- IA integrada con AWS Bedrock para descripciones de productos
- Pagos nativos con Wompi y Mercado Pago
- Gestión de suscripciones con Polar
- SSL automático y verificación DNS inteligente

## Scripts disponibles

| Comando                  | Descripción                                 |
| ------------------------ | ------------------------------------------- |
| `pnpm run dev`           | Servidor desarrollo con Turbopack           |
| `pnpm run build`         | Build optimizado para producción            |
| `pnpm run start`         | Servidor de producción                      |
| `pnpm run test`          | Tests unitarios con Jest                    |
| `pnpm run test:coverage` | Coverage completo de tests                  |
| `pnpm run lint`          | ESLint + Prettier                           |
| `pnpm run type-check`    | Verificación de tipos TypeScript            |
| `pnpm run template-sync` | Sincronización de plantillas en tiempo real |

## Contribuir

El propósito principal de este repositorio es continuar evolucionando Fasttify, haciéndolo más rápido y fácil de usar. El desarrollo de Fasttify ocurre abiertamente en GitHub, y estamos agradecidos con la comunidad por contribuir con correcciones de bugs y mejoras. Lee abajo para aprender cómo puedes participar en la mejora de Fasttify.

### [Código de Conducta](CODE_OF_CONDUCT.md)

Fasttify ha adoptado un Código de Conducta que esperamos que los participantes del proyecto sigan. Por favor lee [el texto completo](CODE_OF_CONDUCT.md) para que puedas entender qué acciones serán y no serán toleradas.

### [Guía de Contribución](CONTRIBUTING.md)

Lee nuestra [guía de contribución](CONTRIBUTING.md) para aprender sobre nuestro proceso de desarrollo, cómo proponer correcciones de bugs y mejoras, y cómo construir y probar tus cambios en Fasttify.

### [Buenas Primeras Issues](https://github.com/Fasttify/fasttify/labels/good%20first%20issue)

Para ayudarte a empezar y familiarizarte con nuestro proceso de contribución, tenemos una lista de [buenas primeras issues](https://github.com/Fasttify/fasttify/labels/good%20first%20issue) que contienen bugs con un alcance relativamente limitado. Este es un gran lugar para comenzar.

### Licencia

Fasttify está bajo [Licencia Apache 2.0](./LICENSE).
