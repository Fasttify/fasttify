# Gestión de Plantillas para Tiendas

Este documento describe el sistema de gestión de plantillas para las tiendas en Fasttify.

## Arquitectura

El sistema de plantillas sigue un enfoque de "copiar desde una base" para optimizar el rendimiento y reducir la carga en el servidor:

1. **Plantilla Base**: Todos los archivos de plantilla base se almacenan en S3 en la ruta `base-templates/default/`.
2. **Plantillas de Tienda**: Cuando se crea una tienda, el sistema copia la plantilla base a la carpeta específica de la tienda en `templates/{storeId}/`.

Este enfoque tiene varias ventajas:

- Reduce el tiempo de creación de tiendas
- Minimiza el tráfico de red entre el servidor y S3
- Permite actualizaciones centralizadas de la plantilla base

## Flujo de Trabajo

### 1. Inicialización de la Plantilla Base

Para subir la plantilla base a S3, ejecuta el script:

```bash
node scripts/upload-base-template.js
```

Este script:

- Lee todos los archivos de la carpeta `template/` local
- Sube cada archivo a S3 en la ruta `base-templates/default/`
- Preserva la estructura de directorios y los tipos de contenido

### 2. Creación de Tienda

Cuando un usuario crea una tienda:

1. El sistema llama al endpoint `/api/stores/template`
2. El endpoint:
   - Lista todos los objetos de la plantilla base en S3
   - Copia cada objeto a la carpeta específica de la tienda
   - Actualiza los metadatos con información específica de la tienda
   - Devuelve las URLs de los archivos copiados

### 3. Personalización de Plantillas

La personalización de las plantillas se realiza a través de:

1. **Metadatos**: Cada archivo de plantilla tiene metadatos con información específica de la tienda
2. **Motor de Renderizado**: El motor de renderizado Liquid procesa las plantillas y reemplaza las variables con los valores específicos de la tienda

## Estructura de Archivos en S3

```
S3
├── base-templates/
│   └── default/
│       ├── assets/
│       ├── config/
│       ├── layout/
│       ├── sections/
│       ├── snippets/
│       └── templates/
└── templates/
    ├── {storeId1}/
    │   ├── assets/
    │   ├── config/
    │   ├── layout/
    │   ├── sections/
    │   ├── snippets/
    │   └── templates/
    └── {storeId2}/
        └── ...
```

## Actualización de la Plantilla Base

Para actualizar la plantilla base:

1. Modifica los archivos en la carpeta `template/` local
2. Ejecuta el script de subida nuevamente:
   ```bash
   node scripts/upload-base-template.js
   ```

**Nota**: Las actualizaciones de la plantilla base no afectan a las tiendas existentes. Si deseas propagar cambios a tiendas existentes, deberás implementar un proceso de actualización separado.

## Consideraciones para el Futuro

- **Versionado de Plantillas**: Implementar un sistema de versionado para las plantillas base
- **Múltiples Temas**: Soporte para múltiples plantillas base (diferentes temas)
- **Actualización Selectiva**: Mecanismo para actualizar plantillas de tiendas existentes con cambios específicos de la plantilla base
- **Personalización Avanzada**: Herramientas para que los usuarios personalicen sus plantillas sin perder la capacidad de recibir actualizaciones
