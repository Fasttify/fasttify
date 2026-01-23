export interface CategoryOption {
  value: string;
  label: string;
  hasChildren?: boolean;
  parentId?: string;
  level: number;
  description?: string;
}

export interface CategoryHierarchy {
  [key: string]: CategoryOption;
}

// Datos de categorías jerárquicas
export const categoryHierarchy: CategoryOption[] = [
  // Categorías principales (nivel 0)
  {
    value: 'ropa',
    label: 'Ropa',
    hasChildren: true,
    level: 0,
    description: 'Todo tipo de ropa y accesorios de vestir',
  },
  {
    value: 'electronicos',
    label: 'Electrónica',
    hasChildren: true,
    level: 0,
    description: 'Dispositivos electrónicos y tecnología',
  },
  {
    value: 'hogar',
    label: 'Hogar y Cocina',
    hasChildren: true,
    level: 0,
    description: 'Productos para el hogar y la cocina',
  },
  {
    value: 'belleza',
    label: 'Belleza y Cuidado Personal',
    hasChildren: true,
    level: 0,
    description: 'Productos de belleza y cuidado personal',
  },
  {
    value: 'deporte',
    label: 'Deportes y Aire Libre',
    hasChildren: true,
    level: 0,
    description: 'Artículos deportivos y actividades al aire libre',
  },
  {
    value: 'otros',
    label: 'Otros',
    hasChildren: false,
    level: 0,
    description: 'Otras categorías no especificadas',
  },
  {
    value: 'no-categorizado',
    label: 'No categorizado',
    hasChildren: false,
    level: 0,
    description: 'Productos sin categoría específica',
  },

  // Subcategorías de Ropa (nivel 1)
  {
    value: 'ropa-hombre',
    label: 'Ropa de Hombre',
    parentId: 'ropa',
    level: 1,
    description: 'Ropa específica para hombres',
  },
  {
    value: 'ropa-mujer',
    label: 'Ropa de Mujer',
    parentId: 'ropa',
    level: 1,
    description: 'Ropa específica para mujeres',
  },
  {
    value: 'ropa-ninos',
    label: 'Ropa de Niños',
    parentId: 'ropa',
    level: 1,
    description: 'Ropa para niños y niñas',
  },
  {
    value: 'ropa-bebes',
    label: 'Ropa de Bebés',
    parentId: 'ropa',
    level: 1,
    description: 'Ropa para bebés y recién nacidos',
  },

  // Subcategorías de Electrónica (nivel 1)
  {
    value: 'electronica-telefonos',
    label: 'Teléfonos y Accesorios',
    parentId: 'electronicos',
    level: 1,
    description: 'Teléfonos móviles y sus accesorios',
  },
  {
    value: 'electronica-computadoras',
    label: 'Computadoras y Laptops',
    parentId: 'electronicos',
    level: 1,
    description: 'Computadoras de escritorio y portátiles',
  },
  {
    value: 'electronica-audio',
    label: 'Audio y Sonido',
    parentId: 'electronicos',
    level: 1,
    description: 'Equipos de audio y sonido',
  },
  {
    value: 'electronica-hogar',
    label: 'Electrodomésticos',
    parentId: 'electronicos',
    level: 1,
    description: 'Electrodomésticos para el hogar',
  },

  // Subcategorías de Hogar (nivel 1)
  {
    value: 'hogar-cocina',
    label: 'Cocina y Comedor',
    parentId: 'hogar',
    level: 1,
    description: 'Utensilios y accesorios para cocina',
  },
  {
    value: 'hogar-dormitorio',
    label: 'Dormitorio',
    parentId: 'hogar',
    level: 1,
    description: 'Muebles y accesorios para dormitorio',
  },
  {
    value: 'hogar-sala',
    label: 'Sala y Comedor',
    parentId: 'hogar',
    level: 1,
    description: 'Muebles para sala y comedor',
  },
  {
    value: 'hogar-jardin',
    label: 'Jardín y Exterior',
    parentId: 'hogar',
    level: 1,
    description: 'Productos para jardín y exteriores',
  },

  // Subcategorías de Belleza (nivel 1)
  {
    value: 'belleza-cuidado-piel',
    label: 'Cuidado de la Piel',
    parentId: 'belleza',
    level: 1,
    description: 'Productos para el cuidado de la piel',
  },
  {
    value: 'belleza-maquillaje',
    label: 'Maquillaje',
    parentId: 'belleza',
    level: 1,
    description: 'Productos de maquillaje',
  },
  {
    value: 'belleza-cabello',
    label: 'Cuidado del Cabello',
    parentId: 'belleza',
    level: 1,
    description: 'Productos para el cuidado del cabello',
  },
  {
    value: 'belleza-perfumes',
    label: 'Perfumes y Fragancias',
    parentId: 'belleza',
    level: 1,
    description: 'Perfumes y fragancias',
  },

  // Subcategorías de Deportes (nivel 1)
  {
    value: 'deporte-fitness',
    label: 'Fitness y Gimnasio',
    parentId: 'deporte',
    level: 1,
    description: 'Equipos y accesorios para fitness',
  },
  {
    value: 'deporte-outdoor',
    label: 'Deportes al Aire Libre',
    parentId: 'deporte',
    level: 1,
    description: 'Deportes y actividades al aire libre',
  },
  {
    value: 'deporte-acuaticos',
    label: 'Deportes Acuáticos',
    parentId: 'deporte',
    level: 1,
    description: 'Deportes y actividades acuáticas',
  },
  {
    value: 'deporte-equipamiento',
    label: 'Equipamiento Deportivo',
    parentId: 'deporte',
    level: 1,
    description: 'Equipamiento general para deportes',
  },
];

// Función para obtener categorías por nivel
export function getCategoriesByLevel(level: number): CategoryOption[] {
  return categoryHierarchy.filter((category) => category.level === level);
}

// Función para obtener subcategorías de una categoría padre
export function getSubcategories(parentId: string): CategoryOption[] {
  return categoryHierarchy.filter((category) => category.parentId === parentId);
}

// Función para obtener una categoría por su ID
export function getCategoryById(id: string): CategoryOption | undefined {
  return categoryHierarchy.find((category) => category.value === id);
}

// Función para obtener la ruta completa de una categoría
export function getCategoryPath(categoryId: string): CategoryOption[] {
  const path: CategoryOption[] = [];
  let currentCategory = getCategoryById(categoryId);

  while (currentCategory) {
    path.unshift(currentCategory);
    if (currentCategory.parentId) {
      currentCategory = getCategoryById(currentCategory.parentId);
    } else {
      break;
    }
  }

  return path;
}

// Función para buscar categorías por texto
export function searchCategories(query: string): CategoryOption[] {
  if (!query.trim()) return getCategoriesByLevel(0);

  const searchRegex = new RegExp(query, 'i');
  return categoryHierarchy.filter(
    (category) => category.label.match(searchRegex) || (category.description && category.description.match(searchRegex))
  );
}
