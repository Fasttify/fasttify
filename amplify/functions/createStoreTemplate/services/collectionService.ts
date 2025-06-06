import type { Schema } from '../../../data/resource'
import { generateClient } from 'aws-amplify/data'
import { DefaultCollection } from '../types/index'
import defaultCollections from '../config/defaultCollections.json'

export const createDefaultCollections = async (
  client: ReturnType<typeof generateClient<Schema>>,
  storeId: string,
  owner: string
): Promise<string[]> => {
  try {
    console.log(`Creating default collections for store: ${storeId}`)

    const createdCollectionIds: string[] = []

    // Crear todas las colecciones definidas en defaultCollections
    for (const collectionConfig of defaultCollections as DefaultCollection[]) {
      try {
        const collection = await client.models.Collection.create({
          storeId: storeId,
          title: collectionConfig.title,
          description: collectionConfig.description,
          slug: collectionConfig.slug,
          isActive: collectionConfig.isActive,
          sortOrder: collectionConfig.sortOrder,
          owner: owner,
        })

        if (collection.data?.id) {
          createdCollectionIds.push(collection.data.id)
          console.log(`Collection created: ${collectionConfig.title} (${collection.data.id})`)
        }
      } catch (collectionError) {
        console.error(`Error creating collection ${collectionConfig.title}:`, collectionError)
        // Continuamos con las demás colecciones aunque una falle
      }
    }

    console.log(`Default collections created successfully. Total: ${createdCollectionIds.length}`)
    return createdCollectionIds
  } catch (error) {
    console.error('Error creating default collections:', error)
    // Retornamos array vacío en caso de error general
    return []
  }
}
