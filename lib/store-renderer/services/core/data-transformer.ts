export class DataTransformer {
  /**
   * Crea un handle SEO-friendly a partir de un texto
   */
  public static createHandle(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[áàäâã]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöôõ]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  /**
   * Formatea un precio para mostrar en pesos colombianos
   */
  public static formatPrice(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  /**
   * Transforma array de imágenes desde JSON string o array
   */
  public static transformImages(images: any, productName: string): any[] {
    let imagesArray = []
    if (images) {
      if (typeof images === 'string') {
        try {
          imagesArray = JSON.parse(images)
        } catch (error) {
          console.warn('Error parsing product images JSON:', error)
          imagesArray = []
        }
      } else if (Array.isArray(images)) {
        imagesArray = images
      }
    }

    return Array.isArray(imagesArray)
      ? imagesArray.map((img: any) => ({
          url: img.url || img.src || '',
          alt: img.altText || img.alt || productName || '',
        }))
      : []
  }

  /**
   * Transforma array de variantes desde JSON string o array
   */
  public static transformVariants(variants: any, basePrice: number): any[] {
    let variantsArray = []
    if (variants) {
      if (typeof variants === 'string') {
        try {
          variantsArray = JSON.parse(variants)
        } catch (error) {
          console.warn('Error parsing product variants JSON:', error)
          variantsArray = []
        }
      } else if (Array.isArray(variants)) {
        variantsArray = variants
      }
    }

    return Array.isArray(variantsArray)
      ? variantsArray.map((variant: any) => ({
          id: variant.id,
          title: variant.title || variant.name || 'Default',
          price: this.formatPrice(variant.price || basePrice || 0),
          available: (variant.quantity || variant.stock || 0) > 0,
          sku: variant.sku,
        }))
      : []
  }

  /**
   * Transforma array de atributos
   */
  public static transformAttributes(attributes: any): any[] {
    return Array.isArray(attributes)
      ? attributes.map((attribute: any) => ({
          name: attribute.name,
          values: attribute.values,
        }))
      : []
  }
}

export const dataTransformer = DataTransformer
