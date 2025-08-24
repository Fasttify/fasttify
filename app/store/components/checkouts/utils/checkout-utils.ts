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

export function formatExpiryDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expirado';
    } else if (diffDays === 0) {
      return 'Expira hoy';
    } else if (diffDays === 1) {
      return 'Expira mañana';
    } else if (diffDays < 7) {
      return `Expira en ${diffDays} días`;
    } else {
      return formatDate(dateString);
    }
  } catch {
    return 'Fecha inválida';
  }
}

export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    open: 'Abierto',
    completed: 'Completado',
    expired: 'Expirado',
    cancelled: 'Cancelado',
  };
  return statusMap[status] || status;
}

export function getStatusTone(status: string): 'success' | 'info' | 'warning' | 'critical' {
  const toneMap: Record<string, 'success' | 'info' | 'warning' | 'critical'> = {
    open: 'info',
    completed: 'success',
    expired: 'warning',
    cancelled: 'critical',
  };
  return toneMap[status] || 'info';
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

export function getItemsCount(itemsSnapshot: any): number {
  if (!itemsSnapshot) return 0;

  try {
    if (typeof itemsSnapshot === 'string') {
      const parsed = JSON.parse(itemsSnapshot);
      return parsed.itemCount || 0;
    }

    return itemsSnapshot.itemCount || 0;
  } catch {
    return 0;
  }
}
