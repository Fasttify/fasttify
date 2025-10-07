/**
 * Renderizador de productos filtrados que usa el diseño personalizado
 * Basado en el template Liquid de product-list-view.liquid
 * Usa la función global window.formatMoney del layout
 */

class FilterProductRenderer {
  constructor() {
    this.addProductToCart = this.addProductToCart.bind(this);
  }

  /**
   * Renderiza un producto usando el diseño personalizado
   */
  renderProduct(product) {
    const badges = this.renderBadges(product);
    const images = this.renderImages(product);
    const attributes = this.renderAttributes(product);
    const price = this.renderPrice(product);

    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image-wrapper">
          <a href="${product.url || `/products/${product.id}`}" class="product-link">
            ${images}
          </a>

          <div class="product-badges">
            ${badges}
          </div>

          <div class="product-overlay">
            <div class="product-overlay-content">
              <a href="${product.url || `/products/${product.id}`}" class="product-btn product-btn-primary">
                <span>VER PRODUCTO</span>
              </a>

              <button class="product-btn product-btn-secondary" onclick="addProductToCart('${product.id}', 1)"
                aria-label="Añadir al carrito">
                <span>
                  AÑADIR AL CARRITO
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="product-info">
          <div class="product-vendor">${product.vendor ? product.vendor.toUpperCase() : ''}</div>
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">
            ${price}
          </div>
          ${attributes}
        </div>
      </div>
    `;
  }

  /**
   * Renderiza las imágenes del producto
   */
  renderImages(product) {
    if (product.images && product.images.length > 1) {
      return `
        <img class="product-image product-image-primary" src="${product.images[0]?.url || ''}"
          alt="${product.name}" loading="lazy">
        <img class="product-image product-image-secondary" src="${product.images[1]?.url || ''}"
          alt="${product.name}" loading="lazy">
        <div class="multiple-images-indicator">
          <div class="indicator-dot active"></div>
          <div class="indicator-dot"></div>
          ${product.images.length > 2 ? '<div class="indicator-dot"></div>' : ''}
        </div>
      `;
    } else if (product.images && product.images.length > 0) {
      return `<img class="product-image" src="${product.images[0]?.url || ''}" alt="${product.name}" loading="lazy">`;
    } else {
      return `
        <div class="product-placeholder">
          <div class="placeholder-content">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
            <p>Imagen del producto</p>
          </div>
        </div>
      `;
    }
  }

  /**
   * Renderiza los badges del producto
   */
  renderBadges(product) {
    const badges = [];
    const tags = this.parseTags(product.tags);
    const createdAt = new Date(product.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Badge NEW
    if (tags.includes('new') || createdAt > thirtyDaysAgo) {
      badges.push('<span class="product-badge badge-new">NEW</span>');
    } else if (tags.includes('bestseller')) {
      badges.push('<span class="product-badge badge-bestseller">BESTSELLER</span>');
    } else if (tags.includes('trending')) {
      badges.push('<span class="product-badge badge-trending">TRENDING</span>');
    }

    // Badge SALE
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      const discountPercent = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
      badges.push(`<span class="product-badge badge-sale">SAVE ${discountPercent}%</span>`);
    }

    return badges.join('');
  }

  /**
   * Renderiza el precio del producto usando la función global
   */
  renderPrice(product) {
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      return `
        <span class="price-compare">${window.formatMoney(product.compareAtPrice)}</span>
        <span class="price-current price-sale">${window.formatMoney(product.price)}</span>
      `;
    } else {
      return `<span class="price-current">${window.formatMoney(product.price)}</span>`;
    }
  }

  /**
   * Renderiza los atributos del producto
   */
  renderAttributes(product) {
    if (!product.attributes || product.attributes.length === 0) {
      return '';
    }

    let html = '<div class="product-attributes-summary">';

    product.attributes.forEach((attribute) => {
      html += `
        <div class="attribute-display attribute-display--${attribute.name.toLowerCase().replace(/\s+/g, '-')}">
          <div class="attribute-values-list">
      `;

      if (attribute.name.toLowerCase() === 'color') {
        // Renderizar colores como swatches
        attribute.values.slice(0, 4).forEach((value) => {
          html += `<span class="color-swatch" style="background-color: ${value.toLowerCase()};" title="${value}"></span>`;
        });
        if (attribute.values.length > 4) {
          html += `<span class="attribute-more">+${attribute.values.length - 4}</span>`;
        }
      } else {
        // Renderizar otros atributos como texto
        attribute.values.slice(0, 3).forEach((value) => {
          html += `<span class="attribute-value-item">${value}</span>`;
        });
        if (attribute.values.length > 3) {
          html += `<span class="attribute-more">+${attribute.values.length - 3}</span>`;
        }
      }

      html += `
          </div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  }

  /**
   * Parsea tags desde string o array
   */
  parseTags(tags) {
    if (!tags) return [];

    if (Array.isArray(tags)) {
      return tags;
    }

    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [tags];
      } catch (e) {
        return [tags];
      }
    }

    return [];
  }

  /**
   * Función para agregar al carrito
   */
  addProductToCart(productId, quantity) {
    console.log('Agregando producto al carrito:', productId, quantity);
    // Implementar lógica de carrito aquí
    alert('Producto agregado al carrito');
  }

  /**
   * Renderiza una lista de productos
   */
  renderProducts(products) {
    if (!products || products.length === 0) {
      return '<p class="no-products">No se encontraron productos.</p>';
    }

    return products.map((product) => this.renderProduct(product)).join('');
  }

  /**
   * Reemplaza productos en el contenedor
   */
  replaceProducts(products, container) {
    if (!container) return;

    const productsHTML = this.renderProducts(products);
    container.innerHTML = productsHTML;
  }

  /**
   * Agrega productos al final del contenedor
   */
  appendProducts(products, container) {
    if (!container || !products || products.length === 0) return;

    const productsHTML = products.map((product) => this.renderProduct(product)).join('');
    container.insertAdjacentHTML('beforeend', productsHTML);
  }
}

// Crear instancia global
window.filterProductRenderer = new FilterProductRenderer();

// Hacer la función de carrito disponible globalmente
window.addProductToCart = window.filterProductRenderer.addProductToCart;
