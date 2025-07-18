document.addEventListener('DOMContentLoaded', function() {
  // Menu toggle
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

  // Search toggle
  const searchToggles = document.querySelectorAll('.js-search-toggle');
  const searchDialogOverlay = document.getElementById('search-dialog-overlay');

  searchToggles.forEach(function(toggle) {
    toggle.addEventListener('click', function() {
      // Toggle aria-expanded for the search icon button itself
      if (toggle.classList.contains('search-toggle')) {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !expanded);
      }

      searchDialogOverlay.classList.toggle('is-active');
      document.body.classList.toggle('search-open');
    });
  });

  // Mobile submenu
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

  // Make header sticky on scroll
  const header = document.getElementById('site-header');
  const scrollThreshold = 50; // Define el umbral de scroll para activar el efecto

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > scrollThreshold) {
      header.classList.add('is-sticky');
    } else {
      header.classList.remove('is-sticky');
    }
  });

  // Close dialog when clicking outside
  document.addEventListener('click', function(event) {
    const target = event.target;

    // Close search dialog if click outside the dialog content and not on the search toggle button
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

  // Search functionality
  const searchInput = document.querySelector('.search-input');
  const productsGrid = document.querySelector('.search-dialog-products-grid');
  const storeId = window.STORE_ID; // Esta variable la definiremos desde Liquid

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
        productsGrid.innerHTML = '<div class="loader">Buscando...</div>';
        fetch(`/api/stores/${storeId}/search?q=${encodeURIComponent(query)}&limit=${window.SEARCH_PRODUCTS_LIMIT}`)
          .then(res => res.json())
          .then(data => {
            if (data.products && data.products.length > 0) {
              productsGrid.innerHTML = data.products.map(product => `
                <div class="product-card-placeholder">
                  <img src="${product.featured_image}" alt="${product.title}" loading="lazy">
                  <a href="${product.url}" class="product-card-link">
                    <h3>${product.title}</h3>
                    <p>${product.price}</p>
                  </a>
                </div>
              `).join('');
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
