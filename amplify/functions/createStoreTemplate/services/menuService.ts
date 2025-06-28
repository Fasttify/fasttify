import type { Schema } from '../../../data/resource'
import { generateClient } from 'aws-amplify/data'
import { DefaultNavigationMenu } from '../types/index'
import defaultMenus from '../config/defaultMenus.json'

export const createDefaultMenus = async (
  client: ReturnType<typeof generateClient<Schema>>,
  storeId: string,
  domain: string,
  owner: string
): Promise<string[]> => {
  try {
    console.log(`Creating default navigation menus for store: ${storeId}`)

    const createdMenuIds: string[] = []

    // Crear todos los menús definidos en defaultMenus
    for (const menuConfig of defaultMenus as DefaultNavigationMenu[]) {
      try {
        // Crear el menú con toda la estructura JSON
        const menuResult = await client.models.NavigationMenu.create({
          storeId: storeId,
          domain: domain,
          name: menuConfig.name,
          handle: menuConfig.handle,
          isMain: menuConfig.isMain,
          isActive: true,
          menuData: JSON.stringify(menuConfig.items),
          owner: owner,
        })

        if (!menuResult.data?.id) {
          console.error(`Failed to create menu: ${menuConfig.name}`)
          continue
        }

        const menuId = menuResult.data.id
        createdMenuIds.push(menuId)
      } catch (menuError) {
        console.error(`Error creating menu ${menuConfig.name}:`, menuError)
        // Continuamos con los demás menús aunque uno falle
      }
    }

    return createdMenuIds
  } catch (error) {
    console.error('Error creating default navigation menus:', error)
    // Retornamos array vacío en caso de error general
    return []
  }
}
