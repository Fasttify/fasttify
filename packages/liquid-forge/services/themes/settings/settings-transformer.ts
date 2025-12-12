import { ColorParser } from './color-parser';
import { FontParser } from './font-parser';
import type { ColorScheme } from './types';

/**
 * Transformador de settings del tema
 * Procesa y convierte los valores crudos de settings_data.json a formatos usables en templates
 */
export class SettingsTransformer {
  /**
   * Transforma los settings del tema procesando fuentes, colores y valores especiales
   * @param settings - Settings crudos desde settings_data.json
   * @returns Settings transformados listos para usar en templates Liquid
   */
  public transform(settings: Record<string, any>): Record<string, any> {
    const transformed: Record<string, any> = {};

    // Agregar settings mínimos requeridos si no existen
    const requiredNumericSettings = [
      'media_padding',
      'media_border_thickness',
      'media_border_opacity',
      'media_radius',
      'media_shadow_opacity',
      'media_shadow_horizontal_offset',
      'media_shadow_vertical_offset',
      'media_shadow_blur',
    ];

    // Procesar cada setting individualmente
    for (const [key, value] of Object.entries(settings)) {
      if (key === 'color_schemes') {
        // Transformar color_schemes de objeto a array con colores RGB
        transformed[key] = this.transformColorSchemes(value);
      } else if (this.isFontSetting(key)) {
        // Transformar font strings a objetos
        transformed[key] = typeof value === 'string' ? FontParser.parse(value) : value;
      } else if (value === undefined || value === null) {
        // Proporcionar valores por defecto según el tipo de setting
        transformed[key] = this.getDefaultValue(key);
      } else {
        // Mantener el valor original
        transformed[key] = value;
      }
    }

    // Asegurar que existen los settings numéricos requeridos
    for (const requiredKey of requiredNumericSettings) {
      if (
        !(requiredKey in transformed) ||
        transformed[requiredKey] === undefined ||
        transformed[requiredKey] === null
      ) {
        transformed[requiredKey] = 0;
      }
    }

    return transformed;
  }

  /**
   * Determina si un setting key corresponde a una fuente
   * @param key - Nombre del setting
   * @returns true si es un setting de fuente
   */
  private isFontSetting(key: string): boolean {
    return (
      key.includes('font') ||
      key === 'type_body_font' ||
      key === 'type_header_font' ||
      key === 'heading_font' ||
      key === 'body_font'
    );
  }

  /**
   * Transforma color_schemes de objeto a array de esquemas con colores RGB
   * @param colorSchemes - Objeto con esquemas de color
   * @returns Array de esquemas con colores convertidos a RGB
   */
  private transformColorSchemes(colorSchemes: Record<string, any>): ColorScheme[] {
    if (!colorSchemes || typeof colorSchemes !== 'object') {
      return [];
    }

    const schemes: ColorScheme[] = [];

    for (const [schemeId, schemeData] of Object.entries(colorSchemes)) {
      if (!schemeData || typeof schemeData !== 'object' || !schemeData.settings) {
        continue;
      }

      const schemeSettings: Record<string, any> = {};

      // Transformar cada color hex a RGB, pero mantener gradientes como string
      for (const [settingKey, settingValue] of Object.entries(schemeData.settings)) {
        if (settingKey === 'background_gradient') {
          // Los gradientes se mantienen como string
          schemeSettings[settingKey] = settingValue || '';
        } else if (typeof settingValue === 'string' && settingValue.startsWith('#')) {
          // Convertir colores hex a RGB
          schemeSettings[settingKey] = ColorParser.hexToRgb(settingValue);
        } else {
          // Mantener otros valores tal cual
          schemeSettings[settingKey] = settingValue || '';
        }
      }

      // Asegurar que el ID sea un string primitivo y esté disponible
      const scheme: any = {
        id: String(schemeId), // Forzar a string primitivo
        settings: schemeSettings,
      };

      // Asegurar que cuando Liquid acceda a scheme.id, obtenga el string correcto
      // Esto previene que se convierta a [object Object]
      Object.defineProperty(scheme, 'toString', {
        value: function () {
          return this.id;
        },
        enumerable: false,
      });

      schemes.push(scheme);
    }

    return schemes;
  }

  /**
   * Obtiene un valor por defecto apropiado según el tipo de setting
   * @param key - Nombre del setting
   * @returns Valor por defecto apropiado
   */
  private getDefaultValue(key: string): number | string {
    // Settings que requieren valores numéricos específicos
    if (key.includes('scale')) {
      return 100;
    }

    // Settings de dimensiones (deben ser 0, no undefined)
    if (
      key.includes('width') ||
      key.includes('padding') ||
      key.includes('spacing') ||
      key.includes('radius') ||
      key.includes('offset') ||
      key.includes('blur') ||
      key.includes('thickness')
    ) {
      return 0;
    }

    // Settings de opacidad y porcentajes
    if (key.includes('opacity')) {
      return 0;
    }

    // Settings de shadow
    if (key.includes('shadow')) {
      return 0;
    }

    // Por defecto, string vacío
    return '';
  }
}
