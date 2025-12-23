import type { FontObject } from './types';

/**
 * Parser de fuentes de Shopify
 * Convierte strings como "murecho_n4" en objetos con propiedades
 */
export class FontParser {
  /**
   * Base de datos de fuentes comunes con sus familias
   * Cada fuente incluye su nombre de familia y fallbacks apropiados
   */
  private static readonly FONT_DATABASE: Record<string, { family: string; fallbacks: string }> = {
    murecho: { family: 'Murecho', fallbacks: 'sans-serif' },
    assistant: { family: 'Assistant', fallbacks: 'sans-serif' },
    work_sans: { family: 'Work Sans', fallbacks: 'sans-serif' },
    roboto: { family: 'Roboto', fallbacks: 'sans-serif' },
    open_sans: { family: 'Open Sans', fallbacks: 'sans-serif' },
    lato: { family: 'Lato', fallbacks: 'sans-serif' },
    montserrat: { family: 'Montserrat', fallbacks: 'sans-serif' },
    poppins: { family: 'Poppins', fallbacks: 'sans-serif' },
    raleway: { family: 'Raleway', fallbacks: 'sans-serif' },
    pt_sans: { family: 'PT Sans', fallbacks: 'sans-serif' },
    source_sans_pro: { family: 'Source Sans Pro', fallbacks: 'sans-serif' },
    oswald: { family: 'Oswald', fallbacks: 'sans-serif' },
    playfair_display: { family: 'Playfair Display', fallbacks: 'serif' },
    merriweather: { family: 'Merriweather', fallbacks: 'serif' },
    crimson_text: { family: 'Crimson Text', fallbacks: 'serif' },
  };

  /**
   * Parsea un string de fuente de Shopify y retorna un objeto de fuente
   * @param fontString - String en formato Shopify (ej: "murecho_n4")
   *                     Formato: fontname_[style][weight]
   *                     - style: 'n' = normal, 'i' = italic
   *                     - weight: 1-9 (multiplicar por 100 para peso CSS)
   * @returns Objeto de fuente con propiedades family, fallback_families, style y weight
   */
  public static parse(fontString: string): FontObject {
    if (!fontString) {
      return this.getDefaultFont();
    }

    // Separar el nombre de la fuente del style y weight
    const parts = fontString.split('_');
    const fontName = parts[0] || '';
    const styleWeight = parts[1] || 'n4';

    // Extraer style e weight
    const style = styleWeight.charAt(0) === 'i' ? 'italic' : 'normal';
    const weightChar = styleWeight.charAt(1) || '4';
    const weight = parseInt(weightChar) * 100;

    // Buscar la familia de la fuente
    const fontInfo = this.FONT_DATABASE[fontName.toLowerCase()] || {
      family: this.formatFontFamily(fontName),
      fallbacks: 'sans-serif',
    };

    return {
      family: fontInfo.family,
      fallback_families: fontInfo.fallbacks,
      style,
      weight,
    };
  }

  /**
   * Formatea el nombre de la fuente a un nombre legible
   * @param fontName - Nombre de la fuente en formato snake_case
   * @returns Nombre formateado en Title Case
   */
  private static formatFontFamily(fontName: string): string {
    if (!fontName) return 'Arial';
    return fontName
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Retorna una fuente por defecto
   */
  private static getDefaultFont(): FontObject {
    return {
      family: 'Arial',
      fallback_families: 'sans-serif',
      style: 'normal',
      weight: 400,
    };
  }
}
