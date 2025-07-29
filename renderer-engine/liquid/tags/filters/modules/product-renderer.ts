export class ProductRenderer {
  private productGridSelector: string;
  private noResultsMessage: string;

  constructor(productGridSelector: string, noResultsMessage: string) {
    this.productGridSelector = productGridSelector;
    this.noResultsMessage = noResultsMessage;
  }

  replaceExistingProducts(products: any[]): void {
    // Buscar el contenedor de productos usando el selector personalizable
    const existingGrid = document.querySelector(this.productGridSelector);

    if (!existingGrid) {
      console.warn('not found ' + this.productGridSelector + ', creating container');
      this.fallbackRenderProducts(products);
      return;
    }

    if (!products || products.length === 0) {
      existingGrid.innerHTML = '<div class="grid__item--full"><p>' + this.noResultsMessage + '</p></div>';
      return;
    }

    let html = '';
    products.forEach((product) => {
      html += this.renderProductCard(product);
    });

    existingGrid.innerHTML = html;
  }

  fallbackRenderProducts(products: any[]): void {
    const container = document.createElement('div');
    container.className = this.productGridSelector.replace('.', '');

    if (!products || products.length === 0) {
      container.innerHTML = '<div class="grid__item--full"><p>' + this.noResultsMessage + '</p></div>';
    } else {
      let html = '';
      products.forEach((product) => {
        html += this.renderProductCard(product);
      });
      container.innerHTML = html;
    }

    // Insertar después de los filtros
    const filtersContainer = document.querySelector('.auto-filters');
    if (filtersContainer && filtersContainer.parentNode) {
      filtersContainer.parentNode.insertBefore(container, filtersContainer.nextSibling);
    }
  }

  renderProductCard(product: any): string {
    // Renderer por defecto (siempre usar el por defecto para este caso)
    const price = product.price; // Sin formatear, se formatea en el template
    const comparePrice = product.compareAtPrice || null;
    const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
    const imageUrl = images && images.length > 0 ? images[0].url || images[0] : '';
    const hasMultipleImages = images && images.length > 1;
    const secondImageUrl = hasMultipleImages ? images[1].url || images[1] : '';

    // Calcular descuento si hay precio de comparación
    const discountPercent =
      comparePrice && product.compareAtPrice > product.price
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : 0;

    return `
      <div class="product-card">
        <div class="product-image-wrapper">
          <a href="/products/${product.slug || product.id}" class="product-link">
            ${
              imageUrl
                ? `
              ${
                hasMultipleImages
                  ? `
                <img class="product-image product-image-primary" src="${imageUrl}" alt="${product.name}" loading="lazy">
                <img class="product-image product-image-secondary" src="${secondImageUrl}" alt="${product.name}" loading="lazy">
                <div class="multiple-images-indicator">
                  <div class="indicator-dot active"></div>
                  <div class="indicator-dot"></div>
                  ${images.length > 2 ? '<div class="indicator-dot"></div>' : ''}
                </div>
              `
                  : `
                <img class="product-image" src="${imageUrl}" alt="${product.name}" loading="lazy">
              `
              }
            `
                : `
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
            `
            }
          </a>

          ${
            discountPercent
              ? `
            <div class="product-badges">
              <span class="product-badge badge-sale">SAVE ${discountPercent}%</span>
            </div>
          `
              : ''
          }

          <div class="product-overlay">
            <div class="product-overlay-content">
              <a href="/products/${product.slug || product.id}" class="product-btn product-btn-primary">
                <span>VER PRODUCTO</span>
              </a>
              <button class="product-btn product-btn-secondary"
                      onclick="addProductToCart('${product.id}', 1)"
                      aria-label="Añadir al carrito"
                      ${product.quantity === 0 ? 'disabled' : ''}>
                <span>AÑADIR AL CARRITO</span>
              </button>
            </div>
          </div>
        </div>

        <div class="product-info">
          <div class="product-vendor">${(product.vendor || product.supplier || '').toUpperCase()}</div>
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">
            ${
              comparePrice
                ? `
              <span class="price-compare">${this.formatMoney(comparePrice)}</span>
              <span class="price-current price-sale">${this.formatMoney(price)}</span>
            `
                : `
              <span class="price-current">${this.formatMoney(price)}</span>
            `
            }
          </div>
        </div>
      </div>
    `;
  }

  private formatMoney(amount: number): string {
    // Usar la función global formatMoney que ya está configurada en el tema
    if (typeof window !== 'undefined' && (window as any).formatMoney) {
      return (window as any).formatMoney(amount);
    }

    // Fallback simple si no está disponible
    if (!amount) return '$0';
    return (
      '$' +
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount)
    );
  }

  static generateScript(): string {
    return `
      replaceExistingProducts(products) {
        // Buscar el contenedor de productos usando el selector personalizable
        const existingGrid = document.querySelector(this.productGridSelector);

        if (!existingGrid) {
          console.warn('No se encontró ' + this.productGridSelector + ', creando contenedor');
          this.fallbackRenderProducts(products);
          return;
        }

        if (!products || products.length === 0) {
          existingGrid.innerHTML = '<div class="grid__item--full"><p>' + this.noResultsMessage + '</p></div>';
          return;
        }

        let html = '';
        products.forEach(product => {
          html += this.renderProductCard(product);
        });

        existingGrid.innerHTML = html;
      }

      fallbackRenderProducts(products) {
        const container = document.createElement('div');
        container.className = this.productGridSelector.replace('.', '');

        if (!products || products.length === 0) {
          container.innerHTML = '<div class="grid__item--full"><p>' + this.noResultsMessage + '</p></div>';
        } else {
          let html = '';
          products.forEach(product => {
            html += this.renderProductCard(product);
          });
          container.innerHTML = html;
        }

        // Insertar después de los filtros
        this.container.parentNode.insertBefore(container, this.container.nextSibling);
      }

      renderProductCard(product) {
        // Renderer por defecto (siempre usar el por defecto para este caso)
        const price = product.price; // Sin formatear, se formatea en el template
        const comparePrice = product.compareAtPrice || null;
        const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
        const imageUrl = images && images.length > 0 ? images[0].url || images[0] : '';
        const hasMultipleImages = images && images.length > 1;
        const secondImageUrl = hasMultipleImages ? (images[1].url || images[1]) : '';

        // Calcular descuento si hay precio de comparación
        const discountPercent = comparePrice && product.compareAtPrice > product.price ?
          Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;

        return \`
          <div class="product-card">
            <div class="product-image-wrapper">
              <a href="/products/\${product.slug || product.id}" class="product-link">
                \${imageUrl ? \`
                  \${hasMultipleImages ? \`
                    <img class="product-image product-image-primary" src="\${imageUrl}" alt="\${product.name}" loading="lazy">
                    <img class="product-image product-image-secondary" src="\${secondImageUrl}" alt="\${product.name}" loading="lazy">
                    <div class="multiple-images-indicator">
                      <div class="indicator-dot active"></div>
                      <div class="indicator-dot"></div>
                      \${images.length > 2 ? '<div class="indicator-dot"></div>' : ''}
                    </div>
                  \` : \`
                    <img class="product-image" src="\${imageUrl}" alt="\${product.name}" loading="lazy">
                  \`}
                \` : \`
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
                \`}
              </a>

              \${discountPercent ? \`
                <div class="product-badges">
                  <span class="product-badge badge-sale">SAVE \${discountPercent}%</span>
                </div>
              \` : ''}

              <div class="product-overlay">
                <div class="product-overlay-content">
                  <a href="/products/\${product.slug || product.id}" class="product-btn product-btn-primary">
                    <span>VER PRODUCTO</span>
                  </a>
                  <button class="product-btn product-btn-secondary"
                          onclick="addProductToCart('\${product.id}', 1)"
                          aria-label="Añadir al carrito"
                          \${product.quantity === 0 ? 'disabled' : ''}>
                    <span>AÑADIR AL CARRITO</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="product-info">
              <div class="product-vendor">\${(product.vendor || product.supplier || '').toUpperCase()}</div>
              <h3 class="product-title">\${product.name}</h3>
              <div class="product-price">
                \${comparePrice ? \`
                  <span class="price-compare">\${window.formatMoney(comparePrice)}</span>
                  <span class="price-current price-sale">\${window.formatMoney(price)}</span>
                \` : \`
                  <span class="price-current">\${window.formatMoney(price)}</span>
                \`}
              </div>
            </div>
          </div>
        \`;
      }
    `;
  }
}
