/**
 * Renderizador de productos para el sistema de filtros
 */
export class ProductRenderer {
  /**
   * Renderiza un producto individual
   */
  static renderProduct(product) {
    const existingProduct = document.querySelector('.product-card');
    if (existingProduct) {
      return this.renderFromTemplate(existingProduct, product);
    }

    return this.renderDefaultProduct(product);
  }

  /**
   * Renderiza un producto basado en un template existente
   */
  static renderFromTemplate(template, product) {
    const clone = template.cloneNode(true);

    clone.setAttribute('data-product-id', product.id);

    const image = clone.querySelector('.product-image');
    if (image && product.images && product.images.length > 0) {
      image.src = product.images[0].url;
      image.alt = product.name;
    }

    const title = clone.querySelector('.product-title');
    if (title) {
      title.textContent = product.name;
    }

    const priceElement = clone.querySelector('.price-current');
    if (priceElement) {
      priceElement.textContent = this.formatMoney(product.price);
    }

    const comparePriceElement = clone.querySelector('.price-compare');
    if (comparePriceElement && product.compareAtPrice) {
      comparePriceElement.textContent = this.formatMoney(product.compareAtPrice);
    }

    const link = clone.querySelector('.product-link');
    if (link) {
      link.href = product.url;
    }

    const cartButton = clone.querySelector('[onclick*="addProductToCart"]');
    if (cartButton) {
      cartButton.setAttribute('onclick', `addProductToCart('${product.id}', 1)`);
    }

    return clone.outerHTML;
  }

  /**
   * Renderiza un producto con HTML por defecto
   */
  static renderDefaultProduct(product) {
    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image-wrapper">
          <a href="${product.url}" class="product-link">
            <img class="product-image" src="${product.images?.[0]?.url || ''}" alt="${product.name}">
          </a>
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">
            <span class="price-current">${this.formatMoney(product.price)}</span>
            ${product.compareAtPrice ? '<span class="price-compare">' + this.formatMoney(product.compareAtPrice) + '</span>' : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Formatea una cantidad de dinero usando la función global
   */
  static formatMoney(amount) {
    if (!amount) return '';
    return window.formatMoney ? window.formatMoney(amount) : amount.toString();
  }

  /**
   * Renderiza una lista de productos
   */
  static renderProducts(products) {
    if (!products || products.length === 0) {
      return '';
    }

    return products.map((product) => this.renderProduct(product)).join('');
  }

  /**
   * Reemplaza productos en el contenedor
   */
  static replaceProducts(products, container, noResultsMessage) {
    if (!container) return;

    if (!products || products.length === 0) {
      container.innerHTML = `<p class="no-products">${noResultsMessage}</p>`;
      return;
    }

    const productsHTML = this.renderProducts(products);
    container.innerHTML = productsHTML;
  }

  /**
   * Agrega productos al final del contenedor
   */
  static appendProducts(products, container) {
    if (!container || !products || products.length === 0) return;

    const productsHTML = this.renderProducts(products);
    container.insertAdjacentHTML('beforeend', productsHTML);
  }
}
