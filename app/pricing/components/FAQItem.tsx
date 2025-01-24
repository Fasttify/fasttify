interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
}

export const faqItems: FAQItem[] = [
  {
    question: "¿Hay una prueba gratuita disponible?",
    answer:
      "Sí, puedes probar nuestro servicio gratis durante 14 días. Si lo deseas, te ofreceremos una llamada de orientación personalizada de 30 minutos para que empieces a usarlo lo antes posible.",
  },
  {
    question: "¿Puedo cambiar mi plan más adelante?",
    answer:
      "Sí, puedes cambiar tu plan en cualquier momento. Si mejoras tu plan, el nuevo precio se prorrateará para el resto de tu período de facturación.",
  },
  {
    question: "¿Cuál es su política de cancelación?",
    answer:
      "Puedes cancelar tu suscripción en cualquier momento. Una vez cancelada, tendrás acceso a tu cuenta hasta el final de tu período de facturación.",
  },
  {
    question: "¿Se puede agregar otra información a una factura?",
    answer:
      "Sí, puedes agregar información adicional a tus facturas, como la dirección de tu empresa, número de IVA o requisitos específicos de facturación.",
  },
  {
    question: "¿Cómo funciona la facturación?",
    answer:
      "Facturamos mensualmente o anualmente, según tu preferencia. Todos los planes se facturan por adelantado y se renuevan automáticamente a menos que se cancelen.",
  },
  {
    question: "¿Cómo cambio el correo electrónico de mi cuenta?",
    answer:
      "Puedes cambiar el correo electrónico de tu cuenta desde la página de configuración de tu cuenta. Se enviará una confirmación a tu nueva dirección de correo electrónico.",
  },
];
