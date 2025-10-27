# Documentación de Patrones Regex

Este directorio contiene todos los patrones de expresiones regulares centralizados utilizados en todo el paquete `liquid-forge`. Todos los patrones están organizados por categoría y exportados a través del archivo principal `index.ts`.

## Estructura del Directorio

```
lib/regex-patterns/
├── index.ts              # Archivo de exportación principal
├── liquid-syntax.ts      # Patrones de sintaxis Liquid
├── minification.ts      # Patrones de minificación
├── filters.ts           # Patrones de filtros
├── validation.ts         # Patrones de validación y seguridad
├── utility.ts            # Patrones de utilidad
└── README.md            # Este archivo
```

## Categorías de Patrones

### 1. Sintaxis Liquid (`liquid-syntax.ts`)

Patrones para detectar y analizar la sintaxis de plantillas Liquid.

#### LIQUID_OBJECT_PATTERNS

Detecta objetos Liquid en plantillas:

- `products`: Detecta `{{ products |`
- `collections`: Detecta `{{ collections |`
- `product`: Detecta `{{ product.`
- `collection`: Detecta `{{ collection.`
- `linklists`: Detecta `{{ linklists.`
- `shop`: Detecta `{{ shop.`
- `pages`: Detecta `{{ pages |`
- `page`: Detecta `{{ page.`
- `blog`: Detecta `{{ blog.`
- `checkout`: Detecta `{{ checkout.`
- `relatedProducts`: Detecta uso de productos relacionados
- `pagination`: Detecta `{% paginate`

#### LIQUID_TAG_PATTERNS

Detecta etiquetas Liquid:

- `paginate`: Detecta etiquetas de paginación
- `section`: Detecta etiquetas de sección
- `render`: Detecta etiquetas de render
- `include`: Detecta etiquetas include

#### LIQUID_COLLECTION_ACCESS_PATTERNS

Patrones para acceder a colecciones y páginas:

- `bracketNotation`: `collections['handle']`
- `dotNotation`: `collections.handle`
- `specificAccess`: Combina notación de corchetes y punto
- `collectionProducts`: `collections.handle.products`
- `specificPage`: Acceso a páginas específicas
- `specificProduct`: Acceso a productos específicos
- `extractCollectionHandle`: Extraer handle de colección del match
- `extractPagesBracket`: Buscar notación de corchetes de páginas
- `extractPagesDot`: Buscar notación de punto de páginas
- `extractPagesHandle`: Extraer handle de página
- `pagesBracketExtract`: Extraer handle de notación de corchetes

#### LIQUID_FILTER_PATTERNS

Patrones para análisis de filtros:

- `productRelated`: Extraer límite de productos relacionados
- `productsLimit`: Extraer límite de productos
- `collectionsLimit`: Extraer límite de colecciones
- `generalLimit`: Extraer límite general
- `paginateBy`: Dividir cláusula de paginación

#### LIQUID_OPTION_EXTRACTOR_PATTERNS

Patrones para extraer opciones:

- `sectionName`: Extraer nombre de sección
- `snippetName`: Extraer nombre de snippet
- `collectionHandle`: Extraer handle de colección

#### LIQUID_PAGINATION_PATTERNS

Patrones para paginación:

- `paginate`: Etiqueta principal de paginación
- `policies`: Detectar bucles de políticas
- `pagesLimit`: Extraer límite de páginas

#### LIQUID_VARIABLE_PATTERNS

Patrones para variables:

- `variable`: Coincidir variables Liquid
- `cleanVariableTags`: Limpiar etiquetas de variables

---

### 2. Minificación (`minification.ts`)

Patrones para minificación y optimización de código.

#### MINIFICATION_PATTERNS

Patrones generales de minificación:

- `htmlComment`: Eliminar comentarios HTML
- `blockComment`: Eliminar comentarios de bloque `/* */`
- `lineComment`: Eliminar comentarios de línea `//`
- `trimLines`: Eliminar espacios iniciales y finales
- `multipleNewlines`: Eliminar líneas vacías múltiples
- `multipleSpaces`: Colapsar espacios múltiples
- `operatorSpaces`: Limpiar espacios de operadores
- `liquidComment`: Eliminar comentarios Liquid

#### CSS_MINIFICATION_PATTERNS

Patrones específicos de CSS:

- `comments`: Eliminar comentarios CSS
- `spaces`: Colapsar espacios
- `syntax`: Limpiar espacios alrededor de sintaxis

#### CSS_OPTIMIZATION_PATTERNS

Optimización CSS:

- `comments`: Eliminar comentarios
- `braces`: Normalizar espacios alrededor de llaves
- `semicolons`: Normalizar espacios alrededor de punto y coma
- `emptyLines`: Eliminar líneas vacías

---

### 3. Filtros (`filters.ts`)

Patrones utilizados por los filtros Liquid.

#### ESCAPE_PATTERNS

Escapado HTML:

- `ampersand`: Escapar `&` a `&amp;`
- `lessThan`: Escapar `<` a `&lt;`
- `greaterThan`: Escapar `>` a `&gt;`
- `doubleQuote`: Escapar `"` a `&quot;`
- `apostrophe`: Escapar `'` a `&#x27;`

