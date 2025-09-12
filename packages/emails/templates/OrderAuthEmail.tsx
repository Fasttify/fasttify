import React from 'react';
import { Html, Head, Body, Container, Button, Text, Heading, Hr, Section } from '@react-email/components';

interface OrderAuthEmailProps {
  token: string;
  email: string;
  storeName: string;
}

export const OrderAuthEmail: React.FC<OrderAuthEmailProps> = ({ token, email, storeName }) => {
  const authUrl = `${process.env.NEXT_PUBLIC_ORDERS_URL || 'http://orders.localhost:3000'}/auth?token=${token}&email=${email}`;

  return (
    <Html>
      <Head />
      <Body
        style={{
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f6f9fc',
          margin: 0,
          padding: 0,
        }}>
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '40px 20px',
          }}>
          {/* Header */}
          <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Heading
              style={{
                color: '#1a1a1a',
                fontSize: '28px',
                margin: '0 0 10px 0',
                fontWeight: '600',
              }}>
              🛍️ {storeName}
            </Heading>
            <Text
              style={{
                color: '#666666',
                fontSize: '16px',
                margin: '0',
              }}>
              Acceso a tus Órdenes
            </Text>
          </Section>

          <Hr
            style={{
              border: 'none',
              borderTop: '1px solid #e1e5e9',
              margin: '30px 0',
            }}
          />

          {/* Content */}
          <Section style={{ marginBottom: '30px' }}>
            <Text
              style={{
                color: '#1a1a1a',
                fontSize: '18px',
                margin: '0 0 20px 0',
                lineHeight: '1.5',
              }}>
              ¡Hola! 👋
            </Text>

            <Text
              style={{
                color: '#333333',
                fontSize: '16px',
                margin: '0 0 20px 0',
                lineHeight: '1.6',
              }}>
              Has solicitado acceder a tus órdenes en <strong>{storeName}</strong>. Para continuar, haz clic en el botón
              de abajo:
            </Text>

            <Button
              href={authUrl}
              style={{
                backgroundColor: '#007bff',
                color: '#ffffff',
                padding: '16px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                display: 'inline-block',
                textAlign: 'center',
                minWidth: '200px',
              }}>
              Ver Mis Órdenes
            </Button>
          </Section>

          {/* Security Notice */}
          <Section
            style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '30px',
            }}>
            <Text
              style={{
                color: '#666666',
                fontSize: '14px',
                margin: '0 0 10px 0',
                fontWeight: '600',
              }}>
              🔒 Información de Seguridad
            </Text>
            <Text
              style={{
                color: '#666666',
                fontSize: '14px',
                margin: '0',
                lineHeight: '1.5',
              }}>
              Este enlace es único y expira en <strong>24 horas</strong> por tu seguridad. Si no solicitaste este
              acceso, puedes ignorar este email.
            </Text>
          </Section>

          {/* Footer */}
          <Hr
            style={{
              border: 'none',
              borderTop: '1px solid #e1e5e9',
              margin: '30px 0',
            }}
          />

          <Section style={{ textAlign: 'center' }}>
            <Text
              style={{
                color: '#999999',
                fontSize: '12px',
                margin: '0',
              }}>
              © {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
            </Text>
            <Text
              style={{
                color: '#999999',
                fontSize: '12px',
                margin: '5px 0 0 0',
              }}>
              Si tienes problemas, contacta al soporte de tu tienda.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
