# Sistema de Almacenamiento de Temas en S3

## Descripción General

El sistema de almacenamiento de temas en S3 permite a los usuarios subir temas personalizados que se almacenan de forma organizada y segura en Amazon S3, con acceso a través de CloudFront CDN.

## Estructura de Almacenamiento

### Organización por Store ID

Los temas se almacenan en S3 siguiendo esta estructura organizada por carpetas:

```
s3://fasttify-themes/
├── templates/
│   ├── {storeId}/
│   │   ├── theme.zip                        # Archivo ZIP original
│   │   ├── metadata.json                    # Metadata del tema
│   │   ├── layout/                          # Archivos de layout
│   │   │   └── theme.liquid
│   │   ├── templates/                       # Archivos de templates
│   │   │   ├── index.json
│   │   │   └── product.json
│   │   ├── sections/                        # Archivos de secciones
│   │   │   ├── header.liquid
│   │   │   └── footer.liquid
│   │   ├── snippets/                        # Archivos de snippets
│   │   │   └── product-card.liquid
│   │   ├── assets/                          # Archivos de assets
│   │   │   ├── theme.css
│   │   │   ├── theme.js
│   │   │   └── images/
│   │   ├── config/                          # Archivos de configuración
│   │   │   └── settings_schema.json
│   │   ├── locales/                         # Archivos de localización
│   │   │   └── en.default.json
│   │   └── root/                            # Archivos en la raíz
│   │       └── README.md
│   └── {storeId2}/
```

### Claves S3

- **Base Key**: `templates/{storeId}/`
- **ZIP Original**: `templates/{storeId}/theme.zip`
- **Metadata**: `templates/{storeId}/metadata.json`
- **Layout**: `templates/{storeId}/layout/{filePath}`
- **Templates**: `templates/{storeId}/templates/{filePath}`
- **Sections**: `templates/{storeId}/sections/{filePath}`
- **Snippets**: `templates/{storeId}/snippets/{filePath}`
- **Assets**: `templates/{storeId}/assets/{filePath}`
- **Config**: `templates/{storeId}/config/{filePath}`
- **Locales**: `templates/{storeId}/locales/{filePath}`
- **Root**: `templates/{storeId}/root/{filePath}`

## Configuración de Variables de Entorno

```env
# AWS S3 Configuration
BUCKET_NAME=fasttify-themes
REGION_BUCKET=us-east-2

# CDN Configuration
CLOUDFRONT_DOMAIN_NAME=cdn.fasttify.com
```

## Funcionalidades

### 1. Almacenamiento de Temas

```typescript
const s3Storage = S3StorageService.getInstance();
const result = await s3Storage.storeTheme(processedTheme, storeId, zipFile);
```

### 2. Estructura de Metadata

```json
{
  "themeId": "nike-2dbc56f-1754092548569",
  "storeId": "2dbc56f",
  "name": "Nike Theme",
  "version": "1.0.0",
  "author": "Fasttify",
  "description": "Tema personalizado para Nike",
  "fileCount": 62,
  "totalSize": 436075,
  "sections": 12,
  "templates": 6,
  "assets": 29,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "structure": {
    "hasLayout": true,
    "hasSettings": true,
    "hasIndex": true,
    "hasProduct": true,
    "hasCollection": true
  }
}
```

### 3. URLs de CDN

- **ZIP Original**: `https://cdn.fasttify.com/templates/{storeId}/theme.zip`
- **Metadata**: `https://cdn.fasttify.com/templates/{storeId}/metadata.json`
- **Layout**: `https://cdn.fasttify.com/templates/{storeId}/layout/{filePath}`
- **Templates**: `https://cdn.fasttify.com/templates/{storeId}/templates/{filePath}`
- **Sections**: `https://cdn.fasttify.com/templates/{storeId}/sections/{filePath}`
- **Snippets**: `https://cdn.fasttify.com/templates/{storeId}/snippets/{filePath}`
- **Assets**: `https://cdn.fasttify.com/templates/{storeId}/assets/{filePath}`
- **Config**: `https://cdn.fasttify.com/templates/{storeId}/config/{filePath}`
- **Locales**: `https://cdn.fasttify.com/templates/{storeId}/locales/{filePath}`
- **Root**: `https://cdn.fasttify.com/templates/{storeId}/root/{filePath}`

## Operaciones Disponibles

### Almacenar Tema

```typescript
const result = await s3Storage.storeTheme(theme, storeId, zipFile);
// Returns: { success: true, storeId, s3Key, cdnUrl }
```

### Obtener Tema

```typescript
const theme = await s3Storage.getTheme(storeId);
// Returns: ProcessedTheme | null
```

### Eliminar Tema

```typescript
const result = await s3Storage.deleteTheme(storeId);
// Returns: { success: boolean, error?: string }
```

### Listar Temas de Tienda

```typescript
const themes = await s3Storage.listStoreThemes(storeId);
// Returns: string[] (theme IDs)
```

## Seguridad

### Permisos IAM Requeridos

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::fasttify-themes", "arn:aws:s3:::fasttify-themes/*"]
    }
  ]
}
```

### Política de Bucket

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::fasttify-themes/*"
    }
  ]
}
```

## Integración con CloudFront

### Configuración de Distribución

1. **Origen**: S3 Bucket `fasttify-themes`
2. **Comportamiento**: Cache basado en headers
3. **Compresión**: Habilitada para archivos de texto
4. **TTL**: 24 horas para archivos estáticos

### Headers de Cache

```
Cache-Control: public, max-age=86400
Content-Type: application/zip (para ZIPs)
Content-Type: application/json (para metadata)
```

## Monitoreo y Logs

### Métricas Importantes

- **Tiempo de Upload**: Promedio de tiempo para subir temas
- **Tasa de Éxito**: Porcentaje de uploads exitosos
- **Tamaño Promedio**: Tamaño promedio de los temas
- **Uso de Almacenamiento**: Espacio utilizado por tienda

### Logs Estructurados

```json
{
  "level": "info",
  "message": "Theme stored successfully in S3",
  "storeId": "2dbc56f",
  "s3Key": "templates/2dbc56f",
  "fileCount": 62,
  "totalSize": 436075,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Optimizaciones Futuras

### 1. Compresión Automática

- Comprimir archivos CSS/JS antes de subir
- Optimizar imágenes automáticamente
- Minificar archivos de texto

### 2. Versionado

- Mantener versiones anteriores de temas
- Rollback automático en caso de problemas
- Historial de cambios

### 3. CDN Avanzado

- Invalidación automática de cache
- Compresión gzip/brotli
- Headers de seguridad

### 4. Backup y Replicación

- Replicación cross-region
- Backup automático a Glacier
- Recuperación de desastres

## Troubleshooting

### Problemas Comunes

1. **Error de Permisos**
   - Verificar IAM roles y políticas
   - Confirmar credenciales de AWS

2. **Timeout en Upload**
   - Aumentar límites de tiempo
   - Implementar upload multiparte

3. **Error de Validación**
   - Verificar estructura del ZIP
   - Confirmar archivos requeridos

4. **Problemas de CDN**
   - Verificar configuración de CloudFront
   - Invalidar cache si es necesario
