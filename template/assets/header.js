document.addEventListener('DOMContentLoaded', function() {
  const menuToggles = document.querySelectorAll('.js-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  menuToggles.forEach(function(toggle) {
    toggle.addEventListener('click', function() {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      mobileMenu.classList.toggle('is-active');
      document.body.classList.toggle('menu-open');
    });
  });

  const searchToggles = document.querySelectorAll('.js-search-toggle');
  const searchDialogOverlay = document.getElementById('search-dialog-overlay');

  searchToggles.forEach(function(toggle) {
    toggle.addEventListener('click', function() {
      if (toggle.classList.contains('search-toggle')) {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !expanded);
      }

      searchDialogOverlay.classList.toggle('is-active');
      document.body.classList.toggle('search-open');
    });
  });

  const submenuToggles = document.querySelectorAll('.mobile-submenu-toggle');

  submenuToggles.forEach(function(toggle) {
    toggle.addEventListener('click', function() {
      const parent = toggle.closest('.has-submenu');
      parent.classList.add('is-active');
    });
  });

  const backButtons = document.querySelectorAll('.mobile-submenu-back');

  backButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      const parent = button.closest('.has-submenu');
      parent.classList.remove('is-active');
    });
  });

  const header = document.getElementById('site-header');
  const scrollThreshold = 50;

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > scrollThreshold) {
      header.classList.add('is-sticky');
    } else {
      header.classList.remove('is-sticky');
    }
  });

  document.addEventListener('click', function(event) {
    const target = event.target;

    if (!target.closest('.search-dialog-content') && !target.closest('.search-toggle')) {
      const searchDialogOverlay = document.getElementById('search-dialog-overlay');
      const searchButton = document.querySelector('.search-toggle');

      if (searchDialogOverlay.classList.contains('is-active')) {
        searchDialogOverlay.classList.remove('is-active');
        document.body.classList.remove('search-open');
        if (searchButton) {
          searchButton.setAttribute('aria-expanded', 'false');
        }
      }
    }
  });

  const searchInput = document.querySelector('.search-input');
  const productsGrid = document.querySelector('.search-dialog-products-grid');
  const storeId = window.STORE_ID;

  let debounceTimeout = null;

  if (searchInput && productsGrid && storeId) {
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.trim();
      clearTimeout(debounceTimeout);

      if (query.length < 1) {
        productsGrid.innerHTML = '';
        return;
      }

      debounceTimeout = setTimeout(() => {
        // Mostrar esqueletos de carga
        let skeletonHtml = '';
        for (let i = 0; i < 4; i++) {
          skeletonHtml += `
            <div class="product-card skeleton-card">
              <div class="product-image-wrapper skeleton-image"></div>
              <div class="product-info">
                <div class="product-vendor skeleton-text skeleton-vendor"></div>
                <h3 class="product-title skeleton-text skeleton-title"></h3>
                <div class="product-price skeleton-text skeleton-price"></div>
              </div>
            </div>
          `;
        }
        productsGrid.innerHTML = skeletonHtml;

        fetch(`/api/stores/${storeId}/search?q=${encodeURIComponent(query)}&limit=${window.SEARCH_PRODUCTS_LIMIT}`)
          .then(res => res.json())
          .then(data => {
            if (data.products && data.products.length > 0) {
              productsGrid.innerHTML = data.products.map(product => {
                const hasMultipleImages = product.images && product.images.length > 1;
                const hasSingleImage = product.images && product.images.length > 0;
                const saleBadge = product.compare_at_price > product.price
                  ? `<span class="product-badge badge-sale">SAVE ${Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%</span>`
                  : '';
                const newBadge = product.tags && (product.tags.includes('new') || (new Date(product.createdAt).getTime() > (Date.now() - 2592000000)))
                  ? `<span class="product-badge badge-new">NEW</span>`
                  : '';
                const bestsellerBadge = product.tags && product.tags.includes('bestseller')
                  ? `<span class="product-badge badge-bestseller">BESTSELLER</span>`
                  : '';
                const trendingBadge = product.tags && product.tags.includes('trending')
                  ? `<span class="product-badge badge-trending">TRENDING</span>`
                  : '';

                return `
                  <div class="product-card">
                    <div class="product-image-wrapper">
                      <a href="${product.url}" class="product-link">
                        ${hasMultipleImages
                          ? `
                            <img class="product-image product-image-primary" src="${product.featured_image}" alt="${product.title}" loading="lazy">
                            <img class="product-image product-image-secondary" src="${product.images[1]}" alt="${product.title}" loading="lazy">
                            <div class="multiple-images-indicator">
                              <div class="indicator-dot active"></div>
                              <div class="indicator-dot"></div>
                              ${product.images.length > 2 ? '<div class="indicator-dot"></div>' : ''}
                            </div>
                          `
                          : hasSingleImage
                          ? `
                            <img class="product-image" src="${product.featured_image}" alt="${product.title}" loading="lazy">
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
                      <div class="product-badges">
                        ${newBadge}
                        ${bestsellerBadge}
                        ${trendingBadge}
                        ${saleBadge}
                      </div>
                    </div>
                    <div class="product-info">
                      <div class="product-vendor">${product.vendor ? product.vendor.toUpperCase() : ''}</div>
                      <h3 class="product-title">${product.title}</h3>
                      <div class="product-price">
                        ${product.compare_at_price > product.price
                          ? `
                            <span class="price-compare">${window.formatMoney(product.compare_at_price)}</span>
                            <span class="price-current price-sale">${window.formatMoney(product.price)}</span>
                          `
                          : `<span class="price-current">${window.formatMoney(product.price)}</span>`
                        }
                      </div>
                    </div>
                  </div>
                `;
              }).join('');
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

  const cartCountElement = document.querySelector('[data-cart-count]');

  if (cartCountElement) {
    document.addEventListener('cart:updated', function(event) {
      const cart = event.detail.cart;
      if (cart && typeof cart.item_count !== 'undefined') {
        cartCountElement.textContent = cart.item_count;
      }
    });

    if (window.sideCart) {
      window.sideCart.refresh().then(() => {
      }).catch(error => {
        console.error('Error refreshing cart on header load:', error);
      });
    }
  }
});
