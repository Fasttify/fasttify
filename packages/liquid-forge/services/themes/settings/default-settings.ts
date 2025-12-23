import { ColorParser } from './color-parser';
import { FontParser } from './font-parser';
import type { ColorScheme } from './types';

/**
 * Generador de settings por defecto
 * Proporciona valores seguros cuando no se encuentra configuración del tema
 */
export class DefaultSettingsProvider {
  /**
   * Retorna settings por defecto mínimos cuando no se encuentra configuración
   * @returns Objeto con valores por defecto para evitar errores de renderizado
   */
  public static getDefaults(): Record<string, any> {
    // Esquema de color por defecto (blanco y negro)
    const defaultColorScheme: ColorScheme = {
      id: 'scheme-1',
      settings: {
        background: ColorParser.hexToRgb('#FFFFFF'),
        background_gradient: '',
        text: ColorParser.hexToRgb('#000000'),
        button: ColorParser.hexToRgb('#000000'),
        button_label: ColorParser.hexToRgb('#FFFFFF'),
        secondary_button_label: ColorParser.hexToRgb('#000000'),
        shadow: ColorParser.hexToRgb('#000000'),
      },
    };

    return {
      // Fuentes
      type_body_font: FontParser.parse('assistant_n4'),
      type_header_font: FontParser.parse('assistant_n4'),
      body_scale: 100,
      heading_scale: 100,

      // Esquemas de color
      color_schemes: [defaultColorScheme],

      // Dimensiones
      page_width: 1200,
      spacing_sections: 0,
      spacing_grid_horizontal: 8,
      spacing_grid_vertical: 8,

      // Media (valores explícitos para evitar "0px" sin número)
      media_padding: 0,
      media_border_thickness: 1,
      media_border_opacity: 5,
      media_radius: 0,
      media_shadow_opacity: 0,
      media_shadow_horizontal_offset: 0,
      media_shadow_vertical_offset: 0,
      media_shadow_blur: 0,

      // Botones
      buttons_border_thickness: 1,
      buttons_border_opacity: 100,
      buttons_radius: 0,
      buttons_shadow_opacity: 0,
      buttons_shadow_horizontal_offset: 0,
      buttons_shadow_vertical_offset: 4,
      buttons_shadow_blur: 5,

      // Inputs
      inputs_border_thickness: 1,
      inputs_border_opacity: 55,
      inputs_radius: 0,
      inputs_shadow_opacity: 0,
      inputs_shadow_horizontal_offset: 0,
      inputs_shadow_vertical_offset: 0,
      inputs_shadow_blur: 0,

      // Cards de productos
      card_image_padding: 0,
      card_text_alignment: 'left',
      card_border_thickness: 0,
      card_border_opacity: 10,
      card_corner_radius: 0,
      card_shadow_opacity: 0,
      card_shadow_horizontal_offset: 0,
      card_shadow_vertical_offset: 0,
      card_shadow_blur: 0,

      // Cards de colecciones
      collection_card_image_padding: 0,
      collection_card_text_alignment: 'left',
      collection_card_border_thickness: 0,
      collection_card_border_opacity: 10,
      collection_card_corner_radius: 0,
      collection_card_shadow_opacity: 0,
      collection_card_shadow_horizontal_offset: 0,
      collection_card_shadow_vertical_offset: 0,
      collection_card_shadow_blur: 0,

      // Cards de blog
      blog_card_image_padding: 0,
      blog_card_text_alignment: 'left',
      blog_card_border_thickness: 0,
      blog_card_border_opacity: 10,
      blog_card_corner_radius: 0,
      blog_card_shadow_opacity: 0,
      blog_card_shadow_horizontal_offset: 0,
      blog_card_shadow_vertical_offset: 0,
      blog_card_shadow_blur: 0,

      // Otros elementos
      badge_corner_radius: 40,
      variant_pills_border_thickness: 1,
      variant_pills_border_opacity: 55,
      variant_pills_radius: 40,
      variant_pills_shadow_opacity: 0,
      variant_pills_shadow_horizontal_offset: 0,
      variant_pills_shadow_vertical_offset: 0,
      variant_pills_shadow_blur: 0,
    };
  }
}
