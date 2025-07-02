/**
 * @fileoverview Hook personalizado para gestionar la comunicación con el chatbot AI.
 * Proporciona funcionalidades para enviar mensajes, recibir respuestas y gestionar
 * el estado de la conversación.
 */
import { useState, useCallback } from 'react';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';

/**
 * Cliente generado para interactuar con la API de Amplify.
 */
const client = generateClient<Schema>();

/**
 * Hook personalizado que gestiona la interacción con el chatbot AI.
 *
 * @returns {Object} Objeto con el estado y las funciones para interactuar con el chat.
 */
export function useChat() {
  /**
   * Estado para almacenar los mensajes de la conversación.
   * @type {Array<{content: string, role: 'user' | 'assistant'}>}
   */
  const [messages, setMessages] = useState<Array<{ content: string; role: 'user' | 'assistant' }>>([]);

  /**
   * Estado para controlar si hay una operación de chat en curso.
   * @type {boolean}
   */
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Estado para almacenar errores que puedan ocurrir durante la comunicación.
   * @type {Error | null}
   */
  const [error, setError] = useState<Error | null>(null);

  /**
   * Función para enviar un mensaje al chatbot y procesar su respuesta.
   *
   * @param {string} message - El mensaje que el usuario quiere enviar al chatbot.
   * @returns {Promise<void>}
   */
  const chat = useCallback(async (message: string) => {
    setLoading(true);
    setError(null);

    try {
      // Añadir el mensaje del usuario a la lista
      setMessages((prev) => [...prev, { content: message, role: 'user' }]);

      // Llamar al endpoint de IA directamente
      const { data, errors } = await client.queries.generateHaiku({
        prompt: message,
      });

      if (errors) {
        throw new Error(errors[0]?.message || 'Generation error');
      } else if (data) {
        // Añadir la respuesta del asistente a los mensajes
        setMessages((prev) => [...prev, { content: data, role: 'assistant' }]);
      } else {
        throw new Error('No response was received from the assistant');
      }
    } catch (err: any) {
      console.error('Error in chat:', err);
      setError(new Error(err.message || 'Unknown error'));
      // Añadir mensaje de error como respuesta del asistente
      setMessages((prev) => [
        ...prev,
        {
          content: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.',
          role: 'assistant',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Función para reiniciar la conversación, eliminando todos los mensajes y errores.
   *
   * @returns {void}
   */
  const resetChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages, // Lista de mensajes de la conversación
    loading, // Indicador de operación en curso
    error, // Error actual, si existe
    chat, // Función para enviar un mensaje
    resetChat, // Función para reiniciar la conversación
  };
}
