import React from 'react';
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

export interface OrderConfirmationEmailProps {
  customerName: string;
  orderId: string;
  total: string;
  orderDate: string;
  storeName: string;
}

const OrderConfirmationEmail = ({
  customerName = '{{customerName}}',
  orderId = '{{orderId}}',
  total = '{{total}}',
  orderDate = '{{orderDate}}',
  storeName = '{{storeName}}',
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>¡Gracias por tu pedido! Tu confirmación y detalles dentro.</Preview>
      <Container style={container}>
        <Section style={track.container}>
          <Row>
            <Column>
              <Text style={global.paragraphWithBold}>Número de Pedido</Text>
              <Text style={track.number}>{orderId}</Text>
            </Column>
            <Column align="right">
              <Link style={global.button}>Ver Pedido</Link>
            </Column>
          </Row>
        </Section>
        <Hr style={global.hr} />
        <Section style={message}>
          <Heading style={global.heading}>¡Pedido Confirmado!</Heading>
          <Text style={global.text}>Hola {customerName}, hemos recibido tu pedido correctamente.</Text>
          <Text style={{ ...global.text, marginTop: 24 }}>
            Tu pedido está siendo procesado por {storeName}. Recibirás una notificación cuando sea enviado con la
            información de seguimiento.
          </Text>
        </Section>
        <Hr style={global.hr} />
        <Section style={global.defaultPadding}>
          <Text style={adressTitle}>Cliente: {customerName}</Text>
          <Text style={{ ...global.text, fontSize: 14 }}>Tienda: {storeName}</Text>
        </Section>
        <Hr style={global.hr} />
        <Section style={global.defaultPadding}>
          <Row style={{ display: 'inline-flex', marginBottom: 40 }}>
            <Column style={{ width: '170px' }}>
              <Text style={global.paragraphWithBold}>Número de Pedido</Text>
              <Text style={track.number}>{orderId}</Text>
            </Column>
            <Column>
              <Text style={global.paragraphWithBold}>Fecha del Pedido</Text>
              <Text style={track.number}>{orderDate}</Text>
            </Column>
          </Row>
          <Row style={{ display: 'inline-flex', marginBottom: 40 }}>
            <Column style={{ width: '170px' }}>
              <Text style={global.paragraphWithBold}>Total</Text>
              <Text style={track.number}>{total}</Text>
            </Column>
            <Column>
              <Text style={global.paragraphWithBold}>Tienda</Text>
              <Text style={track.number}>{storeName}</Text>
            </Column>
          </Row>
          <Row>
            <Column align="center">
              <Link style={global.button}>Estado del Pedido</Link>
            </Column>
          </Row>
        </Section>
        <Hr style={global.hr} />
        <Section style={paddingY}>
          <Row>
            <Text style={global.heading}>Próximos Pasos</Text>
          </Row>
          <Row style={recomendations.container}>
            <Column style={{ ...recomendations.product, paddingLeft: '4px' }} align="center">
              <Text style={recomendations.title}>📦 Procesamiento</Text>
              <Text style={recomendations.text}>Tu pedido está siendo preparado por {storeName}</Text>
            </Column>
            <Column style={recomendations.product} align="center">
              <Text style={recomendations.title}>🚚 Envío</Text>
              <Text style={recomendations.text}>Recibirás el número de seguimiento cuando sea enviado</Text>
            </Column>
            <Column style={recomendations.product} align="center">
              <Text style={recomendations.title}>📱 Notificaciones</Text>
              <Text style={recomendations.text}>Te mantendremos informado del estado</Text>
            </Column>
            <Column style={{ ...recomendations.product, paddingRight: '4px' }} align="center">
              <Text style={recomendations.title}>✅ Entrega</Text>
              <Text style={recomendations.text}>Recibirás tu pedido en la dirección indicada</Text>
            </Column>
          </Row>
        </Section>
        <Hr style={global.hr} />
        <Section style={menu.container}>
          <Row>
            <Text style={menu.title}>¿Necesitas Ayuda?</Text>
          </Row>
          <Row style={menu.content}>
            <Column style={{ width: '33%' }} colSpan={1}>
              <Link href="https://fasttify.com/orders" style={menu.text}>
                Estado del Pedido
              </Link>
            </Column>
            <Column style={{ width: '33%' }} colSpan={1}>
              <Link href="https://fasttify.com/shipping" style={menu.text}>
                Envíos y Entregas
              </Link>
            </Column>
            <Column style={{ width: '33%' }} colSpan={1}>
              <Link href="https://fasttify.com/returns" style={menu.text}>
                Devoluciones
              </Link>
            </Column>
          </Row>
          <Row style={{ ...menu.content, paddingTop: '0' }}>
            <Column style={{ width: '33%' }} colSpan={1}>
              <Link href="https://fasttify.com/help" style={menu.text}>
                Centro de Ayuda
              </Link>
            </Column>
            <Column style={{ width: '66%' }} colSpan={2}>
              <Link href="https://fasttify.com/contact" style={menu.text}>
                Contactar Soporte
              </Link>
            </Column>
          </Row>
          <Hr style={global.hr} />
          <Row style={menu.tel}>
            <Column>
              <Text style={{ ...menu.text, marginBottom: '0' }}>📧 support@fasttify.com</Text>
            </Column>
            <Column>
              <Text
                style={{
                  ...menu.text,
                  marginBottom: '0',
                }}>
                24/7 Disponible
              </Text>
            </Column>
          </Row>
        </Section>
        <Hr style={global.hr} />
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
              <Link href="https://fasttify.com/about" style={categories.text}>
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
            <Text style={footer.text}>© 2024 Fasttify, Inc. Todos los derechos reservados.</Text>
          </Row>
          <Row>
            <Text style={footer.text}>FASTTIFY, INC. Plataforma de E-commerce para todos.</Text>
          </Row>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;

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

const track = {
  container: {
    padding: '22px 40px',
    backgroundColor: '#F7F7F7',
  },
  number: {
    margin: '12px 0 0 0',
    fontWeight: 500,
    lineHeight: '1.4',
    color: '#6F6F6F',
  },
};

const message = {
  padding: '40px 74px',
  textAlign: 'center',
} as React.CSSProperties;

const adressTitle = {
  ...paragraph,
  fontSize: '15px',
  fontWeight: 'bold',
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
