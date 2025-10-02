/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Renderizador de productos para el sistema de filtros
 * Usa el template existente de la tienda para mantener la personalización
 */
export class ProductRenderer {
  static templateManager = null;

  /**
   * Inicializa el renderizador con el template manager
   */
  static async init(storeId) {
    if (!this.templateManager) {
      const { TemplateManager } = await import('./template-manager.js');
      this.templateManager = new TemplateManager(storeId);
      await this.templateManager.loadCustomTemplate();
    }
  }

  /**
   * Renderiza un producto individual usando el template existente
   */
  static renderProduct(product) {
    if (this.templateManager) {
      return this.templateManager.renderProduct(product);
    }

    const existingProduct = document.querySelector('.product-card');
    if (existingProduct) {
      return this.renderFromTemplate(existingProduct, product);
    }

    return this.createBasicTemplate(product);
  }

  /**
   * Renderiza un producto basado en el template existente de la tienda
   */
  static renderFromTemplate(template, product) {
    const clone = template.cloneNode(true);

    // Actualizar ID del producto
    clone.setAttribute('data-product-id', product.id);

    // Actualizar imágenes
    this.updateProductImages(clone, product);

    // Actualizar información del producto
    this.updateProductInfo(clone, product);

    // Actualizar badges
    this.updateProductBadges(clone, product);

    // Actualizar overlay y botones
    this.updateProductOverlay(clone, product);

    // Actualizar atributos
    this.updateProductAttributes(clone, product);

    return clone.outerHTML;
  }

  /**
   * Actualiza las imágenes del producto manteniendo la estructura existente
   */
  static updateProductImages(clone, product) {
    const imageWrapper = clone.querySelector('.product-image-wrapper');
    if (!imageWrapper) return;

    const link = imageWrapper.querySelector('.product-link');
    if (!link) return;

    // Limpiar imágenes existentes
    const existingImages = link.querySelectorAll(
      '.product-image, .product-image-primary, .product-image-secondary, .multiple-images-indicator, .product-placeholder'
    );
    existingImages.forEach((img) => img.remove());

    if (product.images && product.images.length > 1) {
      // Múltiples imágenes
      const primaryImage = document.createElement('img');
      primaryImage.className = 'product-image product-image-primary';
      primaryImage.src = product.images[0]?.url || '';
      primaryImage.alt = product.name;
      primaryImage.loading = 'lazy';
      link.appendChild(primaryImage);

      const secondaryImage = document.createElement('img');
      secondaryImage.className = 'product-image product-image-secondary';
      secondaryImage.src = product.images[1]?.url || '';
      secondaryImage.alt = product.name;
      secondaryImage.loading = 'lazy';
      link.appendChild(secondaryImage);

      // Indicador de múltiples imágenes
      const indicator = document.createElement('div');
      indicator.className = 'multiple-images-indicator';

      const dot1 = document.createElement('div');
      dot1.className = 'indicator-dot active';
      indicator.appendChild(dot1);

      const dot2 = document.createElement('div');
      dot2.className = 'indicator-dot';
      indicator.appendChild(dot2);

      if (product.images.length > 2) {
        const dot3 = document.createElement('div');
        dot3.className = 'indicator-dot';
        indicator.appendChild(dot3);
      }

      link.appendChild(indicator);
    } else if (product.images && product.images.length > 0) {
      // Una sola imagen
      const image = document.createElement('img');
      image.className = 'product-image';
      image.src = product.images[0]?.url || '';
      image.alt = product.name;
      image.loading = 'lazy';
      link.appendChild(image);
    } else {
      // Placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'product-placeholder';
      placeholder.innerHTML = `
        <div class="placeholder-content">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
          <p>Imagen del producto</p>
        </div>
      `;
      link.appendChild(placeholder);
    }
  }

  /**
   * Actualiza la información del producto
   */
  static updateProductInfo(clone, product) {
    const productInfo = clone.querySelector('.product-info');
    if (!productInfo) return;

    // Vendor
    const vendorElement = productInfo.querySelector('.product-vendor');
    if (vendorElement && product.vendor) {
      vendorElement.textContent = product.vendor.toUpperCase();
    }

    // Título
    const titleElement = productInfo.querySelector('.product-title');
    if (titleElement) {
      titleElement.textContent = product.name;
    }

    // Precio
    const priceElement = productInfo.querySelector('.product-price');
    if (priceElement) {
      if (product.compareAtPrice && product.compareAtPrice > product.price) {
        const discountPercent = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
        priceElement.innerHTML = `
          <span class="price-compare">${this.formatMoney(product.compareAtPrice)}</span>
          <span class="price-current price-sale">${this.formatMoney(product.price)}</span>
        `;
      } else {
        priceElement.innerHTML = `<span class="price-current">${this.formatMoney(product.price)}</span>`;
      }
    }
  }

