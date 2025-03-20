/**
 * @fileoverview Hook personalizado para generar descripciones de productos con IA.
 * Proporciona funcionalidades para solicitar descripciones basadas en el nombre
 * y categoría del producto.
 */
import { useState, useCallback } from 'react'
import { generateClient } from 'aws-amplify/api'
import type { Schema } from '@/amplify/data/resource'

/**
 * Cliente generado para interactuar con la API de Amplify.
 */
const client = generateClient<Schema>()

/**
 * Hook personalizado que gestiona la generación de descripciones de productos con IA.
 *
 * @returns {Object} Objeto con el estado y las funciones para generar descripciones.
 */
export function useProductDescription() {
  /**
   * Estado para almacenar la descripción generada.
   * @type {string}
   */
  const [description, setDescription] = useState<string>('')

  /**
   * Estado para controlar si hay una operación de generación en curso.
   * @type {boolean}
   */
  const [loading, setLoading] = useState<boolean>(false)

  /**
   * Estado para almacenar errores que puedan ocurrir durante la generación.
   * @type {Error | null}
   */
  const [error, setError] = useState<Error | null>(null)

  /**
   * Función para generar una descripción de producto con IA.
   *
   * @param {Object} params - Parámetros para la generación de la descripción.
   * @param {string} params.productName - Nombre del producto.
   * @param {string} [params.category] - Categoría del producto (opcional).
   * @returns {Promise<string>} La descripción generada.
   */
  const generateDescription = useCallback(
    async ({ productName, category }: { productName: string; category?: string }) => {
      setLoading(true)
      setError(null)
      setDescription('')

      try {
        // Llamar al endpoint de generación de descripciones
        const { data, errors } = await client.queries.generateProductDescription({
          productName,
          category,
        })

        if (errors) {
          throw new Error(errors[0]?.message || 'Error en la generación de descripción')
        } else if (data) {
          setDescription(data)
          return data
        } else {
          throw new Error('No se recibió respuesta del servicio')
        }
      } catch (err: any) {
        console.error('Error al generar descripción:', err)
        const errorMessage = err.message || 'Error desconocido'
        setError(new Error(errorMessage))
        throw new Error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * Función para reiniciar el estado del hook.
   *
   * @returns {void}
   */
  const reset = useCallback(() => {
    setDescription('')
    setError(null)
  }, [])

  return {
    description, // Descripción generada
    loading, // Indicador de operación en curso
    error, // Error actual, si existe
    generateDescription, // Función para generar una descripción
    reset, // Función para reiniciar el estado
  }
}
