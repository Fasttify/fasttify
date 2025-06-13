export type Asset = {
  content: string
  id: string
}

/**
 * Colecta los contenidos de las etiquetas {% style %} y {% javascript %}
 * durante el renderizado de Liquid para inyectarlos en el layout principal.
 */
export class AssetCollector {
  private cssAssets: Asset[] = []
  private jsAssets: Asset[] = []
  private readonly uniqueIds: Set<string> = new Set()

  /**
   * Agrega contenido CSS al colector.
   * @param content - El código CSS a agregar.
   * @param sectionId - Un ID único para la sección o el asset para evitar duplicados.
   */
  public addCss(content: string, sectionId: string): void {
    const uniqueId = `css-${sectionId}`
    if (!this.uniqueIds.has(uniqueId)) {
      this.cssAssets.push({ content, id: uniqueId })
      this.uniqueIds.add(uniqueId)
    }
  }

  /**
   * Agrega contenido JavaScript al colector.
   * @param content - El código JavaScript a agregar.
   * @param sectionId - Un ID único para la sección o el asset para evitar duplicados.
   */
  public addJs(content: string, sectionId: string): void {
    const uniqueId = `js-${sectionId}`
    if (!this.uniqueIds.has(uniqueId)) {
      this.jsAssets.push({ content, id: uniqueId })
      this.uniqueIds.add(uniqueId)
    }
  }

  /**
   * Recupera todo el CSS recolectado en una única cadena.
   * @returns Una cadena de texto con todo el CSS.
   */
  public getCombinedCss(): string {
    if (this.cssAssets.length === 0) return ''
    return this.cssAssets.map(asset => asset.content).join('\n')
  }

  /**
   * Recupera todo el JS recolectado en una única cadena.
   * @returns Una cadena de texto con todo el JS.
   */
  public getCombinedJs(): string {
    if (this.jsAssets.length === 0) return ''
    return this.jsAssets.map(asset => asset.content).join('\n')
  }

  /**
   * Limpia todos los assets recolectados para un nuevo renderizado.
   */
  public clear(): void {
    this.cssAssets = []
    this.jsAssets = []
    this.uniqueIds.clear()
  }
}
