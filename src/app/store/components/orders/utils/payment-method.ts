export function getPaymentMethodText(method: string | null | undefined) {
  if (!method) return 'No especificado';
  const map: Record<string, string> = {
    Manual: 'Pago Manual',
    CreditCard: 'Tarjeta de Crédito',
    DebitCard: 'Tarjeta de Débito',
    PayPal: 'PayPal',
    Stripe: 'Stripe',
    MercadoPago: 'MercadoPago',
    Cash: 'Efectivo',
    BankTransfer: 'Transferencia Bancaria',
  };
  return map[method] || method;
}