  /**
   * Actualiza los badges del producto
   */
  static updateProductBadges(clone, product) {
    const badgesContainer = clone.querySelector('.product-badges');
    if (!badgesContainer) return;

    badgesContainer.innerHTML = '';

    // Badge NEW
    const createdAt = new Date(product.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tags = this.parseTags(product.tags);

    if (tags.includes('new') || createdAt > thirtyDaysAgo) {
      const newBadge = document.createElement('span');
      newBadge.className = 'product-badge badge-new';
      newBadge.textContent = 'NEW';
      badgesContainer.appendChild(newBadge);
    }

    // Badge BESTSELLER
    if (tags.includes('bestseller')) {
      const bestsellerBadge = document.createElement('span');
      bestsellerBadge.className = 'product-badge badge-bestseller';
      bestsellerBadge.textContent = 'BESTSELLER';
      badgesContainer.appendChild(bestsellerBadge);
    }

    // Badge TRENDING
    if (tags.includes('trending')) {
      const trendingBadge = document.createElement('span');
      trendingBadge.className = 'product-badge badge-trending';
      trendingBadge.textContent = 'TRENDING';
      badgesContainer.appendChild(trendingBadge);
    }

    // Badge SAVE %
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      const discountPercent = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
      const saveBadge = document.createElement('span');
      saveBadge.className = 'product-badge badge-sale';
      saveBadge.textContent = `SAVE ${discountPercent}%`;
      badgesContainer.appendChild(saveBadge);
    }
  }

  /**
   * Actualiza el overlay del producto
   */
  static updateProductOverlay(clone, product) {
    const overlay = clone.querySelector('.product-overlay');
    if (!overlay) return;

    const overlayContent = overlay.querySelector('.product-overlay-content');
    if (!overlayContent) return;

    // Botón VER PRODUCTO
    const viewButton = overlayContent.querySelector('.product-btn-primary');
    if (viewButton) {
      const link = viewButton.querySelector('a') || viewButton;
      link.href = product.url || `/products/${product.id}`;
    }

    // Botón AÑADIR AL CARRITO
    const cartButton = overlayContent.querySelector('.product-btn-secondary');
    if (cartButton) {
      cartButton.onclick = () => {
        if (window.addProductToCart) {
          window.addProductToCart(product.id, 1);
        }
      };
    }
  }

  /**
   * Actualiza los atributos del producto
   */
  static updateProductAttributes(clone, product) {
    const attributesContainer = clone.querySelector('.product-attributes-summary');
    if (!attributesContainer || !product.attributes) return;

    attributesContainer.innerHTML = '';

    product.attributes.forEach((attribute) => {
      const attributeDisplay = document.createElement('div');
      attributeDisplay.className = `attribute-display attribute-display--${attribute.name.toLowerCase().replace(/\s+/g, '-')}`;

      const valuesList = document.createElement('div');
      valuesList.className = 'attribute-values-list';

      if (attribute.name.toLowerCase() === 'color') {
        // Renderizar colores como swatches
        attribute.values.slice(0, 4).forEach((value) => {
          const swatch = document.createElement('span');
          swatch.className = 'color-swatch';
          swatch.style.backgroundColor = value.toLowerCase();
          swatch.title = value;
          valuesList.appendChild(swatch);
        });

        if (attribute.values.length > 4) {
          const moreIndicator = document.createElement('span');
          moreIndicator.className = 'attribute-more';
          moreIndicator.textContent = `+${attribute.values.length - 4}`;
          valuesList.appendChild(moreIndicator);
        }
      } else {
        // Renderizar otros atributos como texto
        attribute.values.slice(0, 3).forEach((value) => {
          const valueItem = document.createElement('span');
          valueItem.className = 'attribute-value-item';
          valueItem.textContent = value;
          valuesList.appendChild(valueItem);
        });

        if (attribute.values.length > 3) {
          const moreIndicator = document.createElement('span');
          moreIndicator.className = 'attribute-more';
          moreIndicator.textContent = `+${attribute.values.length - 3}`;
          valuesList.appendChild(moreIndicator);
        }
      }

      attributeDisplay.appendChild(valuesList);
      attributesContainer.appendChild(attributeDisplay);
    });
  }

