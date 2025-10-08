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

export interface WelcomeEmailProps {
  customerName?: string;
  trialEndDate?: string;
  storeName?: string;
  planName?: string;
  currentYear?: string;
}

const WelcomeEmail = ({
  customerName = '{{customerName}}',
  trialEndDate = '{{trialEndDate}}',
  storeName = '{{storeName}}',
  planName = '{{planName}}',
  currentYear = '{{currentYear}}',
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>¡Bienvenido a Fasttify! Tu prueba gratuita del plan Royal está activa</Preview>
      <Container style={container}>
        {/* Header con texto */}
        <Section style={header.container}>
          <Row>
            <Column align="center">
              <Text style={header.logoText}>Fasttify</Text>
            </Column>
          </Row>
        </Section>
        <Hr style={global.hr} />

        {/* Mensaje de bienvenida principal */}
        <Section style={message}>
          <Heading style={global.heading}>¡Bienvenido a Fasttify!</Heading>
          <Text style={global.text}>Hola {customerName}, ¡gracias por unirte a nuestra plataforma!</Text>
          <Text style={{ ...global.text, marginTop: 24 }}>
            Como muestra de agradecimiento, te ofrecemos <strong>7 días de suscripción gratuita</strong> al plan{' '}
            {planName} para que descubras todas nuestras funciones premium.
          </Text>
          <Text style={{ ...global.text, marginTop: 16 }}>
            Durante este periodo, tendrás acceso ilimitado a herramientas exclusivas, soporte prioritario y una
            plataforma diseñada para impulsar tu tienda online.
          </Text>
        </Section>
        <Hr style={global.hr} />

        {/* Información de la prueba */}
        <Section style={global.defaultPadding}>
          <Text style={trialInfo.title}>Detalles de tu Prueba Gratuita</Text>
          <Row style={{ display: 'inline-flex', marginBottom: 20 }}>
            <Column style={{ width: '170px' }}>
              <Text style={global.paragraphWithBold}>Plan Activo</Text>
              <Text style={trialInfo.value}>{planName}</Text>
            </Column>
            <Column style={{ width: '170px', marginLeft: '20px' }}>
              <Text style={global.paragraphWithBold}>Duración</Text>
              <Text style={trialInfo.value}>7 días</Text>
            </Column>
            <Column style={{ width: '170px', marginLeft: '20px' }}>
              <Text style={global.paragraphWithBold}>Finaliza</Text>
              <Text style={trialInfo.value}>{trialEndDate}</Text>
            </Column>
          </Row>
          <Row>
            <Column align="center">
              <Link href="https://www.fasttify.com/my-store" style={global.button}>
                Ir al Dashboard
              </Link>
            </Column>
          </Row>
        </Section>

        {/* Footer */}
        <Section style={paddingY}>
          <Row>
            <Text style={global.heading}>Fasttify</Text>
          </Row>
          <Row style={categories.container}>
            <Column align="center">
              <Link href="https://fasttify.com/stores" style={categories.text}>
                Tiendas
              </Link>
            </Column>
            <Column align="center">
              <Link href="https://fasttify.com/sellers" style={categories.text}>
                Vendedores
              </Link>
            </Column>
            <Column align="center">
              <Link href="https://fasttify.com/buyers" style={categories.text}>
                Compradores
              </Link>
            </Column>
            <Column align="center">
              <Link href="https://fasttify.com/terms" style={categories.text}>
                Acerca de
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

export default WelcomeEmail;

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

const trialInfo = {
  title: {
    ...paragraph,
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  value: {
    margin: '12px 0 0 0',
    fontWeight: 500,
    lineHeight: '1.4',
    color: '#6F6F6F',
  },
};

const recomendationsText = {
  margin: '0',
  fontSize: '15px',
  lineHeight: '1',
  paddingLeft: '10px',
  paddingRight: '10px',
};

const recomendations = {
  container: {
    padding: '20px 0',
  },
  product: {
    verticalAlign: 'top',
    textAlign: 'left' as const,
    paddingLeft: '2px',
    paddingRight: '2px',
  },
  title: { ...recomendationsText, paddingTop: '12px', fontWeight: '500' },
  text: {
    ...recomendationsText,
    paddingTop: '4px',
    color: '#747474',
  },
};

const features = {
  container: {
    padding: '10px 0',
  },
  item: {
    verticalAlign: 'top',
    textAlign: 'left' as const,
    paddingLeft: '10px',
    paddingRight: '10px',
    marginBottom: '20px',
  },
  title: {
    margin: '0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#000',
  },
  text: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    color: '#747474',
  },
};

const menu = {
  container: {
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingTop: '20px',
    backgroundColor: '#F7F7F7',
  },
  content: {
    ...paddingY,
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  title: {
    paddingLeft: '20px',
    paddingRight: '20px',
    fontWeight: 'bold',
  },
  text: {
    fontSize: '13.5px',
    marginTop: 0,
    fontWeight: 500,
    color: '#000',
  },
  tel: {
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingTop: '32px',
    paddingBottom: '22px',
  },
};

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
