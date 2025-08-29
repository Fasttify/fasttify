import React from 'react';
import { Html, Head, Body, Container, Heading, Text, Section, Hr, Button, Tailwind } from '@react-email/components';

export interface PromotionEmailProps {
  customerName: string;
  title: string;
  content: string;
  discountCode?: string;
  discountPercentage?: string;
  storeName: string;
  ctaText?: string;
  ctaUrl?: string;
  expirationDate?: string;
}

const PromotionEmail: React.FC<PromotionEmailProps> = ({
  customerName,
  title,
  content,
  discountCode,
  discountPercentage,
  storeName,
  ctaText,
  ctaUrl,
  expirationDate,
}) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white mx-auto max-w-2xl rounded-lg shadow-lg overflow-hidden my-8">
            {/* Header */}
            <Section className="bg-red-600 text-white text-center py-8 px-6">
              <Heading className="text-3xl font-bold m-0">{title}</Heading>
            </Section>

            {/* Content */}
            <Section className="p-8">
              <Text className="text-gray-700 text-base leading-6 mb-4">Hola {customerName},</Text>

              {/* Promotion Content */}
              <Section className="bg-orange-50 rounded-lg p-6 mb-6 border border-orange-200">
                <Text className="text-gray-800 text-base leading-6 mb-0 mt-0">{content}</Text>
              </Section>

              {/* Discount Code */}
              {discountCode && (
                <Section className="bg-green-50 rounded-lg p-6 mb-6 text-center border-2 border-dashed border-green-400">
                  <Text className="text-gray-800 text-lg font-medium mb-2 mt-0">
                    {discountPercentage ? `¡${discountPercentage} de descuento!` : 'Código de descuento:'}
                  </Text>
                  <Text className="text-red-600 text-2xl font-bold mb-2 mt-0 bg-white inline-block px-4 py-2 rounded border border-gray-300 tracking-widest">
                    {discountCode}
                  </Text>
                  {expirationDate && (
                    <Text className="text-gray-600 text-sm italic mb-0 mt-2">Válido hasta: {expirationDate}</Text>
                  )}
                </Section>
              )}

              {/* Call to Action */}
              {ctaText && ctaUrl && (
                <Section className="text-center my-8">
                  <Button
                    href={ctaUrl}
                    className="bg-red-600 text-white font-semibold py-4 px-8 rounded-lg text-lg no-underline inline-block">
                    {ctaText}
                  </Button>
                </Section>
              )}

              <Hr className="border-gray-300 my-8" />

              <Text className="text-gray-500 text-sm text-center mb-4 mt-0">
                Saludos,
                <br />
                Equipo de {storeName}
              </Text>

              <Text className="text-gray-400 text-xs text-center mb-0 mt-0">
                Si no deseas recibir más promociones, puedes{' '}
                <a href="#" className="text-gray-500 underline">
                  darte de baja aquí
                </a>
                .
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PromotionEmail;
