import { useState, useCallback } from 'react'

export interface CustomDomainStatus {
  hasCustomDomain: boolean
  domain?: string
  status?: 'pending' | 'active' | 'failed' | 'inactive'
  verificationInfo?: {
    type: string
    name: string
    value: string
  }
  sslStatus?: {
    status: string
    isActive: boolean
    validationErrors?: string[]
  }
  verifiedAt?: string
}

export interface CustomDomainSetupResponse {
  success: boolean
  domain: string
  status: string
  cloudflareId: string
  verificationInfo: {
    type: string
    name: string
    value: string
  }
}

export function useCustomDomain(storeId: string) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<CustomDomainStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Obtener el estado actual del dominio personalizado
   */
  const getCustomDomainStatus = useCallback(async (): Promise<CustomDomainStatus | null> => {
    if (!storeId) return null

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/stores/${storeId}/custom-domain`)

      if (!response.ok) {
        throw new Error('Error at getCustomDomainStatus')
      }

      const data = await response.json()
      setStatus(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [storeId])

  /**
   * Configurar un nuevo dominio personalizado
   */
  const setupCustomDomain = useCallback(
    async (domain: string): Promise<CustomDomainSetupResponse | null> => {
      if (!storeId || !domain) return null

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/stores/${storeId}/custom-domain`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ customDomain: domain }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error at setupCustomDomain')
        }

        const data = await response.json()

        // Actualizar el estado local
        await getCustomDomainStatus()

        return data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    [storeId, getCustomDomainStatus]
  )

  /**
   * Eliminar dominio personalizado
   */
  const removeCustomDomain = useCallback(async (): Promise<boolean> => {
    if (!storeId) return false

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/stores/${storeId}/custom-domain`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error at removeCustomDomain')
      }

      // Actualizar el estado local
      setStatus({ hasCustomDomain: false })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [storeId])

  /**
   * Validar formato de dominio
   */
  const validateDomain = useCallback((domain: string): { isValid: boolean; error?: string } => {
    if (!domain) {
      return { isValid: false, error: 'Domain is required' }
    }

    // Regex básico para validar dominio
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/

    if (!domainRegex.test(domain)) {
      return { isValid: false, error: 'Invalid domain format' }
    }

    // No permitir subdominios de fasttify.com como dominio personalizado
    if (domain.includes('fasttify.com')) {
      return {
        isValid: false,
        error: 'You cannot use subdomains of fasttify.com as a custom domain',
      }
    }

    return { isValid: true }
  }, [])

  return {
    loading,
    error,
    status,
    getCustomDomainStatus,
    setupCustomDomain,
    removeCustomDomain,
    validateDomain,
  }
}
