/**
 * Utilidades para manejar datos de gráficos en componentes de analíticas
 */

export interface ChartDataPoint {
  name: string;
  value: number;
}

/**
 * Genera datos para un gráfico que inicia plano y muestra variaciones donde hay datos reales
 * Esto crea un gráfico más visual incluso con pocos datos
 */
export function generateFlatLineData(
  originalData: ChartDataPoint[] | undefined,
  _minDataPoints: number = 2,
  fallbackValue: number = 0
): ChartDataPoint[] {
  // Si no hay datos originales, crear una línea plana básica con fechas válidas
  if (!originalData || originalData.length === 0) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return [
      { name: yesterday.toISOString().split('T')[0], value: fallbackValue },
      { name: today.toISOString().split('T')[0], value: fallbackValue },
      { name: tomorrow.toISOString().split('T')[0], value: fallbackValue },
    ];
  }

  // Si hay suficientes datos (3 o más puntos), usar los datos originales
  if (originalData.length >= 3) {
    return originalData;
  }

  // Para datos insuficientes (1-2 puntos), crear una progresión que inicie plano
  if (originalData.length === 1) {
    const singlePoint = originalData[0];

    // Intentar usar fechas basadas en el punto real, con fallback
    try {
      const baseDate = new Date(singlePoint.name);
      if (!isNaN(baseDate.getTime())) {
        const prevDay = new Date(baseDate);
        prevDay.setDate(baseDate.getDate() - 1);
        const nextDay = new Date(baseDate);
        nextDay.setDate(baseDate.getDate() + 1);

        return [
          { name: prevDay.toISOString().split('T')[0], value: 0 },
          { name: singlePoint.name, value: singlePoint.value },
          { name: nextDay.toISOString().split('T')[0], value: singlePoint.value },
        ];
      }
    } catch (_error) {
      // Fallback si la fecha no es válida
    }

    // Fallback: usar fechas relativas al día actual
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return [
      { name: yesterday.toISOString().split('T')[0], value: 0 },
      { name: today.toISOString().split('T')[0], value: singlePoint.value },
      { name: tomorrow.toISOString().split('T')[0], value: singlePoint.value },
    ];
  }

  // Para 2 puntos de datos, crear una progresión más natural
  if (originalData.length === 2) {
    const firstPoint = originalData[0];
    const secondPoint = originalData[1];

    // Intentar agregar un punto antes del primero
    try {
      const baseDate = new Date(firstPoint.name);
      if (!isNaN(baseDate.getTime())) {
        const prevDay = new Date(baseDate);
        prevDay.setDate(baseDate.getDate() - 1);

        return [
          { name: prevDay.toISOString().split('T')[0], value: 0 },
          { name: firstPoint.name, value: firstPoint.value },
          { name: secondPoint.name, value: secondPoint.value },
        ];
      }
    } catch (_error) {
      // Fallback si las fechas no son válidas
    }

    // Fallback: usar los datos originales
    return originalData;
  }

  return originalData;
}

/**
 * Determina si los datos son suficientes para mostrar un gráfico significativo
 */
export function hasInsufficientData(data: ChartDataPoint[] | undefined, minPoints: number = 2): boolean {
  return !data || data.length < minPoints;
}

/**
 * Calcula un valor de fallback para líneas planas basado en el promedio de los datos existentes
 */
export function calculateFallbackValue(data: ChartDataPoint[] | undefined): number {
  if (!data || data.length === 0) return 0;

  const sum = data.reduce((acc, point) => acc + point.value, 0);
  return Math.round(sum / data.length);
}
