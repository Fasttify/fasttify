/**
 * Cart API Module
 * Maneja todas las operaciones de API relacionadas con el carrito
 */

class CartAPI {
  constructor() {
    this.baseURL = '/api/stores';
  }

  getStoreId() {
    const storeId = window.STORE_ID;
    if (!storeId) {
      throw new Error('Store ID is not defined.');
    }
    return storeId;
  }

  async makeRequest(endpoint, options = {}) {
    const storeId = this.getStoreId();
    const url = `${this.baseURL}/${storeId}/cart${endpoint}`;

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    return response.json();
  }

  async getCart() {
    return this.makeRequest('');
  }

  async addToCart(productId, quantity = 1, selectedAttributes = {}) {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        quantity,
        selectedAttributes,
      }),
    });
  }

  async updateCartItem(itemId, quantity) {
    return this.makeRequest('', {
      method: 'PATCH',
      body: JSON.stringify({ itemId, quantity }),
    });
  }

  async removeCartItem(itemId) {
    return this.updateCartItem(itemId, 0);
  }

  async clearCart() {
    return this.makeRequest('', {
      method: 'DELETE',
    });
  }
}

// Exportar instancia global
window.cartAPI = new CartAPI();
