/**
 * @fileoverview Hook personalizado para generar sugerencias de precios con IA.
 * Proporciona funcionalidades para solicitar precios recomendados basados en el nombre
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
 * Interfaz para los resultados de la sugerencia de precios.
 */
export interface PriceSuggestionResult {
  suggestedPrice: number
  minPrice: number
  maxPrice: number
  confidence: 'high' | 'medium' | 'low'
  explanation: string
}

/**
 * Hook personalizado que gestiona la generación de sugerencias de precios con IA.
 *
 * @returns {Object} Objeto con el estado y las funciones para generar sugerencias de precios.
 */
export function usePriceSuggestion() {
  /**
   * Estado para almacenar el resultado de la sugerencia de precios.
   * @type {PriceSuggestionResult | null}
   */
  const [result, setResult] = useState<PriceSuggestionResult | null>(null)

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
   * Función para generar una sugerencia de precio con IA.
   *
   * @param {Object} params - Parámetros para la generación de la sugerencia de precio.
   * @param {string} params.productName - Nombre del producto.
   * @param {string} [params.category] - Categoría del producto (opcional).
   * @returns {Promise<PriceSuggestionResult>} El resultado de la sugerencia de precio.
   */
  const generatePriceSuggestion = useCallback(
    async ({ productName, category }: { productName: string; category?: string }) => {
      setLoading(true)
      setError(null)
      setResult(null)

      try {
        // Llamar al endpoint de generación de sugerencias de precios
        const { data, errors } = await client.queries.generatePriceSuggestion({
          productName,
          category,
        })

        if (errors) {
          throw new Error(errors[0]?.message || 'Error generating price suggestion')
        } else if (data) {
          setResult(data as PriceSuggestionResult)
          return data as PriceSuggestionResult
        } else {
          throw new Error('No response was received from the service')
        }
      } catch (err: any) {
        console.error('Error generating price suggestion:', err)
        const errorMessage = err.message || 'Unknown error'
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
    setResult(null)
    setError(null)
  }, [])

  return {
    result, // Resultado de la sugerencia de precio
    loading, // Indicador de operación en curso
    error, // Error actual, si existe
    generatePriceSuggestion, // Función para generar una sugerencia de precio
    reset, // Función para reiniciar el estado
  }
}
