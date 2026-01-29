/**
 * @fileoverview Exportaciones centralizadas de todos los hooks de conversación AI.
 * Proporciona acceso fácil a todas las funcionalidades de chat AI del proyecto.
 */

// Hooks principales
export { useConversation } from './useConversation';
export { useSimpleChat } from './useSimpleChat';

// Hooks de historial de conversaciones
export { useCurrentConversation } from './useCurrentConversation';

// Hooks de detección móvil
export { useMobileDetection, useChatMobileDetection } from './useMobileDetection';

// Hook existente (mantener compatibilidad) - REMOVIDO: useChat deprecated

// Tipos
export type { Message, StreamEvent, UseConversationReturn } from './useConversation';
export type { UseSimpleChatReturn } from './useSimpleChat';
export type { UseCurrentConversationReturn } from './useCurrentConversation';
