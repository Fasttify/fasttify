import React from 'react';
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

export interface PasswordResetEmailProps {
  customerName?: string;
  resetCode?: string;
  storeName?: string;
  currentYear?: string;
}

const PasswordResetEmail = ({
  customerName = '{{customerName}}',
  resetCode = '{{resetCode}}',
  storeName = '{{storeName}}',
  currentYear = '{{currentYear}}',
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Restablece tu contraseña de Fasttify</Preview>
      <Container style={container}>
        {/* Header */}
        <Section style={header.container}>
          <Row>
            <Column align="center">
              <Text style={header.logoText}>Fasttify</Text>
            </Column>
          </Row>
        </Section>
        <Hr style={global.hr} />

        {/* Mensaje principal */}
        <Section style={message}>
          <Heading style={global.heading}>Restablecer Contraseña</Heading>
          <Text style={global.text}>Hola {customerName},</Text>
          <Text style={{ ...global.text, marginTop: 24 }}>
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en {storeName}.
          </Text>
          <Text style={{ ...global.text, marginTop: 16 }}>
            Utiliza el siguiente código de verificación para completar el proceso:
          </Text>
        </Section>

        {/* Código de verificación */}
        <Section style={global.defaultPadding}>
          <Row>
            <Column align="center">
              <Section style={codeContainer}>
                <Text style={codeText}>{resetCode}</Text>
              </Section>
            </Column>
          </Row>
        </Section>

        {/* Información adicional */}
        <Section style={global.defaultPadding}>
          <Text style={global.text}>
            Este código expirará en <strong>15 minutos</strong> por motivos de seguridad.
          </Text>
          <Text style={{ ...global.text, marginTop: 16 }}>
            Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña permanecerá sin cambios.
          </Text>
        </Section>
        <Hr style={global.hr} />

        {/* Footer */}
        <Section style={paddingY}>
          <Row>
            <Text style={global.heading}>Fasttify</Text>
          </Row>
          <Row style={categories.container}>
            <Column align="center">
              <Link href="https://fasttify.com/help" style={categories.text}>
                Centro de Ayuda
              </Link>
            </Column>
            <Column align="center">
              <Link href="https://fasttify.com/contact" style={categories.text}>
                Contactar Soporte
              </Link>
            </Column>
          </Row>
        </Section>
        <Hr style={{ ...global.hr, marginTop: '12px' }} />
        <Section style={paddingY}>
          <Row style={footer.policy}>
            <Column>
              <Text style={footer.text}>Versión Web</Text>
            </Column>
            <Column>
              <Text style={footer.text}>Política de Privacidad</Text>
            </Column>
          </Row>
          <Row>
            <Text style={{ ...footer.text, paddingTop: 30, paddingBottom: 30 }}>
              Si tienes alguna pregunta, no dudes en contactarnos. (Si respondes a este email, no podremos verlo.)
            </Text>
          </Row>
          <Row>
            <Text style={footer.text}>© {currentYear} Fasttify, Inc. Todos los derechos reservados.</Text>
          </Row>
          <Row>
            <Text style={footer.text}>FASTTIFY, INC. Plataforma de E-commerce para todos.</Text>
          </Row>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default PasswordResetEmail;

const paddingX = {
  paddingLeft: '40px',
  paddingRight: '40px',
};

const paddingY = {
  paddingTop: '22px',
  paddingBottom: '22px',
};

const paragraph = {
  margin: '0',
  lineHeight: '2',
};

const global = {
  paddingX,
  paddingY,
  defaultPadding: {
    ...paddingX,
    ...paddingY,
  },
  paragraphWithBold: { ...paragraph, fontWeight: 'bold' },
  heading: {
    fontSize: '32px',
    lineHeight: '1.3',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: '-1px',
  } as React.CSSProperties,
  text: {
    ...paragraph,
    color: '#747474',
    fontWeight: '500',
  },
  button: {
    border: '1px solid #929292',
    fontSize: '16px',
    textDecoration: 'none',
    padding: '10px 0px',
    width: '220px',
    display: 'block',
    textAlign: 'center',
    fontWeight: 500,
    color: '#000',
  } as React.CSSProperties,
  hr: {
    borderColor: '#E5E5E5',
    margin: '0',
  },
};

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '10px auto',
  width: '600px',
  maxWidth: '100%',
  border: '1px solid #E5E5E5',
};

const header = {
  container: {
    padding: '22px 40px',
    backgroundColor: '#F7F7F7',
    textAlign: 'center' as const,
  },
  logoText: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#000',
    margin: '0',
    letterSpacing: '-1px',
  },
};

const message = {
  padding: '40px 74px',
  textAlign: 'center' as const,
} as React.CSSProperties;

const codeContainer = {
  backgroundColor: '#F7F7F7',
  border: '2px dashed #E5E5E5',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
  textAlign: 'center' as const,
};

const codeText = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#000',
  letterSpacing: '4px',
  margin: '0',
  fontFamily: 'monospace',
} as React.CSSProperties;

const categories = {
  container: {
    width: '370px',
    margin: 'auto',
    paddingTop: '12px',
  },
  text: {
    fontWeight: '500',
    color: '#000',
  },
};

const footer = {
  policy: {
    width: '166px',
    margin: 'auto',
  },
  text: {
    margin: '0',
    color: '#AFAFAF',
    fontSize: '13px',
    textAlign: 'center',
  } as React.CSSProperties,
};
