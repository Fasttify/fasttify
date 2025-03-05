import { useState, useCallback } from 'react'
import { generateClient } from 'aws-amplify/api'
import type { Schema } from '@/amplify/data/resource'

const client = generateClient<Schema>()

export function useChat() {
  const [messages, setMessages] = useState<Array<{ content: string; role: 'user' | 'assistant' }>>(
    []
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const chat = useCallback(async (message: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log('Enviando mensaje al chatbot:', message)

      // Add user message to the list
      setMessages(prev => [...prev, { content: message, role: 'user' }])

      // Call the AI endpoint directly like in your example
      const { data, errors } = await client.queries.generateHaiku({
        prompt: message,
      })

      if (errors) {
        throw new Error(errors[0]?.message || 'Error en la generación')
      } else if (data) {
        // Add the assistant's response to the messages
        setMessages(prev => [...prev, { content: data, role: 'assistant' }])
      } else {
        throw new Error('No se recibió respuesta del asistente')
      }
    } catch (err: any) {
      console.error('Error en chat:', err)
      setError(new Error(err.message || 'Error desconocido'))
      // Add error message as assistant response
      setMessages(prev => [
        ...prev,
        {
          content: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.',
          role: 'assistant',
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  const resetChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    loading,
    error,
    chat,
    resetChat,
  }
}
