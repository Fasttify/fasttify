import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../data/resource';
import defaultMenus from '../config/defaultMenus.json';
import { DefaultNavigationMenu } from '../types/index';

export const createDefaultMenus = async (
  client: ReturnType<typeof generateClient<Schema>>,
  storeId: string,
  domain: string,
  owner: string
): Promise<string[]> => {
  try {
    const createdMenuIds: string[] = [];

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
        });

        if (!menuResult.data?.id) {
          console.error(`Failed to create menu: ${menuConfig.name}`);
          continue;
        }

        const menuId = menuResult.data.id;
        createdMenuIds.push(menuId);
      } catch (menuError) {
        console.error(`Error creating menu ${menuConfig.name}:`, menuError);
      }
    }

    return createdMenuIds;
  } catch (error) {
    console.error('Error creating default navigation menus:', error);
    return [];
  }
};
