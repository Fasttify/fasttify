import { Amplify } from 'aws-amplify'
import outputs from '@/amplify_outputs.json'

let isConfigured = false

/**
 * Configuración global de Amplify
 * Se ejecuta automáticamente al importar este módulo
 */
export function configureAmplify() {
  if (isConfigured) {
    return
  }

  try {
    // Configuración inicial
    Amplify.configure(outputs)

    // Configuración avanzada con APIs REST personalizadas
    const existingConfig = Amplify.getConfig()
    Amplify.configure({
      ...existingConfig,
      API: {
        ...existingConfig.API,
        REST: outputs.custom?.APIs || {},
      },
    })

    isConfigured = true
  } catch (error) {
    console.error(' Error at configureAmplify:', error)
  }
}

/**
 * Configuración con SSR para componentes del servidor
 */
export function configureAmplifySSR() {
  if (isConfigured) {
    return
  }

  try {
    Amplify.configure(outputs, { ssr: true })
    isConfigured = true
  } catch (error) {
    console.error('Error at configureAmplifySSR:', error)
  }
}

/**
 * Forzar reconfiguración
 */
export function reconfigureAmplify() {
  isConfigured = false
  configureAmplify()
}

// Auto-configuración al importar
if (typeof window !== 'undefined') {
  // Cliente - configuración completa
  configureAmplify()
} else {
  // Servidor - configuración SSR
  configureAmplifySSR()
}

// Re-exportar Amplify configurado
export { Amplify }
