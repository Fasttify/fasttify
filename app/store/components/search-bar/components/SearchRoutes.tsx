import { routes } from '@/utils/client/routes';
import {
  CreditCard,
  Globe,
  LayoutDashboard,
  LucideIcon,
  Package,
  Palette,
  Settings,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react';

// Definir la interfaz para las rutas de búsqueda
export interface SearchRoute {
  path: string;
  label: string;
  icon?: LucideIcon;
  section?: string;
  keywords?: string[];
}

// Función para generar las rutas de búsqueda basadas en el storeId
export function generateSearchRoutes(storeId: string): SearchRoute[] {
  if (!storeId) return [];

  return [
    // Dashboard
    {
      path: routes.store.dashboard.main(storeId),
      label: 'Dashboard',
      icon: LayoutDashboard,
      section: 'Tienda',
      keywords: ['inicio', 'panel', 'resumen', 'estadísticas'],
    },
    {
      path: routes.store.dashboard.statistics(storeId),
      label: 'Estadísticas',
      icon: LayoutDashboard,
      section: 'Dashboard',
      keywords: ['métricas', 'ventas', 'datos', 'análisis'],
    },
    // Productos
    {
      path: routes.store.products.main(storeId),
      label: 'Productos',
      icon: Package,
      section: 'Tienda',
      keywords: ['inventario', 'artículos', 'catálogo'],
    },
    {
      path: routes.store.products.add(storeId),
      label: 'Añadir Producto',
      icon: Package,
      section: 'Productos',
      keywords: ['nuevo', 'crear', 'agregar'],
    },
    {
      path: routes.store.categories(storeId),
      label: 'Categorías',
      icon: Package,
      section: 'Productos',
      keywords: ['clasificación', 'grupos', 'organizar'],
    },
    {
      path: routes.store.products.collections(storeId),
      label: 'Colecciones',
      icon: Package,
      section: 'Productos',
      keywords: ['colecciones', 'grupos', 'organizar'],
    },
    {
      path: routes.store.products.collectionsNew(storeId),
      label: 'Nueva Colección',
      icon: Package,
      section: 'Productos',
      keywords: ['colecciones', 'grupos', 'organizar'],
    },
    {
      path: routes.store.themes.main(storeId),
      label: 'Temas',
      icon: Palette,
      section: 'Temas',
      keywords: ['temas', 'diseño', 'estilo', 'personalización'],
    },
    {
      path: routes.store.setup.pages(storeId),
      label: 'Páginas',
      section: 'Páginas',
      keywords: ['páginas', 'contenido', 'estructura'],
    },
    {
      path: routes.store.products.inventory(storeId),
      label: 'Inventario',
      icon: Package,
      section: 'Productos',
      keywords: ['inventario', 'stock', 'disponibilidad'],
    },
    // Pedidos
    {
      path: routes.store.orders(storeId),
      label: 'Pedidos',
      icon: ShoppingCart,
      section: 'Tienda',
      keywords: ['ventas', 'compras', 'transacciones'],
    },
    // Clientes
    {
      path: routes.store.customers(storeId),
      label: 'Clientes',
      icon: Users,
      section: 'Tienda',
      keywords: ['compradores', 'usuarios', 'contactos'],
    },
    // Configuración
    {
      path: routes.store.settings(storeId),
      label: 'Configuración',
      icon: Settings,
      section: 'Tienda',
      keywords: ['ajustes', 'preferencias', 'opciones'],
    },
    // Configuración de tienda
    {
      path: routes.store.setup.main(storeId),
      label: 'Configuración de Tienda',
      icon: Settings,
      section: 'Configuración',
      keywords: ['setup', 'inicialización', 'preparación'],
    },
    {
      path: routes.store.setup.design(storeId),
      label: 'Diseño',
      icon: Palette,
      section: 'Configuración',
      keywords: ['apariencia', 'tema', 'estilo', 'personalización'],
    },
    {
      path: routes.store.setup.domain(storeId),
      label: 'Dominio',
      icon: Globe,
      section: 'Configuración',
      keywords: ['url', 'web', 'dirección'],
    },
    {
      path: routes.store.setup.shipping(storeId),
      label: 'Envíos',
      icon: Truck,
      section: 'Configuración',
      keywords: ['entrega', 'transporte', 'logística'],
    },
    {
      path: routes.store.setup.payments(storeId),
      label: 'Pagos',
      icon: CreditCard,
      section: 'Configuración',
      keywords: ['cobros', 'métodos de pago', 'transacciones'],
    },
  ];
}
