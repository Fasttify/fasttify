# Theme Studio

Editor visual de temas para Fasttify siguiendo Clean Architecture.

## Estructura

Este paquete sigue los principios de Clean Architecture:

```
theme-studio/
├── domain/                  # Capa de Dominio (más interna)
│   ├── entities/           # Entidades de negocio puras
│   └── ports/              # Interfaces (puertos) - contratos
├── application/            # Capa de Aplicación
│   └── use-cases/          # Casos de uso - lógica de negocio
├── infrastructure/         # Capa de Infraestructura
│   ├── adapters/          # Implementaciones concretas
│   └── services/          # Servicios externos (API, storage)
├── presentation/           # Capa de Presentación (más externa)
│   ├── components/        # Componentes React
│   ├── hooks/             # React hooks
│   └── stores/            # Estado global (Zustand)
└── shared/                 # Código compartido entre capas
    └── types/             # Tipos TypeScript compartidos
```

## Flujo de Dependencias

Las dependencias fluyen **hacia adentro**:

- **presentation** → **application** → **domain**
- **infrastructure** → **application** → **domain**

**Regla de oro**: Ninguna capa interna conoce las capas externas.

## Responsabilidades por Capa

### Domain (Entidades y Puertos)

- Define **qué** se necesita hacer
- Interfaces y contratos (puertos)
- Entidades de negocio puras (sin lógica de framework)
- **Sin dependencias externas** (solo TypeScript puro)

### Application (Casos de Uso)

- Define **cómo** se hacen las cosas
- Orquesta la lógica de negocio
- Depende solo de **puertos** (interfaces) del dominio
- Independiente de implementaciones concretas

### Infrastructure (Adaptadores y Servicios)

- **Implementa** las interfaces del dominio
- Acceso a datos (API, S3, etc.)
- Servicios externos
- Depende de puertos, no de casos de uso directamente

### Presentation (Componentes y UI)

- Expone la funcionalidad al usuario
- Componentes React con Polaris
- Hooks personalizados
- Estado global (Zustand)
- Depende de casos de uso

## Tecnologías

- **UI**: Shopify Polaris
- **Drag & Drop**: @shopify/draggable
- **Estado**: Zustand
- **Requests**: TanStack Query
- **Framework**: React + Next.js
