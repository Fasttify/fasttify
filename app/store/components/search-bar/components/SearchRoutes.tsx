import { routes } from '@/utils/client/routes';
import {
  CreditCardIcon,
  GlobeIcon,
  HomeIcon,
  PackageIcon,
  ColorIcon,
  SettingsIcon,
  CartIcon,
  DeliveryIcon,
  ProfileIcon,
  ChartLineIcon,
  PageIcon,
} from '@shopify/polaris-icons';

// Definir la interfaz para las rutas de búsqueda
export interface SearchRoute {
  path: string;
  label: string;
  icon?: React.ComponentType<any>;
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
      icon: ChartLineIcon,
      section: 'Tienda',
      keywords: ['inicio', 'panel', 'resumen', 'analíticas'],
    },
    {
      path: routes.store.dashboard.analytics(storeId),
      label: 'Analíticas',
      icon: ChartLineIcon,
      section: 'Dashboard',
      keywords: ['métricas', 'ventas', 'datos', 'análisis'],
    },
    // Productos
    {
      path: routes.store.products.main(storeId),
      label: 'Productos',
      icon: PackageIcon,
      section: 'Tienda',
      keywords: ['inventario', 'artículos', 'catálogo'],
    },
    {
      path: routes.store.products.add(storeId),
      label: 'Añadir Producto',
      icon: PackageIcon,
      section: 'Productos',
      keywords: ['nuevo', 'crear', 'agregar'],
    },
    {
      path: routes.store.categories(storeId),
      label: 'Categorías',
      icon: PackageIcon,
      section: 'Productos',
      keywords: ['clasificación', 'grupos', 'organizar'],
    },
    {
      path: routes.store.products.collections(storeId),
      label: 'Colecciones',
      icon: PackageIcon,
      section: 'Productos',
      keywords: ['colecciones', 'grupos', 'organizar'],
    },
    {
      path: routes.store.products.collectionsNew(storeId),
      label: 'Nueva Colección',
      icon: PackageIcon,
      section: 'Productos',
      keywords: ['colecciones', 'grupos', 'organizar'],
    },
    {
      path: routes.store.themes.main(storeId),
      label: 'Temas',
      icon: ColorIcon,
      section: 'Temas',
      keywords: ['temas', 'diseño', 'estilo', 'personalización'],
    },
    {
      path: routes.store.setup.pages(storeId),
      label: 'Páginas',
      icon: PageIcon,
      section: 'Páginas',
      keywords: ['páginas', 'contenido', 'estructura'],
    },
    {
      path: routes.store.products.inventory(storeId),
      label: 'Inventario',
      icon: PackageIcon,
      section: 'Productos',
      keywords: ['inventario', 'stock', 'disponibilidad'],
    },
    // Pedidos
    {
      path: routes.store.orders.main(storeId),
      label: 'Pedidos',
      icon: CartIcon,
      section: 'Tienda',
      keywords: ['ventas', 'compras', 'transacciones'],
    },
    {
      path: routes.store.orders.checkouts(storeId),
      label: 'Checkouts',
      icon: CartIcon,
      section: 'Tienda',
      keywords: ['ventas', 'compras', 'transacciones'],
    },
    // Clientes
    {
      path: routes.store.customers(storeId),
      label: 'Clientes',
      icon: ProfileIcon,
      section: 'Tienda',
      keywords: ['compradores', 'usuarios', 'contactos'],
    },
    // Configuración
    {
      path: routes.store.settings(storeId),
      label: 'Configuración',
      icon: SettingsIcon,
      section: 'Tienda',
      keywords: ['ajustes', 'preferencias', 'opciones'],
    },
    // Configuración de tienda
    {
      path: routes.store.setup.main(storeId),
      label: 'Configuración de Tienda',
      icon: SettingsIcon,
      section: 'Configuración',
      keywords: ['setup', 'inicialización', 'preparación'],
    },
    {
      path: routes.store.setup.design(storeId),
      label: 'Diseño',
      icon: ColorIcon,
      section: 'Configuración',
      keywords: ['apariencia', 'tema', 'estilo', 'personalización'],
    },
    {
      path: routes.store.setup.domain(storeId),
      label: 'Dominio',
      icon: GlobeIcon,
      section: 'Configuración',
      keywords: ['url', 'web', 'dirección'],
    },
    {
      path: routes.store.setup.shipping(storeId),
      label: 'Envíos',
      icon: DeliveryIcon,
      section: 'Configuración',
      keywords: ['entrega', 'transporte', 'logística'],
    },
    {
      path: routes.store.setup.payments(storeId),
      label: 'Pagos',
      icon: CreditCardIcon,
      section: 'Configuración',
      keywords: ['cobros', 'métodos de pago', 'transacciones'],
    },
    {
      path: routes.store.setup.navigation(storeId),
      label: 'Navegación',
      icon: HomeIcon,
      section: 'Configuración',
      keywords: ['navegación', 'estructura', 'menú'],
    },
  ];
}
