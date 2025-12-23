# Arquitectura del Convertidor de Temas Shopify → Fasttify

## Visión General

Convertidor automático con modo interactivo que transforma temas de Shopify (Dawn, Craft, etc.) a temas compatibles con Fasttify, preservando diseño y funcionalidades básicas adaptables.

## Arquitectura Modular

```
theme-converter/
├── core/                          # Núcleo del convertidor
│   ├── converter.ts              # Orquestador principal
│   ├── theme-scanner.ts          # Escaneo de estructura de tema
│   └── conversion-context.ts     # Contexto de conversión
│
├── parsers/                       # Parsers especializados
│   ├── liquid-parser.ts          # Parser de Liquid usando liquidjs AST
│   ├── json-parser.ts            # Parser de archivos JSON
│   └── asset-processor.ts        # Procesador de assets
│
├── converters/                    # Convertidores específicos
│   ├── variable-converter.ts     # Variables {{ object.property }}
│   ├── filter-converter.ts       # Filtros {{ value | filter }}
│   ├── tag-converter.ts          # Tags {% tag %}
│   ├── section-converter.ts      # Conversión de secciones
│   ├── schema-converter.ts       # Conversión de schemas
│   └── template-converter.ts     # Conversión de templates JSON
│
├── rules/                         # Sistema de reglas
│   ├── rule-engine.ts            # Motor de reglas
│   ├── mappings.ts               # Mapeos configurables
│   └── transformation-rules.ts   # Reglas de transformación
│
├── validators/                    # Validación
│   ├── syntax-validator.ts       # Validación de sintaxis Liquid
│   ├── structure-validator.ts    # Validación de estructura Fasttify
│   └── reference-validator.ts    # Validación de referencias
│
├── reports/                       # Sistema de reportes
│   ├── report-generator.ts       # Generador de reportes
│   ├── conversion-report.ts      # Reporte de conversión
│   └── issue-tracker.ts          # Seguimiento de problemas
│
├── interactive/                   # Modo interactivo
│   ├── decision-prompt.ts        # Prompts para decisiones
│   ├── conflict-resolver.ts      # Resolución de conflictos
│   └── interactive-mode.ts       # Modo interactivo
│
├── utils/                         # Utilidades
│   ├── file-utils.ts             # Utilidades de archivos
│   ├── path-utils.ts             # Utilidades de rutas
│   └── logger.ts                 # Logger
│
├── types/                         # Tipos TypeScript
│   ├── theme-types.ts            # Tipos de tema
│   ├── conversion-types.ts       # Tipos de conversión
│   └── report-types.ts           # Tipos de reportes
│
├── config/                        # Configuración
│   ├── default-mappings.json     # Mapeos por defecto
│   └── conversion-config.ts      # Configuración de conversión
│
└── cli/                           # CLI
    └── index.ts                   # Punto de entrada CLI
```

## Flujo de Conversión

```
1. Escaneo de Tema
   ├── Detectar estructura de directorios
   ├── Identificar tipos de archivos
   └── Crear mapa de archivos

2. Análisis
   ├── Parsear archivos Liquid (AST)
   ├── Analizar dependencias
   └── Detectar elementos a convertir

3. Conversión
   ├── Aplicar reglas de mapeo
   ├── Convertir variables, filtros, tags
   ├── Adaptar secciones y schemas
   └── Procesar assets

4. Validación
   ├── Validar sintaxis resultante
   ├── Verificar referencias
   └── Validar estructura Fasttify

5. Reporte
   ├── Generar reporte completo
   ├── Listar elementos convertidos
   ├── Identificar problemas
   └── Estadísticas de conversión

6. Modo Interactivo (si es necesario)
   ├── Detectar conflictos
   ├── Solicitar decisiones
   └── Aplicar decisiones
```

## Componentes Clave

### 1. Liquid Parser (liquidjs AST)

- Usar liquidjs para parsear Liquid a AST
- Analizar nodos: variables, filtros, tags, output
- Permitir transformación precisa del AST

### 2. Sistema de Reglas

- Reglas configurables en JSON
- Prioridad de reglas
- Reglas condicionales
- Mapeos de variables, filtros, tags

### 3. Convertidores Especializados

- Cada convertidor maneja un tipo específico
- Mantenibilidad y extensibilidad
- Fácil agregar nuevas conversiones

### 4. Modo Interactivo

- Detectar ambigüedades
- Solicitar decisiones al usuario
- Aplicar decisiones y continuar

### 5. Sistema de Reportes

- Reporte detallado en JSON/Markdown
- Categorización de problemas
- Estadísticas y métricas

## Tecnologías

- **TypeScript**: Lenguaje principal
- **liquidjs**: Parser de Liquid (ya en dependencias)
- **fs/path**: Manejo de archivos nativo
- **glob**: Búsqueda de archivos (ya en dependencias)
- **readline**: Modo interactivo CLI

## Principios de Diseño

1. **Modularidad**: Cada componente es independiente
2. **Extensibilidad**: Fácil agregar nuevas reglas/conversiones
3. **Configurabilidad**: Reglas en JSON externo
4. **Observabilidad**: Logs y reportes detallados
5. **Robustez**: Manejo de errores y casos edge
6. **Performance**: Procesamiento paralelo donde sea posible
