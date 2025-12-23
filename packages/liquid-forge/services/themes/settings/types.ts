/**
 * Interfaz para un objeto de fuente parseado
 */
export interface FontObject {
  family: string;
  fallback_families: string;
  style: string;
  weight: number;
}

/**
 * Interfaz para un objeto de color RGB
 */
export interface ColorRGB {
  red: number;
  green: number;
  blue: number;
  rgb: string;
  hex: string;
}

/**
 * Interfaz para un esquema de color
 */
export interface ColorScheme {
  id: string;
  settings: {
    background: ColorRGB;
    background_gradient: string;
    text: ColorRGB;
    button: ColorRGB;
    button_label: ColorRGB;
    secondary_button_label: ColorRGB;
    shadow: ColorRGB;
    [key: string]: ColorRGB | string;
  };
}
