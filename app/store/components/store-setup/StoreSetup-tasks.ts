export interface Task {
  id: number
  title: string
  description: string
  learnMoreLink?: string
  actions?: {
    primary?: {
      text: string
      href?: string
    }
    secondary?: {
      text: string
      href?: string
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
        href: '/products/new',
      },
      secondary: {
        text: 'Importar productos',
        href: '/products/import',
      },
    },
    imageUrl:
      'https://images.unsplash.com/vector-1738317129462-9ba78746ceb2?q=80&w=2360&auto=format&fit=crop',
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
        href: '/design',
      },
    },
    imageUrl: '/placeholder.svg?height=60&width=80',
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
        href: '/settings/domain',
      },
      secondary: {
        text: 'Comprar dominio',
        href: '/settings/domain/buy',
      },
    },
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
        href: '/settings/general',
      },
    },
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
        href: '/settings/shipping',
      },
    },
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
        href: '/settings/payments',
      },
    },
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
        href: '/test-order',
      },
    },
    completed: false,
  },
]
