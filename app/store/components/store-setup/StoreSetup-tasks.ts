import { routes } from '@/utils/routes'

export interface Task {
  id: number
  title: string
  description: string
  learnMoreLink?: string
  actions?: {
    primary?: {
      text: string
      href?: string
      getHref?: (storeId: string) => string
    }
    secondary?: {
      text: string
      href?: string
      getHref?: (storeId: string) => string
    }
  }
  imageUrl?: string
  completed: boolean
}

// Default store setup tasks
export const defaultStoreTasks: Task[] = [
  {
    id: 1,
    title: 'Agrega tu primer producto',
    description: 'Sube imágenes, describe tu producto y fija su precio.',
    learnMoreLink: '#',
    actions: {
      primary: {
        text: 'Agregar producto',
        getHref: (storeId: string) => routes.store.products.add(storeId),
      },
      secondary: {
        text: 'Importar productos',
        getHref: (storeId: string) => `${routes.store.products.main(storeId)}/import`,
      },
    },
    imageUrl: '/svgs/product.svg',
    completed: false,
  },
  {
    id: 2,
    title: 'Personaliza el diseño de tu tienda',
    description:
      'Elige un tema y personaliza los colores, fuentes y diseño general de tu tienda para reflejar tu marca.',
    learnMoreLink: '#',
    actions: {
      primary: {
        text: 'Personalizar diseño',
        getHref: (storeId: string) => routes.store.setup.main(storeId),
      },
    },
    imageUrl: '/svgs/personalized.svg',
    completed: false,
  },
  {
    id: 3,
    title: 'Configura tu dominio personalizado',
    description:
      'Conecta un dominio existente o compra uno nuevo para darle a tu tienda una dirección web profesional.',
    actions: {
      primary: {
        text: 'Configurar dominio',
        getHref: (storeId: string) => routes.store.setup.domain(storeId),
      },
      secondary: {
        text: 'Comprar dominio',
        getHref: (storeId: string) => `${routes.store.setup.domain(storeId)}/buy`,
      },
    },
    imageUrl: '/svgs/domain.svg',
    completed: false,
  },
  {
    id: 4,
    title: 'Elige un nombre para tu tienda',
    description:
      'Define el nombre de tu negocio que aparecerá en tu tienda, facturas y comunicaciones con clientes.',
    actions: {
      primary: {
        text: 'Editar nombre',
        getHref: (storeId: string) => routes.store.setup.domain(storeId),
      },
    },
    imageUrl: '/svgs/name.svg',
    completed: false,
  },
  {
    id: 5,
    title: 'Define tus tarifas de envío',
    description:
      'Configura las zonas de envío, métodos y tarifas para que tus clientes puedan recibir sus productos.',
    learnMoreLink: '#',
    actions: {
      primary: {
        text: 'Configurar envíos',
        getHref: (storeId: string) => routes.store.setup.shipping(storeId),
      },
    },
    imageUrl: '/svgs/shipping.svg',
    completed: false,
  },
  {
    id: 6,
    title: 'Habilita los métodos de pago',
    description:
      'Conecta pasarelas de pago para que tus clientes puedan completar sus compras con diferentes métodos.',
    actions: {
      primary: {
        text: 'Configurar pagos',
        getHref: (storeId: string) => routes.store.setup.payments(storeId),
      },
    },
    imageUrl:
      'https://images.unsplash.com/vector-1739891945507-20fd57d98b67?q=80&w=2360&auto=format&fit=crop',
    completed: false,
  },
  {
    id: 7,
    title: 'Realiza una compra de prueba',
    description:
      'Verifica que todo funcione correctamente realizando una compra de prueba en tu tienda.',
    learnMoreLink: '#',
    actions: {
      primary: {
        text: 'Iniciar prueba',
        getHref: (storeId: string) => routes.store.setup.testOrder(storeId),
      },
    },
    imageUrl: '/svgs/test.svg',
    completed: false,
  },
]
