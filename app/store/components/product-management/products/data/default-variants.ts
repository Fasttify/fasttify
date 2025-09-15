/**
 * Datos de variantes por defecto para productos
 * Basado en las mejores prácticas de e-commerce
 */

export interface DefaultVariantOption {
  value: string;
  label: string;
  color?: string; // Para variantes de color
  description?: string;
}

export interface DefaultVariant {
  name: string;
  label: string;
  options: DefaultVariantOption[];
  icon?: string;
  description?: string;
}

// Variantes por defecto disponibles
export const DEFAULT_VARIANTS: DefaultVariant[] = [
  {
    name: 'color',
    label: 'Color',
    description: 'Variantes de color para el producto',
    icon: 'color',
    options: [
      { value: 'beige', label: 'Beige', color: '#F5F5DC' },
      { value: 'black', label: 'Negro', color: '#000000' },
      { value: 'blue', label: 'Azul', color: '#0066CC' },
      { value: 'bronze', label: 'Bronce', color: '#CD7F32' },
      { value: 'brown', label: 'Marrón', color: '#8B4513' },
      { value: 'clear', label: 'Transparente', color: '#FFFFFF' },
      { value: 'gold', label: 'Dorado', color: '#FFD700' },
      { value: 'gray', label: 'Gris', color: '#808080' },
      { value: 'green', label: 'Verde', color: '#008000' },
      { value: 'navy', label: 'Azul marino', color: '#000080' },
      { value: 'orange', label: 'Naranja', color: '#FFA500' },
      { value: 'pink', label: 'Rosa', color: '#FFC0CB' },
      { value: 'purple', label: 'Morado', color: '#800080' },
      { value: 'red', label: 'Rojo', color: '#FF0000' },
      { value: 'silver', label: 'Plateado', color: '#C0C0C0' },
      { value: 'white', label: 'Blanco', color: '#FFFFFF' },
      { value: 'yellow', label: 'Amarillo', color: '#FFFF00' },
    ],
  },
  {
    name: 'size',
    label: 'Talla',
    description: 'Variantes de talla para ropa y calzado',
    icon: 'size',
    options: [
      { value: 'xs', label: 'XS' },
      { value: 's', label: 'S' },
      { value: 'm', label: 'M' },
      { value: 'l', label: 'L' },
      { value: 'xl', label: 'XL' },
      { value: 'xxl', label: 'XXL' },
      { value: 'xxxl', label: 'XXXL' },
    ],
  },
  {
    name: 'size-shoes',
    label: 'Talla de Calzado',
    description: 'Variantes de talla para calzado',
    icon: 'shoe',
    options: [
      { value: '35', label: '35' },
      { value: '36', label: '36' },
      { value: '37', label: '37' },
      { value: '38', label: '38' },
      { value: '39', label: '39' },
      { value: '40', label: '40' },
      { value: '41', label: '41' },
      { value: '42', label: '42' },
      { value: '43', label: '43' },
      { value: '44', label: '44' },
      { value: '45', label: '45' },
      { value: '46', label: '46' },
      { value: '47', label: '47' },
    ],
  },
  {
    name: 'material',
    label: 'Material',
    description: 'Variantes de material del producto',
    icon: 'material',
    options: [
      { value: 'cotton', label: 'Algodón' },
      { value: 'polyester', label: 'Poliéster' },
      { value: 'wool', label: 'Lana' },
      { value: 'leather', label: 'Cuero' },
      { value: 'synthetic', label: 'Sintético' },
      { value: 'silk', label: 'Seda' },
      { value: 'linen', label: 'Lino' },
      { value: 'denim', label: 'Denim' },
      { value: 'canvas', label: 'Lona' },
      { value: 'metal', label: 'Metal' },
      { value: 'plastic', label: 'Plástico' },
      { value: 'wood', label: 'Madera' },
      { value: 'glass', label: 'Vidrio' },
      { value: 'ceramic', label: 'Cerámica' },
    ],
  },
  {
    name: 'style',
    label: 'Estilo',
    description: 'Variantes de estilo del producto',
    icon: 'style',
    options: [
      { value: 'casual', label: 'Casual' },
      { value: 'formal', label: 'Formal' },
      { value: 'sport', label: 'Deportivo' },
      { value: 'vintage', label: 'Vintage' },
      { value: 'modern', label: 'Moderno' },
      { value: 'classic', label: 'Clásico' },
      { value: 'trendy', label: 'Tendencia' },
      { value: 'elegant', label: 'Elegante' },
      { value: 'bohemian', label: 'Bohemio' },
      { value: 'minimalist', label: 'Minimalista' },
    ],
  },
  {
    name: 'pattern',
    label: 'Estampado',
    description: 'Variantes de estampado o patrón',
    icon: 'pattern',
    options: [
      { value: 'solid', label: 'Liso' },
      { value: 'stripes', label: 'Rayas' },
      { value: 'polka-dots', label: 'Lunares' },
      { value: 'floral', label: 'Floral' },
      { value: 'geometric', label: 'Geométrico' },
      { value: 'abstract', label: 'Abstracto' },
      { value: 'animal-print', label: 'Estampado animal' },
      { value: 'plaid', label: 'Cuadros' },
      { value: 'paisley', label: 'Paisley' },
      { value: 'chevron', label: 'Chevron' },
    ],
  },
  {
    name: 'finish',
    label: 'Acabado',
    description: 'Variantes de acabado para productos',
    icon: 'finish',
    options: [
      { value: 'matte', label: 'Mate' },
      { value: 'glossy', label: 'Brillante' },
      { value: 'satin', label: 'Satinado' },
      { value: 'textured', label: 'Texturizado' },
      { value: 'smooth', label: 'Liso' },
      { value: 'rough', label: 'Rugoso' },
    ],
  },
  {
    name: 'capacity',
    label: 'Capacidad',
    description: 'Variantes de capacidad para productos',
    icon: 'capacity',
    options: [
      { value: '100ml', label: '100ml' },
      { value: '250ml', label: '250ml' },
      { value: '500ml', label: '500ml' },
      { value: '1l', label: '1L' },
      { value: '2l', label: '2L' },
      { value: '5l', label: '5L' },
      { value: '10l', label: '10L' },
    ],
  },
];

/**
 * Función para obtener una variante por defecto por nombre
 */
export function getDefaultVariant(name: string): DefaultVariant | undefined {
  return DEFAULT_VARIANTS.find((variant) => variant.name === name);
}

/**
 * Función para obtener todas las variantes disponibles
 */
export function getAllDefaultVariants(): DefaultVariant[] {
  return DEFAULT_VARIANTS;
}

/**
 * Función para buscar variantes por texto
 */
export function searchDefaultVariants(query: string): DefaultVariant[] {
  if (!query.trim()) return DEFAULT_VARIANTS;

  const searchRegex = new RegExp(query, 'i');
  return DEFAULT_VARIANTS.filter(
    (variant) => variant.label.match(searchRegex) || (variant.description && variant.description.match(searchRegex))
  );
}

/**
 * Función para obtener opciones de una variante específica
 */
export function getVariantOptions(variantName: string): DefaultVariantOption[] {
  const variant = getDefaultVariant(variantName);
  return variant ? variant.options : [];
}
