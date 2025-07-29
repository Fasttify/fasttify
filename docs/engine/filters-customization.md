# Personalización de Filtros

El sistema de filtros es completamente personalizable para adaptarse a cualquier diseño o framework CSS.

## Opciones Básicas

```liquid
{% filters style: 'horizontal', max_categories: 8, max_tags: 10 %}
```

## Personalización de CSS

### Cambiar clases CSS personalizadas

```liquid
{% filters css_class: 'mi-filtros-personalizados' %}
```

Esto generará:

```html
<div class="mi-filtros-personalizados mi-filtros-personalizados--horizontal">
  <div class="mi-filtros-personalizados__controls">
    <h3 class="mi-filtros-personalizados__title">Filtros</h3>
    <!-- ... -->
  </div>
</div>
```

### Selector de productos personalizado

```liquid
{% filters product_renderer: '.my-custom-grid' %}
```

## Templates Completamente Personalizados

### Ejemplo con Bootstrap

```liquid
{% filters
   custom_template: '<div class="row mb-4" data-store-id="{{storeId}}">
     <div class="col-12">
       <div class="card">
         <div class="card-body">
           <h5 class="card-title">Filtrar Productos</h5>
           <div class="row g-3">
             <div class="col-md-3">
               <label class="form-label">Precio Mínimo</label>
               <input type="number" class="form-control price-input price-input--min" placeholder="Mín">
             </div>
             <div class="col-md-3">
               <label class="form-label">Precio Máximo</label>
               <input type="number" class="form-control price-input price-input--max" placeholder="Máx">
             </div>
             <div class="col-md-3">
               <div class="form-check mt-4">
                 <input class="form-check-input availability-filter" type="checkbox">
                 <label class="form-check-label">Solo disponibles</label>
               </div>
             </div>
             <div class="col-md-3">
               <label class="form-label">Ordenar por</label>
               <select class="form-select sort-select">
                 <option value="createdAt">Más recientes</option>
                 <option value="price">Precio: menor a mayor</option>
                 <option value="price_desc">Precio: mayor a menor</option>
               </select>
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>',
   css_class: 'filters-bootstrap'
%}
```

### Ejemplo con Tailwind CSS

```liquid
{% filters
   custom_template: '<div class="mb-6 bg-white rounded-lg shadow-sm border border-gray-200" data-store-id="{{storeId}}">
     <div class="p-6">
       <h3 class="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
       <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div>
           <label class="block text-sm font-medium text-gray-700 mb-1">Precio Mín</label>
           <input type="number" class="price-input price-input--min w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Mín">
         </div>
         <div>
           <label class="block text-sm font-medium text-gray-700 mb-1">Precio Máx</label>
           <input type="number" class="price-input price-input--max w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Máx">
         </div>
         <div class="flex items-center">
           <input type="checkbox" class="availability-filter h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
           <label class="ml-2 text-sm text-gray-700">Solo disponibles</label>
         </div>
         <div>
           <label class="block text-sm font-medium text-gray-700 mb-1">Ordenar</label>
           <select class="sort-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
             <option value="createdAt">Más recientes</option>
             <option value="price">Precio: menor a mayor</option>
             <option value="price_desc">Precio: mayor a menor</option>
           </select>
         </div>
       </div>
     </div>
   </div>',
   css_class: 'filters-tailwind'
%}
```

## Personalización de Productos

### Template personalizado de productos

```liquid
{% filters
   product_renderer: '.custom-products-container',
   custom_template: '<div class="product-item" data-product-id="{{product.id}}">
     <img src="{{product.image}}" alt="{{product.name}}" class="product-img">
     <h3 class="product-name">{{product.name}}</h3>
     <p class="product-price">{{product.price}}</p>
     <span class="product-vendor">{{product.vendor}}</span>
     <button onclick="addToCart({{product.id}})">Agregar</button>
   </div>'
%}
```

### Variables disponibles para productos

- `{{product.id}}` - ID del producto
- `{{product.name}}` - Nombre del producto
- `{{product.price}}` - Precio formateado
- `{{product.slug}}` - Slug para URL
- `{{product.vendor}}` - Proveedor
- `{{product.quantity}}` - Cantidad disponible
- `{{product.image}}` - URL de la primera imagen

## Mensajes Personalizados

```liquid
{% filters
   no_results_message: 'No hay productos que coincidan con tus filtros 😞',
   loading_message: '🔍 Buscando productos perfectos para ti...'
%}
```

## Ejemplo Completo - Diseño Card Moderno

```liquid
{% filters
   style: 'horizontal',
   css_class: 'modern-filters',
   product_renderer: '.products-masonry',
   custom_template: '
   <div class="modern-filters-container" data-store-id="{{storeId}}">
     <div class="filter-bar">
       <div class="filter-section">
         <h4>💰 Precio</h4>
         <div class="price-range">
           <input type="number" class="price-input price-input--min" placeholder="Desde">
           <span>-</span>
           <input type="number" class="price-input price-input--max" placeholder="Hasta">
         </div>
       </div>

       <div class="filter-section">
         <h4>📦 Disponibilidad</h4>
         <label class="toggle-switch">
           <input type="checkbox" class="availability-filter">
           <span class="slider">Solo en stock</span>
         </label>
       </div>

       <div class="filter-section">
         <h4>🔄 Ordenar</h4>
         <select class="sort-select custom-select">
           <option value="createdAt">➡️ Más recientes</option>
           <option value="price">💲 Precio ↑</option>
           <option value="price_desc">💲 Precio ↓</option>
           <option value="name">🔤 A-Z</option>
         </select>
       </div>
     </div>
   </div>

   <style>
     .modern-filters-container {
       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
       border-radius: 15px;
       padding: 20px;
       margin-bottom: 30px;
       box-shadow: 0 8px 32px rgba(0,0,0,0.1);
     }

     .filter-bar {
       display: grid;
       grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
       gap: 20px;
       align-items: end;
     }

     .filter-section h4 {
       color: white;
       margin: 0 0 10px 0;
       font-size: 14px;
       font-weight: 600;
     }

     .price-range {
       display: flex;
       align-items: center;
       gap: 8px;
     }

     .price-input, .custom-select {
       background: rgba(255,255,255,0.9);
       border: none;
       padding: 8px 12px;
       border-radius: 8px;
       font-size: 14px;
     }

     .toggle-switch {
       display: flex;
       align-items: center;
       color: white;
       cursor: pointer;
       gap: 8px;
     }
   </style>',
   no_results_message: '🔍 No encontramos productos con esos filtros',
   loading_message: '⚡ Cargando productos increíbles...'
%}
```

## Integración con Frameworks

### Para usar con tu CSS Framework existente:

1. **Bootstrap**: Usa clases como `form-control`, `btn`, `card`
2. **Tailwind**: Usa utilidades como `w-full`, `px-3`, `py-2`, `rounded-md`
3. **Bulma**: Usa clases como `field`, `control`, `input`, `button`
4. **Foundation**: Usa clases como `input-group`, `button`

El sistema respetará completamente tu framework y no interferirá con tus estilos existentes.
