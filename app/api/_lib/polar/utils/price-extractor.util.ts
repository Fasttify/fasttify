/**
 * Utilidad para extraer precios de los payloads de Polar
 * Centraliza la lógica de extracción de precios para evitar duplicación
 */

/**
 * Extrae el precio del plan desde los datos de Polar
 * Busca en múltiples ubicaciones basándose en los payloads reales de Polar
 */
export function extractPlanPrice(polarData: any): number | undefined {
  // Basándose en los payloads reales de Polar:
  // - subscription.updated: price.price_amount
  // - order.paid: product_price.price_amount
  // - subscription.revoked: amount

  const priceSources = [
    polarData?.amount, // Campo directo amount (subscription.revoked)
    polarData?.price?.price_amount, // Dentro del objeto price (subscription.updated)
    polarData?.product_price?.price_amount, // Dentro de product_price (order.paid)
    polarData?.prices?.[0]?.price_amount, // Primer elemento del array prices
  ];

  // Buscar el primer valor válido (no null, undefined, o 0)
  for (const price of priceSources) {
    if (price && price > 0) {
      const finalPrice = price / 100; // Convertir de centavos a dólares
      console.log(`Found plan price: $${finalPrice} from source: ${price}`);
      return finalPrice;
    }
  }

  console.warn(`No valid price found in Polar data. Sources checked:`, priceSources);
  return undefined;
}
