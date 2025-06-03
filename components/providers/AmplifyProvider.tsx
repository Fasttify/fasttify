'use client'

import { useEffect, useRef } from 'react'
import { configureAmplify, configureAmplifySSR } from '@/lib/amplify-config'

interface AmplifyProviderProps {
  children: React.ReactNode
}

export function AmplifyProvider({ children }: AmplifyProviderProps) {
  const isConfigured = useRef(false)

  useEffect(() => {
    // Solo configurar una vez en el cliente
    if (!isConfigured.current) {
      if (typeof window !== 'undefined') {
        configureAmplify()
      } else {
        configureAmplifySSR()
      }
      isConfigured.current = true
    }
  }, [])

  return <>{children}</>
}

// También exportar una versión que se ejecuta inmediatamente
export function initializeAmplify() {
  if (typeof window !== 'undefined') {
    configureAmplify()
  } else {
    configureAmplifySSR()
  }
}
