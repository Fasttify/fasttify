/**
 * Cart Helpers Module
 * Funciones auxiliares para el carrito
 */

class CartHelpers {
  static formatMoney(amount) {
    return window.formatMoney ? window.formatMoney(amount) : `$${amount}`;
  }

  static getSelectedAttributes() {
    const selectedAttributes = {};
    const selectedOptions = document.querySelectorAll(
      '.product-option-group .selected, .attribute-values-list .selected'
    );

    selectedOptions.forEach((option) => {
      const optionName = option.dataset.optionName;
      const optionValue = option.dataset.optionValue;
      if (optionName && optionValue) {
        selectedAttributes[optionName] = optionValue;
      }
    });

    return selectedAttributes;
  }

  static capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static showError(message) {
    console.error(message);
    alert(message);
  }

  static showSuccess(message) {
    // Aquí podrías implementar un toast o notificación
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Exportar como global
window.CartHelpers = CartHelpers;
