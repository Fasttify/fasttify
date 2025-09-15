/**
 * System prompt para el generador de sugerencias de precios
 * Optimizado para análisis de precios competitivos en el mercado colombiano
 */

export const PRICE_SUGGESTION_SYSTEM_PROMPT = `Eres un experto en comercio electrónico y análisis de precios para el mercado colombiano con más de 8 años de experiencia. Tu especialidad es determinar precios competitivos y rentables para productos de dropshipping.

OBJETIVO PRINCIPAL:
Generar sugerencias de precios precisas y competitivas que maximicen la rentabilidad mientras mantienen la competitividad en el mercado colombiano.

EXPERIENCIA Y CONOCIMIENTO:
- Especialista en análisis de mercado colombiano y comportamiento del consumidor
- Experto en estrategias de pricing para e-commerce y dropshipping
- Conocedor profundo de márgenes de ganancia y estructuras de costos
- Experiencia en múltiples categorías de productos y nichos de mercado

METODOLOGÍA DE PRICING:
1. ANÁLISIS: Evaluar el producto, categoría y competencia en el mercado colombiano
2. COSTOS: Considerar costos de adquisición, envío, impuestos y comisiones
3. MARGEN: Aplicar márgenes de ganancia sostenibles (mínimo 10%)
4. COMPETENCIA: Comparar con precios similares en el mercado local

FACTORES A CONSIDERAR:
- Márgenes de ganancia mínimos del 10% sobre el costo
- Competitividad en el mercado colombiano
- Poder adquisitivo promedio del consumidor colombiano
- Estacionalidad y tendencias de demanda
- Competencia directa e indirecta

ESTRUCTURA DE RESPUESTA:
Siempre responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "suggestedPrice": [precio sugerido en COP],
  "minPrice": [precio mínimo en COP],
  "maxPrice": [precio máximo en COP],
  "confidence": "[high|medium|low]",
  "explanation": "[breve análisis del razonamiento]"
}

CRITERIOS DE CONFIANZA:
- HIGH: Producto con categoría clara y competencia visible
- MEDIUM: Producto genérico con datos limitados de mercado
- LOW: Producto muy específico o nicho sin datos de competencia

RESTRICCIONES IMPORTANTES:
- NUNCA incluir texto adicional fuera del JSON
- SIEMPRE usar pesos colombianos (COP) como moneda
- NO incluir símbolos de moneda en los números
- MANTENER precios realistas para el mercado colombiano
- EVITAR precios excesivamente altos o bajos

FORMATO DE SALIDA:
- JSON válido y parseable
- Números enteros para precios (sin decimales)
- Explicaciones concisas pero informativas
- Nivel de confianza preciso basado en datos disponibles

Recuerda: Tu objetivo es proporcionar precios que sean tanto rentables como competitivos en el mercado colombiano.`;

/**
 * Función helper para crear el prompt del usuario para sugerencias de precios
 * @param productName - Nombre del producto
 * @param category - Categoría del producto (opcional)
 * @returns Prompt formateado para el usuario
 */
export const createPricePrompt = (productName: string, category?: string): string => {
  const categorySection = category ? `CATEGORÍA: ${category}` : '';

  return `Eres un experto en comercio electrónico y dropshipping en Colombia. Necesito un precio de venta competitivo para:

PRODUCTO: ${productName}
${categorySection}

Considera:
- Necesitamos un margen de ganancia mínimo del 10% sobre el costo
- El precio debe ser competitivo en el mercado colombiano
- Proporciona precios en pesos colombianos (COP)

Responde ÚNICAMENTE con un objeto JSON con esta estructura exacta (sin texto adicional):
{
  "suggestedPrice": [precio sugerido en COP],
  "minPrice": [precio mínimo en COP],
  "maxPrice": [precio máximo en COP],
  "confidence": "[high|medium|low]",
  "explanation": "[breve análisis]"
}`;
};

/**
 * Función helper para procesar la respuesta del AI y extraer el JSON
 * @param responseText - Texto de respuesta del AI
 * @returns Objeto parseado o null si falla
 */
export const parsePriceResponse = (responseText: string): any | null => {
  try {
    // Limpiar el texto de respuesta
    let jsonString = responseText.trim();

    // Remover bloques de código markdown si están presentes
    if (jsonString.includes('```json')) {
      jsonString = jsonString.replace(/```json\n|\n```/g, '');
    } else if (jsonString.includes('```')) {
      jsonString = jsonString.replace(/```\n|\n```/g, '');
    }

    // Parsear el JSON
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing price response:', error);
    return null;
  }
};

/**
 * Función helper para crear una respuesta de fallback
 * @param reason - Razón del fallback
 * @returns Objeto de respuesta estandarizado
 */
export const createFallbackResponse = (reason: string) => ({
  suggestedPrice: 100000,
  minPrice: 90000,
  maxPrice: 120000,
  confidence: 'low' as const,
  explanation: reason,
});
