import type { Schema } from '../../data/resource'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/create-store-template'
import { InitializationResult } from './types/index'
import { validateInputs } from './services/validationService'
import { createDefaultCollections } from './services/collectionService'
import { createDefaultMenus } from './services/menuService'
import { createDefaultPages } from './services/pageService'

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
 * Inicializa los datos por defecto para una tienda (sin template estático)
 */
async function initializeStoreTemplate(
  storeId: string,
  domain: string,
  owner: string
): Promise<InitializationResult> {
  try {
    console.log(`Initializing store data for: ${storeId}`)

    // Crear colecciones por defecto
    const collectionIds = await createDefaultCollections(client, storeId, owner)

    // Crear menús de navegación por defecto (incluye footer)
    const menuIds = await createDefaultMenus(client, storeId, domain, owner)

    // Crear páginas por defecto (políticas)
    const pageIds = await createDefaultPages(client, storeId, owner)

    return {
      success: true,
      message: 'Store initialized successfully with collections, menus, and pages',
      collections: collectionIds,
      menus: menuIds,
      pages: pageIds,
    }
  } catch (error) {
    console.error('Error initializing store:', error)
    throw error
  }
}
