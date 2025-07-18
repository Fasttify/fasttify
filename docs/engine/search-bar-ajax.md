# Guía para Desarrolladores de Temas: Barra de Búsqueda AJAX en el Header

## 1. ¿Qué es la búsqueda AJAX en el header?

La barra de búsqueda del header permite a los usuarios buscar productos en tiempo real, mostrando resultados instantáneos en un modal o dropdown, **sin recargar la página**. Esta funcionalidad mejora la experiencia de usuario y es totalmente configurable desde el tema.

---

## 2. ¿Cómo funciona desde el tema?

- **El motor expone variables globales** (`search_products_limit`, `shop.storeId`) que puedes usar en tu JavaScript.
- **El snippet del header** debe incluir el input de búsqueda y el contenedor donde se mostrarán los resultados.
- **El archivo JS** (por ejemplo, `assets/header.js`) se encarga de escuchar los eventos del input, hacer la petición AJAX y renderizar los resultados.

---

## 3. Integración paso a paso

### a) Exponer variables globales en tu snippet

En tu `snippets/header.liquid` (o donde esté el buscador):

```liquid
<script>
  window.STORE_ID = "{{ shop.storeId }}";
  window.SEARCH_PRODUCTS_LIMIT = {{ search_products_limit }};
</script>
{{ 'header.js' | asset_url | script_tag }}
```

### b) Estructura HTML recomendada

```liquid
<input type="search" class="search-input" placeholder="Buscar productos...">
<div class="search-dialog-products-grid"></div>
```

### c) Lógica JavaScript (en `assets/header.js`)

- Escucha el evento `input` del campo de búsqueda.
- Si el usuario escribe al menos 1 carácter, hace una petición AJAX a `/api/stores/{storeId}/search?q=...&limit=...`.
- Muestra un loader mientras busca.
- Renderiza los productos recibidos como tarjetas.
- Si no hay resultados, muestra un mensaje amigable.
- Si ocurre un error, muestra un mensaje de error.

**Fragmento de ejemplo:**

```javascript
document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.querySelector('.search-input');
  const productsGrid = document.querySelector('.search-dialog-products-grid');
  const storeId = window.STORE_ID;

  let debounceTimeout = null;

  if (searchInput && productsGrid && storeId) {
    searchInput.addEventListener('input', function (e) {
      const query = e.target.value.trim();
      clearTimeout(debounceTimeout);

      if (query.length < 1) {
        productsGrid.innerHTML = '';
        return;
      }

      debounceTimeout = setTimeout(() => {
        productsGrid.innerHTML = '<div class="loader">Buscando...</div>';
        fetch(`/api/stores/${storeId}/search?q=${encodeURIComponent(query)}&limit=${window.SEARCH_PRODUCTS_LIMIT}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.products && data.products.length > 0) {
              productsGrid.innerHTML = data.products
                .map(
                  (product) => `
                <div class="product-card-placeholder">
                  <img src="${product.featured_image}" alt="${product.title}" loading="lazy">
                  <a href="${product.url}" class="product-card-link">
                    <h3>${product.title}</h3>
                    <p>${product.price}</p>
                  </a>
                </div>
              `
                )
                .join('');
            } else {
              productsGrid.innerHTML = '<div class="no-results">No se encontraron productos.</div>';
            }
          })
          .catch(() => {
            productsGrid.innerHTML = '<div class="error">Error al buscar productos.</div>';
          });
      }, 300);
    });
  }
});
```

---

## 4. Personalización para tu tema

- **Diseño:** Puedes modificar el HTML generado en el JS para cambiar el aspecto de las tarjetas de producto.
- **Loader y mensajes:** Personaliza los mensajes de "Buscando...", "No se encontraron productos" o "Error" según el estilo de tu tienda.
- **Límite de resultados:** El límite se controla desde el panel de administración (`settings_schema.json`) y se expone como `search_products_limit`.
- **Campos adicionales:** Si la API devuelve más campos, puedes mostrarlos fácilmente en el renderizado.

---

## 5. Buenas prácticas

- **Mantén el JS en un archivo separado** y cárgalo como asset.
- **Usa variables globales** para pasar datos desde Liquid a JS.
- **Aplica debounce** para evitar peticiones excesivas.
- **Limpia el grid** si el input queda vacío.
- **Haz el diseño responsivo** y consistente con el resto del tema.

---

## 6. Troubleshooting

- **No aparecen resultados:** Verifica que la tienda tenga productos y que la API esté funcionando.
- **No se actualiza el límite:** Asegúrate de que el valor en `settings_schema.json` sea válido y que el contexto Liquid lo exponga.
- **Errores de JS:** Usa la consola del navegador para depurar errores en el script.
- **El JS no se ejecuta:** Verifica que el asset esté correctamente cargado y que el DOM esté listo.

---

## 7. Ejemplo completo de integración

```liquid
<!-- En snippets/header.liquid -->
<input type="search" class="search-input" placeholder="Buscar productos...">
<div class="search-dialog-products-grid"></div>
<script>
  window.STORE_ID = "{{ shop.storeId }}";
  window.SEARCH_PRODUCTS_LIMIT = {{ search_products_limit }};
</script>
{{ 'header.js' | asset_url | script_tag }}
```

---

Con esta guía, cualquier desarrollador de temas puede aprovechar y personalizar la barra de búsqueda AJAX para ofrecer una experiencia moderna y rápida en sus tiendas.
