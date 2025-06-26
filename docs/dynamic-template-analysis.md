# Sistema Dinámico de Análisis de Plantillas

## 🎯 Objetivo

Transformar el motor de renderizado de un sistema **hardcodeado** a uno **dinámico e inteligente** que analiza las plantillas Liquid para determinar qué datos cargar, similar a como funciona Shopify.

## 🔄 Antes vs Ahora

### ❌ **Sistema Anterior (Hardcodeado)**

```typescript
// SIEMPRE cargaba los mismos datos, usara la plantilla o no
const featuredProducts = await dataFetcher.getFeaturedProducts(storeId, 8) // ← Fijo: 8
const collections = await dataFetcher.getStoreCollections(storeId, { limit: 6 }) // ← Fijo: 6
```

**Problemas:**

- ❌ Carga datos innecesarios
- ❌ Límites hardcodeados
- ❌ No flexible
- ❌ Menos eficiente

### ✅ **Sistema Actual (Dinámico)**

```typescript
// 1. Analiza la plantilla para detectar qué necesita
const analysis = await templateAnalyzer.analyzeTemplate(template, path)

// 2. Solo carga lo que detectó
for (const [dataType, options] of analysis.requiredData) {
  await loadSpecificData(dataType, options) // ← Carga solo lo necesario
}
```

**Beneficios:**

- ✅ Solo carga lo que se usa
- ✅ Respeta límites de la plantilla
- ✅ Totalmente flexible
- ✅ Más eficiente
- ✅ Compatible con Shopify

## 🧠 Cómo Funciona

### 1. **Análisis de Plantillas**

El `TemplateAnalyzer` usa regex patterns para detectar objetos Liquid:

```liquid
{% for product in collections.featured.products limit: 8 %}
  {{ product.title }}
{% endfor %}
```

**Detecta:**

- ✅ Objeto: `collections`
- ✅ Límite: `8`
- ✅ Tipo: `featured_products`

### 2. **Detección de Dependencias**

```liquid
{% section 'header' %}
{% render 'product-card', product: product %}
```

**Detecta:**

- ✅ Sección: `sections/header.liquid`
- ✅ Snippet: `snippets/product-card.liquid`

### 3. **Paginación Inteligente**

```liquid
{% paginate products by 24 %}
  <!-- contenido paginado -->
{% endpaginate %}
```

**Detecta:**

- ✅ Paginación: `true`
- ✅ Items por página: `24`

## 📊 Ejemplos de Detección

### **Homepage**

```liquid
<section class="featured">
  {% for product in collections.featured.products limit: 12 %}
    {{ product.title }}
  {% endfor %}
</section>

<section class="collections">
  {% for collection in collections limit: 8 %}
    {{ collection.title }}
  {% endfor %}
</section>
```

**Resultado del análisis:**

```typescript
{
  requiredData: Map([
    ['featured_products', { limit: 12 }],
    ['collections', { limit: 8 }]
  ]),
  hasPagination: false,
  usedSections: [],
  liquidObjects: ['collections']
}
```

### **Página de Producto**

```liquid
<div class="product">
  <h1>{{ product.title }}</h1>
  <p>{{ product.price | money }}</p>

  {% for variant in product.variants %}
    <option>{{ variant.title }}</option>
  {% endfor %}
</div>
```

**Resultado del análisis:**

```typescript
{
  requiredData: Map([
    ['product', {}],
    ['cart', {}], // Siempre necesario para header
    ['shop', {}]  // Siempre necesario
  ]),
  liquidObjects: ['product']
}
```

### **Página Simple**

```liquid
<div class="about">
  <h1>Acerca de {{ shop.name }}</h1>
  <p>{{ shop.description }}</p>
</div>
```

**Resultado del análisis:**

```typescript
{
  requiredData: Map([
    ['shop', {}],
    ['cart', {}] // Solo para header
  ]),
  liquidObjects: ['shop']
}
// ✅ NO carga productos ni colecciones innecesariamente
```

## 🚀 Uso del Sistema

### **Renderizado Automático**

```typescript
import { storeRenderer } from '@/renderer-engine'

// El sistema analiza automáticamente y carga solo lo necesario
const result = await storeRenderer.renderPage('mitienda.fasttify.com', '/')
```

### **Análisis Manual**