  /**
   * Crea un template básico pero extensible para cuando no hay template existente
   */
  static createBasicTemplate(product) {
    const hasComparePrice = product.compareAtPrice && product.compareAtPrice > product.price;
    const discountPercent = hasComparePrice
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

    // Determinar badges
    const badges = [];
    const createdAt = new Date(product.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tags = this.parseTags(product.tags);

    if (tags.includes('new') || createdAt > thirtyDaysAgo) {
      badges.push('<span class="product-badge badge-new">NEW</span>');
    }
    if (tags.includes('bestseller')) {
      badges.push('<span class="product-badge badge-bestseller">BESTSELLER</span>');
    }
    if (tags.includes('trending')) {
      badges.push('<span class="product-badge badge-trending">TRENDING</span>');
    }
    if (hasComparePrice) {
      badges.push(`<span class="product-badge badge-sale">SAVE ${discountPercent}%</span>`);
    }

    // Generar imágenes
    let imagesHTML = '';
    if (product.images && product.images.length > 1) {
      imagesHTML = `
        <img class="product-image product-image-primary" src="${product.images[0]?.url || ''}" alt="${product.name}" loading="lazy">
        <img class="product-image product-image-secondary" src="${product.images[1]?.url || ''}" alt="${product.name}" loading="lazy">
        <div class="multiple-images-indicator">
          <div class="indicator-dot active"></div>
          <div class="indicator-dot"></div>
          ${product.images.length > 2 ? '<div class="indicator-dot"></div>' : ''}
        </div>
      `;
    } else if (product.images && product.images.length > 0) {
      imagesHTML = `<img class="product-image" src="${product.images[0]?.url || ''}" alt="${product.name}" loading="lazy">`;
    } else {
      imagesHTML = `
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

    // Generar atributos
    let attributesHTML = '';
    if (product.attributes && product.attributes.length > 0) {
      attributesHTML = '<div class="product-attributes-summary">';
      product.attributes.forEach((attribute) => {
        attributesHTML += `
          <div class="attribute-display attribute-display--${attribute.name.toLowerCase().replace(/\s+/g, '-')}">
            <div class="attribute-values-list">
        `;

        if (attribute.name.toLowerCase() === 'color') {
          attribute.values.slice(0, 4).forEach((value) => {
            attributesHTML += `<span class="color-swatch" style="background-color: ${value.toLowerCase()};" title="${value}"></span>`;
          });
          if (attribute.values.length > 4) {
            attributesHTML += `<span class="attribute-more">+${attribute.values.length - 4}</span>`;
          }
        } else {
          attribute.values.slice(0, 3).forEach((value) => {
            attributesHTML += `<span class="attribute-value-item">${value}</span>`;
          });
          if (attribute.values.length > 3) {
            attributesHTML += `<span class="attribute-more">+${attribute.values.length - 3}</span>`;
          }
        }

        attributesHTML += `
            </div>
          </div>
        `;
      });
      attributesHTML += '</div>';
    }

    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image-wrapper">
          <a href="${product.url || `/products/${product.id}`}" class="product-link">
            ${imagesHTML}
          </a>

          <div class="product-badges">
            ${badges.join('')}
          </div>

          <div class="product-overlay">
            <div class="product-overlay-content">
              <a href="${product.url || `/products/${product.id}`}" class="product-btn product-btn-primary">
                <span>VER PRODUCTO</span>
              </a>

              <button class="product-btn product-btn-secondary" onclick="addProductToCart('${product.id}', 1)" aria-label="Añadir al carrito">
                <span>AÑADIR AL CARRITO</span>
              </button>
            </div>
          </div>
        </div>

        <div class="product-info">
          <div class="product-vendor">${product.vendor ? product.vendor.toUpperCase() : ''}</div>
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">
            ${
              hasComparePrice
                ? `<span class="price-compare">${this.formatMoney(product.compareAtPrice)}</span>
               <span class="price-current price-sale">${this.formatMoney(product.price)}</span>`
                : `<span class="price-current">${this.formatMoney(product.price)}</span>`
            }
          </div>
          ${attributesHTML}
        </div>
      </div>
    `;
  }

  /**
   * Parsea tags desde string o array
   */
  static parseTags(tags) {
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
