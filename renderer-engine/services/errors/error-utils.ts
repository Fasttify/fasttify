import type { TemplateError } from '@/renderer-engine/types';

/**
 * Crea un objeto TemplateError estándar
 */
export function createTemplateError(type: TemplateError['type'], message: string): TemplateError {
  return {
    type,
    message,
    statusCode: type === 'TEMPLATE_NOT_FOUND' ? 404 : 500,
  };
}
