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

export interface OrderStatusUpdateEmailProps {
  customerName: string;
  orderId: string;
  total: string;
  orderDate: string;
  storeName: string;
  previousOrderStatus: string;
  newOrderStatus: string;
  previousPaymentStatus: string;
  newPaymentStatus: string;
  shippingAddress?: string;
  billingAddress?: string;
  updateNotes?: string;
}

const OrderStatusUpdateEmail = ({
  customerName = '{{customerName}}',
  orderId = '{{orderId}}',
  total = '{{total}}',
  storeName = '{{storeName}}',
  previousOrderStatus = '{{previousOrderStatus}}',
  newOrderStatus = '{{newOrderStatus}}',
  previousPaymentStatus = '{{previousPaymentStatus}}',
  newPaymentStatus = '{{newPaymentStatus}}',
  shippingAddress = '{{shippingAddress}}',
  billingAddress = '{{billingAddress}}',
  updateNotes = '{{updateNotes}}',
}: OrderStatusUpdateEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Actualización del estado de tu pedido - {storeName}</Preview>
      <Container style={container}>
        <Section style={track.container}>
          <Row>
            <Column>
              <Text style={global.paragraphWithBold}>Número de Pedido</Text>
              <Text style={track.number}>{orderId}</Text>
            </Column>
            <Column align="right">
              <Link href="https://orders.fasttify.com" style={global.button}>
                Ver Pedido
              </Link>
            </Column>
          </Row>
        </Section>
        <Hr style={global.hr} />
        <Section style={message}>
          <Heading style={global.heading}>¡Estado del Pedido Actualizado!</Heading>
          <Text style={global.text}>Hola {customerName}, tu pedido ha sido actualizado.</Text>
          <Text style={{ ...global.text, marginTop: 24 }}>
            {storeName} ha actualizado el estado de tu pedido. Aquí tienes los detalles de la actualización.
          </Text>
        </Section>
        <Hr style={global.hr} />

        {/* Cambios en el estado del pedido */}
        <Section style={global.defaultPadding}>
          <Text style={updateTitle}>Cambios en el Estado del Pedido</Text>
          <Row style={{ display: 'inline-flex', marginBottom: 20 }}>
            <Column style={{ width: '200px' }}>
              <Text style={global.paragraphWithBold}>Estado Anterior</Text>
              <Text style={statusText.previous}>{previousOrderStatus}</Text>
            </Column>
            <Column style={{ width: '50px', textAlign: 'center' }}>
              <Text style={statusText.arrow}>→</Text>
            </Column>
            <Column style={{ width: '200px' }}>
              <Text style={global.paragraphWithBold}>Nuevo Estado</Text>
              <Text style={statusText.new}>{newOrderStatus}</Text>
            </Column>
          </Row>
        </Section>

        {/* Cambios en el estado de pago */}
        <Section style={global.defaultPadding}>
          <Text style={updateTitle}>Cambios en el Estado de Pago</Text>
          <Row style={{ display: 'inline-flex', marginBottom: 20 }}>
            <Column style={{ width: '200px' }}>
              <Text style={global.paragraphWithBold}>Estado Anterior</Text>
              <Text style={statusText.previous}>{previousPaymentStatus}</Text>
            </Column>
            <Column style={{ width: '50px', textAlign: 'center' }}>
              <Text style={statusText.arrow}>→</Text>
            </Column>
            <Column style={{ width: '200px' }}>
              <Text style={global.paragraphWithBold}>Nuevo Estado</Text>
              <Text style={statusText.new}>{newPaymentStatus}</Text>
            </Column>
          </Row>
        </Section>

        {/* Notas de actualización */}
        {updateNotes && (
          <>
            <Hr style={global.hr} />
            <Section style={global.defaultPadding}>
              <Text style={updateTitle}>Notas de la Actualización</Text>
              <Text style={{ ...global.text, fontSize: 14, fontStyle: 'italic' }}>{updateNotes}</Text>
            </Section>
          </>
        )}

        <Hr style={global.hr} />
        <Section style={global.defaultPadding}>
          <Text style={adressTitle}>Envío a: {customerName}</Text>
          <Text style={{ ...global.text, fontSize: 14 }}>{shippingAddress}</Text>
        </Section>
        <Hr style={global.hr} />

        {/* Dirección de facturación */}
        {billingAddress && billingAddress !== shippingAddress && (
          <>
            <Section style={global.defaultPadding}>
              <Text style={adressTitle}>Facturación:</Text>
              <Text style={{ ...global.text, fontSize: 14 }}>{billingAddress}</Text>
            </Section>
            <Hr style={global.hr} />
          </>
        )}

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
          </Row>
          <Row style={{ display: 'inline-flex', marginBottom: 40 }}>
            <Column style={{ width: '170px' }}>
              <Text style={global.paragraphWithBold}>Total</Text>
              <Text style={track.number}>{total}</Text>
            </Column>
            <Column>
              <Text style={global.paragraphWithBold}>Estado Actual</Text>
              <Text style={track.number}>{newOrderStatus}</Text>
            </Column>
          </Row>
          <Row style={{ display: 'inline-flex', marginBottom: 40 }}>
            <Column style={{ width: '170px' }}>
              <Text style={global.paragraphWithBold}>Tienda</Text>
              <Text style={track.number}>{storeName}</Text>
            </Column>
            <Column>
              <Text style={global.paragraphWithBold}>Estado de Pago</Text>
              <Text style={track.number}>{newPaymentStatus}</Text>
            </Column>
          </Row>
          <Row>
            <Column align="center">
              <Link href="https://orders.fasttify.com" style={global.button}>
                Estado del Pedido
              </Link>
            </Column>
          </Row>
        </Section>
        <Hr style={global.hr} />

        <Section style={paddingY}>
          <Row>
            <Text style={global.heading}>¿Qué significa este cambio?</Text>
          </Row>
          <Row style={recomendations.container}>
            <Column style={{ ...recomendations.product, paddingLeft: '4px' }} align="center">
              <Text style={recomendations.title}>📦 Procesamiento</Text>
              <Text style={recomendations.text}>Tu pedido está siendo preparado</Text>
            </Column>
            <Column style={recomendations.product} align="center">
              <Text style={recomendations.title}>🚚 Envío</Text>
              <Text style={recomendations.text}>Tu pedido está en camino</Text>
            </Column>
            <Column style={recomendations.product} align="center">
              <Text style={recomendations.title}>💳 Pago</Text>
              <Text style={recomendations.text}>Estado de tu transacción</Text>
            </Column>
            <Column style={{ ...recomendations.product, paddingRight: '4px' }} align="center">
              <Text style={recomendations.title}>✅ Entrega</Text>
              <Text style={recomendations.text}>Tu pedido ha llegado</Text>
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
              <Link href="https://orders.fasttify.com" style={menu.text}>
                Estado del Pedido
              </Link>
            </Column>
            <Column style={{ width: '33%' }} colSpan={1}>
              <Link href="https://orders.fasttify.com" style={menu.text}>
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

export default OrderStatusUpdateEmail;

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

const updateTitle = {
  ...paragraph,
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '16px',
  color: '#333',
};

const statusText = {
  previous: {
    ...paragraph,
    fontSize: '14px',
    color: '#999',
    fontStyle: 'italic',
  },
  new: {
    ...paragraph,
    fontSize: '14px',
    color: '#28a745',
    fontWeight: '600',
  },
  arrow: {
    ...paragraph,
    fontSize: '20px',
    color: '#666',
    fontWeight: 'bold',
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