```typescript
import { templateAnalyzer } from '@/renderer-engine'

const template = `{% for product in products limit: 20 %}`
const analysis = templateAnalyzer.analyzeTemplate(template, 'custom.liquid')

console.log('Datos necesarios:', Array.from(analysis.requiredData.keys()))
// Output: ['products', 'cart', 'shop']
```

### **Carga Dinámica de Datos**

```typescript
import { dynamicDataLoader } from '@/renderer-engine'

const result = await dynamicDataLoader.loadDynamicData('store123', {
  pageType: 'index',
})

console.log('Análisis:', result.analysis)
console.log('Datos cargados:', Object.keys(result))
```

## 🎯 Patrones de Detección

### **Objetos Liquid Detectados**

| Pattern              | Detecta              | Ejemplo                               |
| -------------------- | -------------------- | ------------------------------------- |
| `{{ products }}`     | Lista de productos   | `{% for product in products %}`       |
| `{{ collections }}`  | Lista de colecciones | `{% for collection in collections %}` |
| `{{ product.* }}`    | Producto individual  | `{{ product.title }}`                 |
| `{{ collection.* }}` | Colección individual | `{{ collection.products }}`           |
| `{{ cart.* }}`       | Carrito              | `{{ cart.total_price }}`              |
| `{{ shop.* }}`       | Información tienda   | `{{ shop.name }}`                     |

### **Límites Detectados**

| Patrón     | Ejemplo                   | Resultado                 |
| ---------- | ------------------------- | ------------------------- |
| `limit: N` | `products limit: 15`      | `{ limit: 15 }`           |
| `by N`     | `paginate products by 20` | `{ limit: 20 }`           |
| Sin límite | `products`                | `{ limit: 20 }` (default) |

### **Dependencias Detectadas**

| Tag             | Ejemplo                  | Resultado                |
| --------------- | ------------------------ | ------------------------ |
| `{% section %}` | `{% section 'header' %}` | `sections/header.liquid` |
| `{% render %}`  | `{% render 'card' %}`    | `snippets/card.liquid`   |
| `{% include %}` | `{% include 'old' %}`    | `snippets/old.liquid`    |

## 📈 Beneficios de Rendimiento

### **Ejemplo: Página Simple**

```liquid
<!-- Solo usa información de la tienda -->
<h1>{{ shop.name }}</h1>
<p>{{ shop.description }}</p>
```

**Antes:** Cargaba productos + colecciones + cart + shop = **4 queries**
**Ahora:** Solo carga cart + shop = **2 queries** (50% menos)

### **Ejemplo: Homepage Personalizada**

```liquid
<!-- Necesita más productos de lo normal -->
{% for product in products limit: 50 %}
  {{ product.title }}
{% endfor %}
```

**Antes:** Siempre 8 productos (insuficiente)
**Ahora:** Detecta y carga 50 productos automáticamente

## 🔧 Configuración Avanzada

### **Patrones Personalizados**

```typescript
// Extender el analizador con nuevos patrones
const customPatterns = {
  blog: /\{\{\s*blog\./g,
  articles: /\{\{\s*articles\s*[\|\}]/g,
}
```

### **Opciones de Inferencia**

```typescript
// El sistema infiere automáticamente según el path
'templates/index.json' → featured_products + collections
'templates/product.json' → product
'templates/collection.json' → collection
'templates/cart.json' → cart
```

## 🐛 Debugging

### **Logs Automáticos**

```
[Renderer:DynamicPageRenderer] Using dynamic data loading for index
[Renderer:DynamicPageRenderer] Dynamic analysis results for index:
{
  requiredData: ['featured_products', 'collections', 'cart', 'shop'],
  liquidObjects: ['collections', 'shop'],
  dependencies: 2
}
```

### **Análisis Detallado**

```typescript
const analysis = await templateAnalyzer.analyzeTemplate(template, path)
console.log({
  requiredData: Array.from(analysis.requiredData.entries()),
  hasPagination: analysis.hasPagination,
  usedSections: analysis.usedSections,
  dependencies: analysis.dependencies,
})
```

## 🎉 Resultado

El motor ahora es **completamente dinámico** y funciona como Shopify:

- ✅ **Análisis automático** de plantillas
- ✅ **Carga inteligente** de datos
- ✅ **Optimización automática** de performance
- ✅ **Flexibilidad total** para cualquier plantilla
- ✅ **Compatibilidad completa** con Liquid de Shopify

¡Ya no más datos hardcodeados! 🚀
