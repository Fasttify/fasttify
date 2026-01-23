'use client';

import { useState, ReactNode } from 'react';
import { Modal, Button, Text, LegacyStack, Link, Divider, Box, Icon } from '@shopify/polaris';
import { ExternalIcon } from '@shopify/polaris-icons';

interface WompiGuideProps {
  trigger?: ReactNode;
}

const GuideSection = ({ title, items }: { title: string; items: ReactNode[] }) => (
  <LegacyStack vertical spacing="baseTight">
    <Text variant="headingMd" as="h3">
      {title}
    </Text>
    <Box paddingInlineStart="400">
      <ul style={{ listStyleType: 'disc', margin: 0, paddingLeft: '20px' }}>
        {items.map((item, index) => (
          <li key={index}>
            <Text as="p">{item}</Text>
          </li>
        ))}
      </ul>
    </Box>
  </LegacyStack>
);

export function WompiGuide({ trigger }: WompiGuideProps) {
  const [open, setOpen] = useState(false);
  const toggleModal = () => setOpen((prev) => !prev);

  const activator = trigger ? (
    <div onClick={toggleModal}>{trigger}</div>
  ) : (
    <Button onClick={toggleModal}>Guía de Activación de Wompi</Button>
  );

  const sections = [
    {
      title: '1. Obtener las claves API',
      items: [
        <>
          Navega a <strong>Desarrolladores &gt; Claves API</strong>.
        </>,
        'Encontrarás dos entornos: Sandbox (pruebas) y Producción (real).',
        'Copia la Llave pública, Llave privada y Llave de eventos para cada entorno.',
        'Guarda estas claves de forma segura.',
      ],
    },
    {
      title: '2. Configurar la integración',
      items: [
        'En tu plataforma, selecciona Wompi como método de pago.',
        'Ingresa las claves API obtenidas.',
        'Configura la URL de redirección y los webhooks.',
      ],
    },
    {
      title: '3. Realizar pruebas en Sandbox',
      items: [
        'Usa las tarjetas de prueba de Wompi (VISA 4242..., MASTERCARD 5031...).',
        'Realiza transacciones de prueba para verificar el flujo completo.',
        'Verifica que los webhooks funcionen correctamente.',
      ],
    },
    {
      title: '4. Activar modo producción',
      items: [
        'Cambia las claves de Sandbox por las de Producción.',
        'Actualiza las URLs de los webhooks.',
        'Realiza una transacción de prueba con una tarjeta real de bajo valor.',
      ],
    },
  ];

  const resources = [
    { text: 'Documentación oficial de Wompi', url: 'https://docs.wompi.co/' },
    { text: 'Blog de Wompi con tutoriales', url: 'https://wompi.co/blog' },
    { text: 'Soporte técnico de Wompi', url: 'https://wompi.co/contacto' },
  ];

  return (
    <>
      {activator}
      <Modal
        open={open}
        onClose={toggleModal}
        title="Guía de Activación de Wompi"
        secondaryActions={[{ content: 'Cerrar', onAction: toggleModal }]}>
        <Modal.Section>
          <LegacyStack vertical spacing="loose">
            <Text as="p" tone="subdued">
              Sigue estos pasos para activar la pasarela de pago Wompi en tu plataforma.
            </Text>
            {sections.map((section, index) => (
              <LegacyStack vertical spacing="loose" key={section.title}>
                {index > 0 && <Divider />}
                <GuideSection title={section.title} items={section.items} />
              </LegacyStack>
            ))}
            <Divider />
            <GuideSection
              title="Recursos adicionales"
              items={resources.map((resource) => (
                <Link url={resource.url} target="_blank" key={resource.text}>
                  <LegacyStack alignment="center" spacing="extraTight">
                    <Text as="span">{resource.text}</Text>
                    <Icon source={ExternalIcon} />
                  </LegacyStack>
                </Link>
              ))}
            />
          </LegacyStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
