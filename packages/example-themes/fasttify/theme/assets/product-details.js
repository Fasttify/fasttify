// Product Details JavaScript
// Este archivo espera que las siguientes variables globales estén definidas:
// - window.PRODUCT_IMAGES: Array de URLs de imágenes
// - window.PRODUCT_ID: ID del producto

class ProductDetails {
  constructor() {
    this.modalCurrentImageIndex = 0;
    this.currentProductImageIndex = 0;
    this.productImages = window.PRODUCT_IMAGES || [];
    this.productId = window.PRODUCT_ID;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateProductCarouselImage();
  }

  setupEventListeners() {
    // Touch events for mobile carousel
    const productCarousel = document.querySelector('.product-images-mobile-view .product-image-carousel');
    if (productCarousel) {
      let touchStartX = 0;
      let touchStartY = 0;
      let touchEndX = 0;
      let touchEndY = 0;

      productCarousel.addEventListener('touchstart', (event) => {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      });

      productCarousel.addEventListener(
        'touchmove',
        (event) => {
          event.preventDefault();
        },
        { passive: false }
      );

      productCarousel.addEventListener('touchend', (event) => {
        touchEndX = event.changedTouches[0].clientX;
        touchEndY = event.changedTouches[0].clientY;

        const swipeThreshold = 50;
        const tapThreshold = 10;
        const distanceX = touchStartX - touchEndX;
        const distanceY = touchStartY - touchEndY;
        const totalMovement = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (Math.abs(distanceX) > swipeThreshold && Math.abs(distanceX) > Math.abs(distanceY)) {
          if (distanceX > 0) {
            this.changeProductImage(1);
          } else {
            this.changeProductImage(-1);
          }
          event.preventDefault();
          event.stopPropagation();
        } else if (totalMovement < tapThreshold) {
          this.openImageModal(this.currentProductImageIndex);
          event.preventDefault();
          event.stopPropagation();
        }
        touchStartX = 0;
        touchStartY = 0;
        touchEndX = 0;
        touchEndY = 0;
      });

      // Event listener for opening modal from carousel image
      const carouselImage = productCarousel.querySelector('.product__main-image-carousel-item');
      if (carouselImage) {
        carouselImage.addEventListener('click', () => {
          this.openImageModal(this.currentProductImageIndex);
        });
      }
    }
  }

  // Attribute selection
  selectOption(element) {
    // Remove selected class from siblings (with null check)
    if (element.parentNode) {
      const siblings = Array.from(element.parentNode.children);
      siblings.forEach((sibling) => {
        if (sibling.classList.contains('attribute-value-item') || sibling.classList.contains('color-swatch')) {
          sibling.classList.remove('selected');
        }
      });
    }

    // Add selected class to clicked element
    element.classList.add('selected');
  }

  // Quantity controls
  updateQuantity(change) {
    const quantityInput = document.getElementById('product-quantity');
    let currentQuantity = parseInt(quantityInput.value);
    currentQuantity += change;
    if (currentQuantity < 1) {
      currentQuantity = 1;
    }
    quantityInput.value = currentQuantity;
  }

  // Image modal functions
  openImageModal(index) {
    this.modalCurrentImageIndex = index;
    const modal = document.getElementById('productImageModal');
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('is-open');
    }, 10);
    this.updateModalImage();
  }

  closeImageModal() {
    const modal = document.getElementById('productImageModal');
    modal.classList.remove('is-open');
    modal.addEventListener(
      'transitionend',
      function handler() {
        modal.style.display = 'none';
        modal.removeEventListener('transitionend', handler);
      },
      { once: true }
    );
  }

  updateModalImage() {
    const modalImage = document.querySelector('#productImageModal .modal-product-image');
    const imageCounter = document.querySelector('#productImageModal .image-counter');

    if (this.productImages.length > 0) {
      modalImage.src = this.productImages[this.modalCurrentImageIndex];
      imageCounter.textContent = `${this.modalCurrentImageIndex + 1}/${this.productImages.length}`;
    } else {
      modalImage.src = '';
      imageCounter.textContent = '0/0';
    }
  }

  changeImage(direction) {
    this.modalCurrentImageIndex += direction;
    if (this.modalCurrentImageIndex < 0) {
      this.modalCurrentImageIndex = this.productImages.length - 1;
    } else if (this.modalCurrentImageIndex >= this.productImages.length) {
      this.modalCurrentImageIndex = 0;
    }
    this.updateModalImage();
  }

  // Mobile carousel functions
  updateProductCarouselImage() {
    const carouselTrack = document.querySelector('.product-images-mobile-view .carousel-track');
    const counter = document.querySelector('.product-images-mobile-view .carousel-counter');

    if (this.productImages.length > 0) {
      carouselTrack.style.transform = `translateX(-${this.currentProductImageIndex * 100}%)`;
      counter.textContent = `${this.currentProductImageIndex + 1}/${this.productImages.length}`;
    } else {
      carouselTrack.style.transform = 'translateX(0)';
      counter.textContent = '0/0';
    }
  }

  changeProductImage(direction) {
    this.currentProductImageIndex += direction;
    if (this.currentProductImageIndex < 0) {
      this.currentProductImageIndex = this.productImages.length - 1;
    } else if (this.currentProductImageIndex >= this.productImages.length) {
      this.currentProductImageIndex = 0;
    }
    this.updateProductCarouselImage();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  // Make functions globally available for onclick attributes
  window.selectOption = function (element) {
    window.productDetails.selectOption(element);
  };

  window.updateQuantity = function (change) {
    window.productDetails.updateQuantity(change);
  };

  window.openImageModal = function (index) {
    window.productDetails.openImageModal(index);
  };

  window.closeImageModal = function () {
    window.productDetails.closeImageModal();
  };

  window.changeImage = function (direction) {
    window.productDetails.changeImage(direction);
  };

  // Initialize the product details
  window.productDetails = new ProductDetails();
});
