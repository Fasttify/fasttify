export interface NavItem {
  label: string;
  highlight: {
    title: string;
    description: string;
    subtitle: string;
  };
  content: {
    title: string;
    href: string;
    description: string;
  }[];
}

export const navItems: NavItem[] = [
  {
    label: 'Productos',
    highlight: {
      title: 'Una única plataforma para todas tus necesidades',
      description: 'Simplifica tu integración, maximiza tu alcance',
      subtitle: 'Unifica tu lógica de negocio',
    },
    content: [
      {
        title: 'Características',
        href: '/#integraciones',
        description: 'Explora todas las características y capacidades de nuestra plataforma.',
      },
      {
        title: 'Casos de Uso',
        href: '/#casos',
        description: 'Descubre cómo otros clientes están usando nuestra plataforma.',
      },
    ],
  },
  {
    label: 'Recursos',
    highlight: {
      title: 'Recursos completos para tu éxito',
      description: 'Todo lo que necesitas para crecer',
      subtitle: 'Potencia tu negocio',
    },
    content: [
      {
        title: 'Integraciones',
        href: '/#integraciones',
        description: 'Integraciones y actualización de nuestra plataforma',
      },
      {
        title: 'Multiplataforma',
        href: '/#multiplataforma',
        description: 'Guías detalladas y documentación técnica.',
      },
      {
        title: 'Contacto',
        href: '/#contacto',
        description: 'Ponte en contacto con nuestro equipo de soporte.',
      },
    ],
  },
];
