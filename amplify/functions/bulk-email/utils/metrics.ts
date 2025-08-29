/**
 * Módulo para métricas y monitoreo del servicio de email
 */

export interface EmailMetrics {
  timestamp: Date;
  campaignId: string;
  templateId: string;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  processingTimeMs: number;
  priority: 'low' | 'normal' | 'high';
  processingMode: 'sync' | 'async';
  errorTypes: Record<string, number>;
}

export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsed?: number;
  operationName: string;
  metadata?: Record<string, any>;
}

/**
 * Clase para recopilar métricas de rendimiento
 */
export class MetricsCollector {
  private metrics: PerformanceMetrics[] = [];
  private currentOperation?: PerformanceMetrics;

  /**
   * Inicia el seguimiento de una operación
   */
  startOperation(name: string, metadata?: Record<string, any>): void {
    this.currentOperation = {
      startTime: Date.now(),
      operationName: name,
      metadata,
    };
  }

  /**
   * Finaliza el seguimiento de la operación actual
   */
  endOperation(): PerformanceMetrics | null {
    if (!this.currentOperation) {
      console.warn('No operation to end');
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - this.currentOperation.startTime;

    const completedMetric: PerformanceMetrics = {
      ...this.currentOperation,
      endTime,
      duration,
      memoryUsed: this.getMemoryUsage(),
    };

    this.metrics.push(completedMetric);
    this.currentOperation = undefined;

    // Log métricas para CloudWatch
    console.log(
      'METRICS:',
      JSON.stringify({
        operation: completedMetric.operationName,
        duration: completedMetric.duration,
        memoryUsed: completedMetric.memoryUsed,
        ...completedMetric.metadata,
      })
    );

    return completedMetric;
  }

  /**
   * Obtiene todas las métricas recopiladas
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Limpia las métricas recopiladas
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Obtiene el uso de memoria actual
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }
}

/**
 * Registra métricas de una campaña de email
 */
export function logEmailCampaignMetrics(metrics: EmailMetrics): void {
  // Calcular tasas
  const successRate = metrics.totalRecipients > 0 ? (metrics.successCount / metrics.totalRecipients) * 100 : 0;

  const failureRate = 100 - successRate;
  const avgProcessingTime = metrics.totalRecipients > 0 ? metrics.processingTimeMs / metrics.totalRecipients : 0;

  // Log estructurado para CloudWatch
  console.log(
    'EMAIL_CAMPAIGN_METRICS:',
    JSON.stringify({
      timestamp: metrics.timestamp.toISOString(),
      campaignId: metrics.campaignId,
      templateId: metrics.templateId,
      totalRecipients: metrics.totalRecipients,
      successCount: metrics.successCount,
      failureCount: metrics.failureCount,
      successRate: Number(successRate.toFixed(2)),
      failureRate: Number(failureRate.toFixed(2)),
      processingTimeMs: metrics.processingTimeMs,
      avgProcessingTimeMs: Number(avgProcessingTime.toFixed(2)),
      priority: metrics.priority,
      processingMode: metrics.processingMode,
      errorTypes: metrics.errorTypes,
    })
  );

  // Alertas automáticas
  if (failureRate > 50) {
    console.error('ALERT: High failure rate in email campaign', {
      campaignId: metrics.campaignId,
      failureRate: failureRate.toFixed(2),
      errorTypes: metrics.errorTypes,
    });
  }

  if (metrics.processingTimeMs > 300000) {
    // 5 minutos
    console.warn('ALERT: High processing time', {
      campaignId: metrics.campaignId,
      processingTimeMs: metrics.processingTimeMs,
      avgProcessingTimeMs: avgProcessingTime.toFixed(2),
    });
  }
}

/**
 * Registra métricas de SQS
 */
export function logSQSMetrics(queueName: string, batchSize: number, processingTimeMs: number): void {
  console.log(
    'SQS_METRICS:',
    JSON.stringify({
      timestamp: new Date().toISOString(),
      queueName,
      batchSize,
      processingTimeMs,
      messagesPerSecond: Number(((batchSize * 1000) / processingTimeMs).toFixed(2)),
    })
  );
}

/**
 * Registra métricas de SES
 */
export function logSESMetrics(templateId: string, success: boolean, responseTime: number, error?: string): void {
  console.log(
    'SES_METRICS:',
    JSON.stringify({
      timestamp: new Date().toISOString(),
      templateId,
      success,
      responseTimeMs: responseTime,
      error: error || null,
    })
  );
}

/**
 * Genera un resumen de métricas para múltiples operaciones
 */
export function generateMetricsSummary(metrics: PerformanceMetrics[]): Record<string, any> {
  if (metrics.length === 0) {
    return { operations: 0, summary: 'No metrics available' };
  }

  const operationGroups = metrics.reduce(
    (groups, metric) => {
      if (!groups[metric.operationName]) {
        groups[metric.operationName] = [];
      }
      groups[metric.operationName].push(metric);
      return groups;
    },
    {} as Record<string, PerformanceMetrics[]>
  );

  const summary: Record<string, any> = {
    totalOperations: metrics.length,
    operationTypes: Object.keys(operationGroups).length,
    byOperation: {},
  };

  Object.entries(operationGroups).forEach(([operationName, ops]) => {
    const durations = ops.map((op) => op.duration || 0);
    const memoryUsages = ops.map((op) => op.memoryUsed || 0);

    summary.byOperation[operationName] = {
      count: ops.length,
      avgDuration: Number((durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2)),
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      avgMemoryUsed: Number((memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length).toFixed(2)),
    };
  });

  return summary;
}

/**
 * Middleware para medir tiempo de ejecución de funciones async
 */
export function measureExecutionTime<T>(
  fn: () => Promise<T>,
  operationName: string,
  collector?: MetricsCollector
): Promise<T> {
  const startTime = Date.now();

  return fn()
    .then((result) => {
      const duration = Date.now() - startTime;
      console.log(`TIMING: ${operationName} completed in ${duration}ms`);

      if (collector) {
        collector.startOperation(operationName);
        collector.endOperation();
      }

      return result;
    })
    .catch((error) => {
      const duration = Date.now() - startTime;
      console.error(`TIMING: ${operationName} failed after ${duration}ms`, error);
      throw error;
    });
}

/**
 * Crea alertas personalizadas basadas en métricas
 */
export function createAlert(level: 'info' | 'warning' | 'error', message: string, context: Record<string, any>): void {
  const alert = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    service: 'bulk-email-service',
  };

  switch (level) {
    case 'error':
      console.error('ALERT:', JSON.stringify(alert));
      break;
    case 'warning':
      console.warn('ALERT:', JSON.stringify(alert));
      break;
    default:
      console.info('ALERT:', JSON.stringify(alert));
  }
}
