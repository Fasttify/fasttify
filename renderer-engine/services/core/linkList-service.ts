import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher'
import type { ProcessedNavigationMenu } from '@/renderer-engine/types/store'
import { logger } from '@/renderer-engine/lib/logger'

export interface LinkListItem {
  title: string
  url: string
  active: boolean
}

export interface LinkList {
  title: string
  handle: string
  links: LinkListItem[]
}

export interface LinkLists {
  [handle: string]: LinkList
}

export class LinkListService {
  /**
   * Crea linklists desde la tabla NavigationMenu (método principal)
   * @param storeId - ID de la tienda
   * @returns LinkLists compatible con Shopify
   */
  public async createLinkListsFromDatabase(storeId: string): Promise<LinkLists> {
    try {
      const navigationMenusResponse = await dataFetcher.getStoreNavigationMenus(storeId)

      if (!navigationMenusResponse.menus || navigationMenusResponse.menus.length === 0) {
        logger.info(`No navigation menus found for store: ${storeId}`, 'LinkListService')
        return {}
      }

      const linkLists: LinkLists = {}

      // Convertir cada menú procesado a formato LinkList
      for (const menu of navigationMenusResponse.menus) {
        linkLists[menu.handle] = this.convertNavigationMenuToLinkList(menu)
        if (menu.handle === 'footer-menu') {
          linkLists['footer-menu'] = this.convertNavigationMenuToLinkList(menu)
        }
      }

      return linkLists
    } catch (error) {
      logger.error(
        `Error creating linklists from database for store ${storeId}`,
        error,
        'LinkListService'
      )
      return {}
    }
  }

  /**
   * Convierte un menú de navegación procesado a formato LinkList
   * @param menu - Menú de navegación procesado
   * @returns LinkList compatible con Shopify
   */
  private convertNavigationMenuToLinkList(menu: ProcessedNavigationMenu): LinkList {
    return {
      title: menu.name,
      handle: menu.handle,
      links: menu.items.map(item => ({
        title: item.title,
        url: item.url,
        active: item.active,
      })),
    }
  }

  /**
   * Convierte los menu_items del store template en formato linklists compatible con Shopify
   * @deprecated Usar createLinkListsFromDatabase() en su lugar
   */
  public createLinkListsFromStoreTemplate(storeTemplate: any): LinkLists {
    const linkLists: LinkLists = {}

    // Verificar si existe la configuración del header con menu_items
    if (storeTemplate?.sections?.header?.settings?.menu_items) {
      const menuItems = storeTemplate.sections.header.settings.menu_items

      // Crear el menú principal (main-menu)
      linkLists['main-menu'] = {
        title: 'Menú Principal',
        handle: 'main-menu',
        links: menuItems.map((item: any) => ({
          title: item.title,
          url: item.url,
          active: item.active !== false, // Por defecto true si no se especifica
        })),
      }
    }

    return linkLists
  }

  /**
   * Crear linklists vacío para evitar errores
   */
  public createEmptyLinkLists(): LinkLists {
    return {}
  }
}

export const linkListService = new LinkListService()
