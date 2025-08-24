export function formatCurrency(amount: number, currency: string = 'COP'): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'Fecha inválida';
  }
}

export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };
  return statusMap[status] || status;
}

export function getStatusTone(status: string): 'success' | 'info' | 'warning' | 'critical' {
  const toneMap: Record<string, 'success' | 'info' | 'warning' | 'critical'> = {
    pending: 'warning',
    processing: 'info',
    shipped: 'success',
    delivered: 'success',
    cancelled: 'critical',
  };
  return toneMap[status] || 'info';
}

export function getPaymentStatusText(paymentStatus: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    failed: 'Fallido',
    refunded: 'Reembolsado',
  };
  return statusMap[paymentStatus] || paymentStatus;
}

export function getPaymentStatusTone(paymentStatus: string): 'success' | 'info' | 'warning' | 'critical' {
  const toneMap: Record<string, 'success' | 'info' | 'warning' | 'critical'> = {
    pending: 'warning',
    paid: 'success',
    failed: 'critical',
    refunded: 'info',
  };
  return toneMap[paymentStatus] || 'info';
}

export function getCustomerName(customerInfo: any): string {
  if (!customerInfo) return 'Cliente anónimo';

  try {
    if (typeof customerInfo === 'string') {
      const parsed = JSON.parse(customerInfo);
      return parsed.firstName && parsed.lastName
        ? `${parsed.firstName} ${parsed.lastName}`
        : parsed.email || 'Cliente anónimo';
    }

    if (customerInfo.firstName && customerInfo.lastName) {
      return `${customerInfo.firstName} ${customerInfo.lastName}`;
    }

    return customerInfo.email || 'Cliente anónimo';
  } catch {
    return 'Cliente anónimo';
  }
}

export function getCustomerEmail(customerInfo: any): string {
  if (!customerInfo) return 'N/A';

  try {
    if (typeof customerInfo === 'string') {
      const parsed = JSON.parse(customerInfo);
      return parsed.email || 'N/A';
    }

    return customerInfo.email || 'N/A';
  } catch {
    return 'N/A';
  }
}

export function getCustomerPhone(customerInfo: any): string {
  if (!customerInfo) return '';

  try {
    if (typeof customerInfo === 'string') {
      const parsed = JSON.parse(customerInfo);
      return parsed.phone || '';
    }

    return customerInfo.phone || '';
  } catch {
    return '';
  }
}

/**
 * Función auxiliar para extraer los items de la estructura anidada
 */
function extractOrderItems(items: any): any[] {
  if (!items) return [];

  try {
    // Nueva estructura: order.items.items[] (array directo)
    if (items.items && Array.isArray(items.items)) {
      return items.items;
    }

    // Si es directamente un array
    if (Array.isArray(items)) {
      return items;
    }

    // Si por alguna razón viene como string JSON
    if (typeof items === 'string') {
      const parsed = JSON.parse(items);
      return extractOrderItems(parsed);
    }

    return [];
  } catch {
    return [];
  }
}

export function getItemsCount(items: any): number {
  const orderItems = extractOrderItems(items);
  return orderItems.length;
}

/**
 * Obtiene el total de artículos (suma de cantidades) de una orden
 */
export function getTotalItemsCount(items: any): number {
  const orderItems = extractOrderItems(items);
  return orderItems.reduce((total, item) => total + (item.quantity || 0), 0);
}

/**
 * Obtiene los items de una orden de forma segura
 */
export function getOrderItems(items: any): any[] {
  return extractOrderItems(items);
}

/**
 * Obtiene el snapshot del producto de un item
 */
export function getProductSnapshot(item: any): any {
  if (!item || !item.productSnapshot) return null;

  try {
    if (typeof item.productSnapshot === 'string') {
      return JSON.parse(item.productSnapshot);
    }
    return item.productSnapshot;
  } catch {
    return null;
  }
}

/**
 * Obtiene el título del producto de un item
 */
export function getProductTitle(item: any): string {
  const snapshot = getProductSnapshot(item);
  return snapshot?.title || 'Producto sin nombre';
}

/**
 * Obtiene la imagen del producto de un item
 */
export function getProductImage(item: any): string {
  const snapshot = getProductSnapshot(item);
  return snapshot?.image || '';
}

/**
 * Obtiene el precio unitario de un item
 */
export function getItemUnitPrice(item: any): number {
  return item?.unitPrice || 0;
}

/**
 * Obtiene el precio total de un item
 */
export function getItemTotalPrice(item: any): number {
  return item?.totalPrice || 0;
}

/**
 * Obtiene la cantidad de un item
 */
export function getItemQuantity(item: any): number {
  return item?.quantity || 0;
}
