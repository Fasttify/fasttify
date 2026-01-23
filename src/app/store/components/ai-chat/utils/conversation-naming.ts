/**
 * @fileoverview Utilidades para generar nombres inteligentes de conversaciones.
 * Basado en el primer mensaje del usuario, similar a ChatGPT, Cursor, Meta AI, etc.
 */

/**
 * Genera un nombre inteligente para la conversación basado en el primer mensaje del usuario.
 *
 * @param message - El primer mensaje del usuario
 * @returns Un nombre limpio y descriptivo para la conversación
 *
 * @example
 * generateConversationName("¿Cómo puedo mejorar mi tienda de dropshipping?")
 * // Returns: "¿Cómo puedo mejorar mi tienda de dropshipping?"
 *
 * @example
 * generateConversationName("Necesito ayuda con el SEO de mi página web para aumentar las ventas y mejorar el posicionamiento")
 * // Returns: "Necesito ayuda con el SEO de mi página web para aumentar las ventas y mejorar el posicionamiento..."
 *
 * @example
 * generateConversationName("Hola")
 * // Returns: "Conversación 15/12/2024, 14:30"
 */
export function generateConversationName(message: string): string {
  // Limpiar el mensaje: remover caracteres especiales, espacios extra, etc.
  let cleanMessage = message.trim();

  // Remover caracteres especiales al inicio y final
  cleanMessage = cleanMessage.replace(/^[^\w\s]+|[^\w\s]+$/g, '');

  // Limitar a 50 caracteres máximo
  if (cleanMessage.length > 50) {
    cleanMessage = cleanMessage.substring(0, 47) + '...';
  }

  // Si el mensaje está vacío o es muy corto, usar un nombre genérico
  if (cleanMessage.length < 3) {
    return `Conversación ${new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  // Capitalizar la primera letra
  cleanMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);

  return cleanMessage;
}

/**
 * Genera un nombre temporal para conversaciones nuevas.
 *
 * @returns Un nombre temporal para nuevas conversaciones
 */
export function generateTemporaryConversationName(): string {
  return 'Nueva conversación';
}

/**
 * Valida si un mensaje es válido para generar un nombre de conversación.
 *
 * @param message - El mensaje a validar
 * @returns true si el mensaje es válido para generar nombre
 */
export function isValidMessageForNaming(message: string): boolean {
  const cleanMessage = message.trim().replace(/^[^\w\s]+|[^\w\s]+$/g, '');
  return cleanMessage.length >= 3;
}
