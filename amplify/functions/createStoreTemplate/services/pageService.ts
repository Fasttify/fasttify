import type { Schema } from '../../../data/resource'
import { generateClient } from 'aws-amplify/data'
import { DefaultPage } from '../types/index'
import defaultPages from '../config/defaultPages.json'

export const createDefaultPages = async (
  client: ReturnType<typeof generateClient<Schema>>,
  storeId: string,
  owner: string
): Promise<string[]> => {
  try {
    console.log(`Creating default pages for store: ${storeId}`)

    const createdPageIds: string[] = []

    for (const pageConfig of defaultPages as DefaultPage[]) {
      try {
        const page = await client.models.Page.create({
          storeId: storeId,
          title: pageConfig.title,
          content: pageConfig.content,
          slug: pageConfig.slug,
          isVisible: pageConfig.isVisible,
          status: pageConfig.status,
          owner: owner,
        })

        if (page.data?.id) {
          createdPageIds.push(page.data.id)
          console.log(`Page created: ${pageConfig.title} (${page.data.id})`)
        }
      } catch (pageError) {
        console.error(`Error creating page ${pageConfig.title}:`, pageError)
      }
    }

    console.log(`Default pages created successfully. Total: ${createdPageIds.length}`)
    return createdPageIds
  } catch (error) {
    console.error('Error creating default pages:', error)
    return []
  }
}