#### HANDLE_PATTERNS

Creación de handles (slugs amigables para SEO):

- `aVariants`: Normalizar á, à, ä, â, ã a 'a'
- `eVariants`: Normalizar é, è, ë, ê a 'e'
- `iVariants`: Normalizar í, ì, ï, î a 'i'
- `oVariants`: Normalizar ó, ò, ö, ô, õ a 'o'
- `uVariants`: Normalizar ú, ù, ü, û a 'u'
- `enye`: Normalizar ñ a 'n'
- `cCedilla`: Normalizar ç a 'c'
- `nonAlphanumeric`: Reemplazar no alfanuméricos con `-`
- `multipleDashes`: Colapsar guiones múltiples
- `leadingTrailingDash`: Eliminar guiones iniciales/finales

#### URL_PATTERNS

Manipulación de URLs:

- `url`: Coincidir URLs
- `urlProtocol`: Extraer protocolo
- `urlDomain`: Extraer dominio
- `urlPath`: Extraer ruta
- `urlQuery`: Extraer cadena de consulta
- `urlHash`: Extraer hash
- `isAbsolute`: Verificar si URL es absoluta
- `makeAbsolute`: Hacer URL absoluta
- `ensureProtocol`: Asegurar que URL tenga protocolo
- `cleanQuery`: Limpiar cadena de consulta
- `removeHash`: Eliminar hash de URL
- `urlEncode`: Codificar URL
- `urlDecode`: Decodificar URL
- `sanitizeUrl`: Sanitizar URL

---

### 4. Validación (`validation.ts`)

Patrones para seguridad y validación.

#### SECURITY_PATTERNS

Comprobaciones de seguridad:

- `externalScript`: Detectar etiquetas de script externas
- `externalCss`: Detectar enlaces CSS externos
- `externalImage`: Detectar imágenes externas
- `externalUrl`: Coincidir URLs externas

#### DANGEROUS_FUNCTION_PATTERNS

Funciones de JavaScript peligrosas:

- `eval`: Detectar eval()
- `functionConstructor`: Detectar Function()
- `setTimeout`: Detectar setTimeout()
- `setInterval`: Detectar setInterval()
- `documentWrite`: Detectar document.write
- `documentWriteln`: Detectar document.writeln
- `innerHTML`: Detectar asignaciones innerHTML
- `outerHTML`: Detectar asignaciones outerHTML

#### SENSITIVE_DATA_PATTERNS

Detección de datos sensibles:

- `apiKey`: Detectar referencias a API key
- `secret`: Detectar referencias a secretos
- `password`: Detectar referencias a contraseñas
- `token`: Detectar referencias a tokens
- `privateKey`: Detectar referencias a clave privada
- `accessKey`: Detectar referencias a clave de acceso

---

### 5. Utilidad (`utility.ts`)

Patrones de utilidad general.

#### PATH_PATTERNS

Manipulación de rutas:

- `backslashes`: Coincidir barras invertidas
- `leadingSlash`: Eliminar barras iniciales de rutas

#### SANITIZATION_PATTERNS

Sanitización de texto:

- `themeName`: Sanitizar nombres de temas a alfanuméricos

#### JSON_PARSING_PATTERNS

Análisis JSON:

- `liquidSchema`: Extraer bloques de esquema Liquid
- `trailingComma`: Eliminar comas finales
- `multipleCommas`: Corregir comas múltiples
- `lineComment`: Coincidir comentarios de línea
- `blockComment`: Coincidir comentarios de bloque

---

## Uso

Importar patrones desde el índice principal:

```typescript
import {
  LIQUID_OBJECT_PATTERNS,
  MINIFICATION_PATTERNS,
  ESCAPE_PATTERNS,
  // ... otros patrones
} from '../../../lib/regex-patterns';

// Usar en código
const match = content.match(LIQUID_OBJECT_PATTERNS.products);
```

## Modificadores de Patrones

Los patrones utilizan estas banderas comunes:

- `g`: Coincidencia global (buscar todas las coincidencias)
- `i`: Insensible a mayúsculas
- `m`: Modo multilínea
- `u`: Modo unicode

## Beneficios de la Centralización

1. **Mantenibilidad**: Actualizar patrones en un solo lugar
2. **Consistencia**: Mismo patrón en todos los usos
3. **Testabilidad**: Probar patrones de forma independiente
4. **Documentación**: Propósito claro para cada patrón
5. **Reutilización**: Compartir patrones entre módulos

## Actualización de Patrones

Al actualizar patrones:

1. Documentar el cambio en este README
2. Actualizar comentarios JSDoc en el archivo de patrones
3. Ejecutar linter para verificar que no hay errores
4. Probar módulos afectados

## Contribuir

Al añadir nuevos patrones:

1. Colocar en el archivo de categoría apropiado
2. Exportar desde ese archivo
3. Exportar desde `index.ts`
4. Documentar en este README
5. Usar nombres descriptivos
