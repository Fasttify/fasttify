import type { Schema } from '../../../data/resource'
import { generateClient } from 'aws-amplify/data'
import { ExistingTemplateCheck, CreateTemplateResult, TemplateData } from '../types/index'

export const checkExistingTemplate = async (
  client: ReturnType<typeof generateClient<Schema>>,
  storeId: string
): Promise<ExistingTemplateCheck> => {
  try {
    const existingTemplate = await client.models.StoreTemplate.get({ storeId })

    if (existingTemplate.data) {
      console.log('Template already exists for this store')
      return {
        canProceed: false,
        result: {
          success: false,
          message: 'Template already exists for this store',
          templateId: existingTemplate.data.storeId,
        },
      }
    }

    return {
      canProceed: true,
      result: { success: true, message: 'Can proceed with template creation' },
    }
  } catch (error) {
    console.error('Error checking existing template:', error)
    throw error
  }
}

export const createStoreTemplate = async (
  client: ReturnType<typeof generateClient<Schema>>,
  storeId: string,
  domain: string,
  owner: string,
  templateData: TemplateData
): Promise<CreateTemplateResult> => {
  try {
    const storeTemplate = await client.models.StoreTemplate.create({
      storeId: storeId,
      domain: domain,
      templateKey: 'default',
      templateData: JSON.stringify(templateData),
      isActive: true,
      lastUpdated: new Date().toISOString(),
      owner: owner,
    })

    if (!storeTemplate.data?.storeId) {
      throw new Error('Failed to create store template')
    }

    console.log('StoreTemplate created successfully:', storeTemplate.data.storeId)
    return { storeId: storeTemplate.data.storeId }
  } catch (error) {
    console.error('Error creating store template:', error)
    throw error
  }
}
