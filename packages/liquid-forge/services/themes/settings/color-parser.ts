import type { ColorRGB } from './types';

/**
 * Parser de colores hexadecimales
 * Convierte colores hex (#FFFFFF) a objetos RGB con propiedades individuales
 */
export class ColorParser {
  /**
   * Convierte un color hexadecimal a un objeto RGB
   * @param hexColor - Color en formato hexadecimal (ej: "#FFFFFF", "#FFF")
   * @returns Objeto con propiedades red, green, blue, rgb y hex
   */
  public static hexToRgb(hexColor: string): ColorRGB {
    if (!hexColor || typeof hexColor !== 'string') {
      return this.getDefaultColor();
    }

    // Guardar el hex original (normalizado a formato largo con #)
    const originalHex = hexColor.startsWith('#') ? hexColor : `#${hexColor}`;

    // Eliminar el # si existe
    const hex = hexColor.replace('#', '');

    // Manejar formato corto (#FFF) y largo (#FFFFFF)
    let r: number, g: number, b: number;
    let normalizedHex: string;

    if (hex.length === 3) {
      r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
      // Normalizar a formato largo
      normalizedHex = `#${hex.charAt(0)}${hex.charAt(0)}${hex.charAt(1)}${hex.charAt(1)}${hex.charAt(2)}${hex.charAt(2)}`;
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      normalizedHex = `#${hex}`;
    } else {
      return this.getDefaultColor();
    }

    // Validar valores
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return this.getDefaultColor();
    }

    // Crear objeto con método toString para que Liquid lo convierta correctamente
    const colorObj: ColorRGB = {
      red: r,
      green: g,
      blue: b,
      rgb: `${r},${g},${b}`,
      hex: normalizedHex.toUpperCase(),
    };

    // Agregar método toString para que se convierta correctamente en templates
    Object.defineProperty(colorObj, 'toString', {
      value: function () {
        return this.hex;
      },
      enumerable: false,
    });

    return colorObj;
  }

  /**
   * Retorna un color por defecto (blanco)
   */
  private static getDefaultColor(): ColorRGB {
    const colorObj: ColorRGB = {
      red: 255,
      green: 255,
      blue: 255,
      rgb: '255,255,255',
      hex: '#FFFFFF',
    };

    // Agregar método toString
    Object.defineProperty(colorObj, 'toString', {
      value: function () {
        return this.hex;
      },
      enumerable: false,
    });

    return colorObj;
  }
}
