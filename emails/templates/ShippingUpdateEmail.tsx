import React from 'react';
import { Html, Head, Body, Container, Heading, Text, Section, Hr, Button, Tailwind } from '@react-email/components';

export interface ShippingUpdateEmailProps {
  customerName: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  storeName: string;
  trackingUrl?: string;
}

const ShippingUpdateEmail: React.FC<ShippingUpdateEmailProps> = ({
  customerName,
  orderId,
  trackingNumber,
  carrier,
  storeName,
  trackingUrl,
}) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white mx-auto max-w-2xl rounded-lg shadow-lg overflow-hidden my-8">
            {/* Header */}
            <Section className="bg-green-600 text-white text-center py-8 px-6">
              <Heading className="text-2xl font-semibold m-0">¡Tu pedido está en camino!</Heading>
            </Section>

            {/* Content */}
            <Section className="p-8">
              <Text className="text-gray-700 text-base leading-6 mb-4">Hola {customerName},</Text>
              <Text className="text-gray-700 text-base leading-6 mb-6">
                Tu pedido <strong>#{orderId}</strong> ha sido enviado.
              </Text>

              {/* Shipping Details */}
              <Section className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                <Heading className="text-gray-900 text-lg font-medium mb-4 mt-0">Información de envío:</Heading>
                <Text className="text-gray-800 text-base mb-2 mt-0">
                  <strong>Número de seguimiento:</strong> {trackingNumber}
                </Text>
                <Text className="text-gray-800 text-base mb-0 mt-0">
                  <strong>Transportadora:</strong> {carrier}
                </Text>
              </Section>

              {/* Tracking Button */}
              {trackingUrl && (
                <Section className="text-center my-8">
                  <Button
                    href={trackingUrl}
                    className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-base no-underline inline-block">
                    Rastrear Paquete
                  </Button>
                </Section>
              )}

              <Text className="text-gray-700 text-base leading-6 mb-6">
                Puedes rastrear tu paquete usando el número de seguimiento proporcionado.
              </Text>

              <Hr className="border-gray-300 my-8" />

              <Text className="text-gray-500 text-sm text-center mb-0 mt-0">
                Saludos,
                <br />
                Equipo de {storeName}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ShippingUpdateEmail;
