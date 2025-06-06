import type { Schema } from '../../data/resource'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/create-store-template'
import { InitializationResult } from './types/index'
import { validateInputs } from './services/validationService'
import { checkExistingTemplate, createStoreTemplate } from './services/templateService'
import { createDefaultCollections } from './services/collectionService'
import { buildTemplateData, validateTemplateData } from './utils/templateBuilder'

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)

Amplify.configure(resourceConfig, libraryOptions)

const client = generateClient<Schema>()

/**
 * Handler principal para inicializar templates de tienda
 */
export const handler = async (event: any): Promise<InitializationResult> => {
  try {
    // Validar y extraer argumentos usando el servicio de validación
    const { storeId, domain, userId } = validateInputs(event)

    // Ejecutar inicialización
    return await initializeStoreTemplate(storeId, domain, userId)
  } catch (error) {
    console.error('Error in createStoreTemplate handler:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Inicializa el template y datos por defecto para una tienda
 */
async function initializeStoreTemplate(
  storeId: string,
  domain: string,
  owner: string
): Promise<InitializationResult> {
  try {
    // Verificar si ya existe un template usando el servicio
    const existingCheck = await checkExistingTemplate(client, storeId)
    if (!existingCheck.canProceed) {
      return existingCheck.result!
    }

    // Crear template por defecto usando el builder
    const templateData = buildTemplateData()

    // Validar que el template generado sea válido
    if (!validateTemplateData(templateData)) {
      throw new Error('Generated template data is invalid')
    }

    const templateResult = await createStoreTemplate(client, storeId, domain, owner, templateData)

    // Crear colecciones por defecto usando el servicio
    const collectionIds = await createDefaultCollections(client, storeId, owner)

    return {
      success: true,
      message: 'Store template initialized successfully',
      templateId: templateResult.storeId,
      templateData: templateData,
      collections: collectionIds,
    }
  } catch (error) {
    console.error('Error initializing store template:', error)
    throw error
  }
}
