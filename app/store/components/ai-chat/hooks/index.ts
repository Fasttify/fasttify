/**
 * @fileoverview Exportaciones centralizadas de todos los hooks de conversación AI.
 * Proporciona acceso fácil a todas las funcionalidades de chat AI del proyecto.
 */

// Hooks principales
export { useConversation } from './useConversation';
export { useSimpleChat } from './useSimpleChat';

// Hook existente (mantener compatibilidad)
export { useChat } from './useChat';

// Hook de auto-scroll
export { useAutoScroll } from './useAutoScroll';

// Tipos
export type { Message, StreamEvent, UseConversationReturn } from './useConversation';
export type { UseSimpleChatReturn } from './useSimpleChat';
