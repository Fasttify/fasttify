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
   * Convierte los menu_items del store template en formato linklists compatible con Shopify
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

    // Si no hay menu_items, crear un menú por defecto
    if (!linkLists['main-menu']) {
      linkLists['main-menu'] = {
        title: 'Menú Principal',
        handle: 'main-menu',
        links: [
          { title: 'Inicio', url: '/', active: true },
          { title: 'Productos', url: '/productos', active: true },
          { title: 'Colecciones', url: '/colecciones', active: true },
          { title: 'Contacto', url: '/contacto', active: true },
        ],
      }
    }

    return linkLists
  }

  /**
   * Crear linklists vacío para evitar errores
   */
  public createEmptyLinkLists(): LinkLists {
    return {
      'main-menu': {
        title: 'Menú Principal',
        handle: 'main-menu',
        links: [],
      },
    }
  }
}

export const linkListService = new LinkListService()
