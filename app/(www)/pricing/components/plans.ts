const isProd = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production';

// IDs por entorno
const DEV_ROYAL_ID = 'd889915d-bb1a-4c54-badd-de697857e624';
const DEV_MAJESTIC_ID = '442aacda-1fa3-47cd-8fba-6ad028285218';
const DEV_IMPERIAL_ID = '21e675ee-db9d-4cd7-9902-0fead14a85f5';

const PROD_ROYAL_ID = 'e02f173f-1ca5-4f7b-a900-2e5c9413d8a6';
const PROD_MAJESTIC_ID = '149c6595-1611-477d-b0b4-61700d33c069';
const PROD_IMPERIAL_ID = '3a85e94a-7deb-4f94-8aa4-99a972406f0f';

const ROYAL_ID = isProd ? PROD_ROYAL_ID : DEV_ROYAL_ID;
const MAJESTIC_ID = isProd ? PROD_MAJESTIC_ID : DEV_MAJESTIC_ID;
const IMPERIAL_ID = isProd ? PROD_IMPERIAL_ID : DEV_IMPERIAL_ID;

export const plans = [
  {
    polarId: ROYAL_ID,
    name: 'Royal',
    title: '$55.000 COP/mes',
    price: '55000',
    description: 'Ideal para emprendedores individuales.',
    features: [
      'Asesoría por chat, email y WhatsApp.',
      'Hosting y SSL gratuitos.',
      'Venta en múltiples idiomas y moneda local.',
      'Panel de estadísticas básicas.',
      'Seguimiento de productos para vendedores y compradores.',
      'Optimización de precios con IA (básico).',
      'Hasta 5 plantillas para personalizar la tienda.',
    ],
    buttonText: 'Suscribirse ahora',
    className: 'bg-white',
  },
  {
    polarId: MAJESTIC_ID,
    name: 'Majestic',
    title: '$75.000 COP/mes',
    price: '75000',
    description: 'Para equipos pequeños que quieren crecer.',
    features: [
      'Todo en Royal.',
      'Panel de estadísticas avanzadas.',
      'Gestión de múltiples vendedores.',
      'Automatización de respuestas a clientes.',
      'Personalización avanzada con Strapi.',
      'Soporte prioritario 24/7.',
      'Integraciones con redes sociales.',
    ],
    buttonText: 'Suscribirse ahora',
    className: 'bg-white',
    popular: true,
  },
  {
    polarId: IMPERIAL_ID,
    name: 'Imperial',
    title: '$100.000 COP/mes',
    price: '100000',
    description: 'Para negocios en expansión con alto tráfico.',
    features: [
      'Todo en Majestic.',
      'Membresías y descuentos exclusivos para clientes.',
      'Almacenamiento y carga de productos sin límite.',
      'Gestión avanzada de pedidos y envíos.',
      'Marca blanca para personalización total.',
      'API para conectar con otros servicios.',
      'Analítica y reportes personalizados.',
      'Atención VIP con gestor de cuenta dedicado.',
    ],
    buttonText: 'Suscribirse ahora',
    className: 'bg-white',
  },
];

export const planFaqs = [
  {
    question: '¿Qué es Fasttify y cómo funciona?',
    paragraphs: [
      'Fasttify es una plataforma integral de comercio para que emprendedores y empresas inicien, administren y hagan crecer su negocio en línea, en tienda física y en cualquier canal digital.',
      'Estas son algunas de las cosas que puedes hacer con Fasttify:',
    ],
    bullets: [
      'Crear y personalizar una tienda online.',
      'Vender en web, móvil, redes sociales y tienda física.',
      'Gestionar productos, inventario, pagos y envíos.',
      'Crear, ejecutar y analizar campañas de marketing.',
    ],
  },
  {
    question: '¿Cuánto cuesta Fasttify?',
    paragraphs: [
      'Ofrecemos planes desde $55.000 COP/mes. Puedes elegir el plan que mejor se adapte a tu negocio y cambiar cuando lo necesites.',
    ],
  },
  {
    question: '¿Cuál es la duración de los contratos?',
    paragraphs: ['La suscripción es mensual y flexible; no hay contratos a largo plazo.'],
  },
  {
    question: '¿Puedo cancelar mi cuenta en cualquier momento?',
    paragraphs: ['Sí. Puedes cancelar o cambiar de plan cuando quieras desde la configuración de tu tienda.'],
  },
  {
    question: '¿Puedo cambiar mi plan más adelante?',
    paragraphs: ['Sí. Puedes escalar o reducir tu plan en cualquier momento según tus necesidades.'],
  },
  {
    question: '¿Ofrecen descuentos?',
    paragraphs: ['Periódicamente ofrecemos promociones. Si necesitas facturación anual o por volumen, contáctanos.'],
  },
  {
    question: '¿En qué países puedo usar Fasttify?',
    paragraphs: [
      'Fasttify funciona en la mayoría de países. La disponibilidad de métodos de pago puede variar por región.',
    ],
  },
  {
    question: '¿Fasttify es compatible con PCI o está certificado PCI?',
    paragraphs: [
      'Sí. Cumplimos con estándares de seguridad y buenas prácticas para el manejo de pagos y datos sensibles.',
    ],
  },
];
