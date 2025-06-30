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

/**
 * Configuración para procesamiento de menús
 */
interface MenuProcessingConfig {
  duplicateHandles?: string[] // Handles que deben duplicarse con el mismo contenido
  defaultTitles?: Record<string, string> // Títulos por defecto para handles específicos
  handleTransforms?: Record<string, string> // Transformaciones de handles
}

/**
 * Tipo para procesadores de menús específicos
 */
type MenuProcessor = (
  menu: ProcessedNavigationMenu,
  config: MenuProcessingConfig
) => LinkList[]

/**
 * Procesadores declarativos para diferentes tipos de menús
 */
const menuProcessors: Record<string, MenuProcessor> = {
  standard: (menu, config) => {
    const linkList = convertMenuToLinkList(menu, config)
    const results = [linkList]

    // Agregar duplicados si están configurados
    if (config.duplicateHandles?.includes(menu.handle)) {
      results.push({ ...linkList })
    }

    return results
  },

  headerMenu: (menu, config) => {
    // Procesar menú de header con lógica específica si es necesario
    return [convertMenuToLinkList(menu, config)]
  },

  footerMenu: (menu, config) => {
    // Procesar menú de footer con lógica específica si es necesario
    return [convertMenuToLinkList(menu, config)]
  },

  multilevel: (menu, config) => {
    // Para menús multinivel en el futuro
    return [convertMenuToLinkList(menu, config)]
  },
}

/**
 * Configuraciones predefinidas para diferentes casos de uso
 */
const predefinedConfigs: Record<string, MenuProcessingConfig> = {
  default: {
    duplicateHandles: [],
    defaultTitles: {},
    handleTransforms: {},
  },

  shopify: {
    duplicateHandles: ['main-menu', 'footer-menu'],
    defaultTitles: {
      'main-menu': 'Main Menu',
      'footer-menu': 'Footer Menu',
      'header-menu': 'Header Menu',
    },
    handleTransforms: {},
  },

  flexible: {
    duplicateHandles: [],
    defaultTitles: {},
    handleTransforms: {},
  },
}

export class LinkListService {
  private config: MenuProcessingConfig

  constructor(configName: keyof typeof predefinedConfigs = 'default') {
    this.config = predefinedConfigs[configName]
  }

  /**
   * Configura el servicio con opciones personalizadas
   */
  public configure(config: Partial<MenuProcessingConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Crea linklists desde la tabla NavigationMenu de forma flexible
   */
  public async createLinkListsFromDatabase(
    storeId: string,
    customConfig?: Partial<MenuProcessingConfig>
  ): Promise<LinkLists> {
    try {
      const navigationMenusResponse = await dataFetcher.getStoreNavigationMenus(storeId)

      if (!navigationMenusResponse.menus || navigationMenusResponse.menus.length === 0) {
        logger.info(`No navigation menus found for store: ${storeId}`, 'LinkListService')
        return {}
      }

      const effectiveConfig = customConfig
        ? { ...this.config, ...customConfig }
        : this.config

      const linkLists: LinkLists = {}

      // Procesar cada menú usando el procesador apropiado
      for (const menu of navigationMenusResponse.menus) {
        const processor = this.getMenuProcessor(menu)
        const processedMenus = processor(menu, effectiveConfig)

        // Agregar todos los menús procesados al resultado
        for (const processedMenu of processedMenus) {
          linkLists[processedMenu.handle] = processedMenu
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
   * Determina qué procesador usar para un menú específico
   */
  private getMenuProcessor(menu: ProcessedNavigationMenu): MenuProcessor {
    // Lógica para determinar el tipo de procesador basado en el menú
    if (menu.handle.includes('header')) {
      return menuProcessors.headerMenu
    }

    if (menu.handle.includes('footer')) {
      return menuProcessors.footerMenu
    }

    // Verificar si tiene estructura multinivel (para futuro)
    const hasNestedItems = menu.items.some(
      item => (item as any).children && (item as any).children.length > 0
    )

    if (hasNestedItems) {
      return menuProcessors.multilevel
    }

    return menuProcessors.standard
  }

  /**
   * Crea linklists desde configuración de template (más flexible)
   */
  public createLinkListsFromTemplate(
    templateConfig: any,
    customConfig?: Partial<MenuProcessingConfig>
  ): LinkLists {
    const linkLists: LinkLists = {}
    const effectiveConfig = customConfig
      ? { ...this.config, ...customConfig }
      : this.config

    // Buscar menús en diferentes ubicaciones de la configuración
    const menuSources = this.extractMenusFromTemplate(templateConfig)

    for (const { handle, title, items } of menuSources) {
      const linkList: LinkList = {
        title: effectiveConfig.defaultTitles?.[handle] || title,
        handle: effectiveConfig.handleTransforms?.[handle] || handle,
        links: items.map((item: any) => ({
          title: item.title,
          url: item.url,
          active: item.active !== false,
        })),
      }

      linkLists[linkList.handle] = linkList

      // Agregar duplicados si están configurados
      if (effectiveConfig.duplicateHandles?.includes(handle)) {
        const duplicateHandle = `${handle}-copy`
        linkLists[duplicateHandle] = { ...linkList, handle: duplicateHandle }
      }
    }

    return linkLists
  }

  /**
   * Extrae menús de diferentes ubicaciones en la configuración del template
   */
  private extractMenusFromTemplate(templateConfig: any): Array<{
    handle: string
    title: string
    items: any[]
  }> {
    const menus: Array<{ handle: string; title: string; items: any[] }> = []

    // Buscar en header.settings.menu_items (legacy)
    if (templateConfig?.sections?.header?.settings?.menu_items) {
      menus.push({
        handle: 'main-menu',
        title: 'Main Menu',
        items: templateConfig.sections.header.settings.menu_items,
      })
    }

    // Buscar en footer.settings.menu_items
    if (templateConfig?.sections?.footer?.settings?.menu_items) {
      menus.push({
        handle: 'footer-menu',
        title: 'Footer Menu',
        items: templateConfig.sections.footer.settings.menu_items,
      })
    }

    // Buscar en configuración de menús directa
    if (templateConfig?.menus) {
      for (const [handle, menuData] of Object.entries(templateConfig.menus)) {
        const menu = menuData as any
        menus.push({
          handle,
          title:
            menu.title ||
            handle.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          items: menu.items || [],
        })
      }
    }

    return menus
  }

  /**
   * Crea linklists vacío con configuración opcional
   */
  public createEmptyLinkLists(defaultMenus?: string[]): LinkLists {
    if (!defaultMenus) return {}

    const linkLists: LinkLists = {}

    for (const handle of defaultMenus) {
      linkLists[handle] = {
        title: this.config.defaultTitles?.[handle] || handle.replace('-', ' '),
        handle,
        links: [],
      }
    }

    return linkLists
  }
}

/**
 * Convierte un menú de navegación a formato LinkList
 */
function convertMenuToLinkList(
  menu: ProcessedNavigationMenu,
  config: MenuProcessingConfig
): LinkList {
  const handle = config.handleTransforms?.[menu.handle] || menu.handle
  const title = config.defaultTitles?.[handle] || menu.name

  return {
    title,
    handle,
    links: menu.items.map(item => ({
      title: item.title,
      url: item.url,
      active: item.active,
    })),
  }
}

// Exportar instancia con configuración por defecto
export const linkListService = new LinkListService('default')

// Exportar instancias con configuraciones específicas
export const shopifyLinkListService = new LinkListService('shopify')
export const flexibleLinkListService = new LinkListService('flexible')
