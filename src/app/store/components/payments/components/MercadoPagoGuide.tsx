'use client';

import { useState, ReactNode } from 'react';
import { Modal, Button, Text, LegacyStack, Link, Divider, Box, Icon } from '@shopify/polaris';
import { ExternalIcon } from '@shopify/polaris-icons';

interface MercadoPagoGuideProps {
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

export function MercadoPagoGuide({ trigger }: MercadoPagoGuideProps) {
  const [open, setOpen] = useState(false);
  const toggleModal = () => setOpen((prev) => !prev);

  const activator = trigger ? (
    <div onClick={toggleModal}>{trigger}</div>
  ) : (
    <Button onClick={toggleModal}>Guía de Activación Mercado Pago</Button>
  );

  const sections = [
    {
      title: '1. Obtener credenciales',
      items: [
        'Accede a tu cuenta de Mercado Pago y ve a la sección de Credenciales.',
        <>
          Obtén el <strong>Access Token</strong> y la <strong>Public Key</strong>.
        </>,
        'Guarda estas credenciales de forma segura.',
      ],
    },
    {
      title: '2. Configurar Checkout Pro',
      items: [
        'En tu plataforma, selecciona Mercado Pago como método de pago.',
        'Ingresa el Access Token y la Public Key.',
        'Personaliza las opciones del Checkout (logos, colores, etc.).',
      ],
    },
    {
      title: '3. Realizar pruebas en Sandbox',
      items: [
        'Activa el modo Sandbox en tu cuenta de Mercado Pago.',
        'Usa las tarjetas de prueba para simular transacciones.',
        'Verifica la integración de notificaciones para confirmar pagos.',
      ],
    },
    {
      title: '4. Activar modo producción',
      items: [
        'Cambia del modo Sandbox a Producción.',
        'Asegúrate de actualizar las credenciales y configuraciones.',
        'Realiza una transacción de prueba con una tarjeta real de bajo valor.',
      ],
    },
  ];

  const resources = [
    {
      text: 'Documentación oficial de Checkout Pro',
      url: 'https://www.mercadopago.com.ar/developers/es/guides/online-payments/checkout-pro/introduction',
    },
    {
      text: 'Portal para desarrolladores',
      url: 'https://www.mercadopago.com.ar/developers/es',
    },
    { text: 'Centro de ayuda y soporte', url: 'https://www.mercadopago.com.ar/ayuda' },
  ];

  return (
    <>
      {activator}
      <Modal
        open={open}
        onClose={toggleModal}
        title="Guía de Activación - Mercado Pago"
        secondaryActions={[{ content: 'Cerrar', onAction: toggleModal }]}>
        <Modal.Section>
          <LegacyStack vertical spacing="loose">
            <Text as="p" tone="subdued">
              Sigue estos pasos para implementar Checkout Pro de Mercado Pago en tu plataforma.
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
