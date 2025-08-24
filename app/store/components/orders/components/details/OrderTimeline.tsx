import { BlockStack, InlineStack, Text, Card, Badge, Icon, IconSource } from '@shopify/polaris';
import {
  PageClockFilledIcon,
  DeliveryIcon,
  UndoIcon,
  InfoIcon,
  OrderDraftFilledIcon,
  CreditCardIcon,
  LocationIcon,
} from '@shopify/polaris-icons';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import { formatDate } from '../../utils/order-utils';

interface OrderTimelineProps {
  order: IOrder;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return OrderDraftFilledIcon;
      case 'processing':
        return InfoIcon;
      case 'shipped':
      case 'delivered':
        return DeliveryIcon;
      case 'cancelled':
        return UndoIcon;
      default:
        return InfoIcon;
    }
  };

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'processing':
        return 'info';
      case 'shipped':
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'critical';
      case 'pending':
      default:
        return 'warning';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return CreditCardIcon;
      case 'pending':
        return PageClockFilledIcon;
      case 'failed':
        return UndoIcon;
      case 'refunded':
        return UndoIcon;
      default:
        return InfoIcon;
    }
  };

  const getPaymentStatusTone = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'critical';
      case 'refunded':
        return 'info';
      default:
        return 'info';
    }
  };

  const timelineEvents = [
    {
      id: 'created',
      title: 'Orden Creada',
      description: 'La orden fue creada exitosamente',
      date: order.createdAt,
      icon: <PageClockFilledIcon />,
      tone: 'info' as const,
    },
    {
      id: 'customer',
      title: 'Cliente Registrado',
      description: `Cliente ${order.customerType === 'guest' ? 'invitado' : 'registrado'} agregado`,
      date: order.createdAt,
      icon: <PageClockFilledIcon />,
      tone: 'info' as const,
    },
    {
      id: 'payment_method',
      title: 'Método de Pago Seleccionado',
      description: `Método: ${order.paymentMethod || 'No especificado'}`,
      date: order.createdAt,
      icon: <CreditCardIcon />,
      tone: 'info' as const,
    },
    {
      id: 'shipping_address',
      title: 'Dirección de Envío Configurada',
      description: 'Dirección de envío configurada para la orden',
      date: order.createdAt,
      icon: <LocationIcon />,
      tone: 'info' as const,
    },
    {
      id: 'updated',
      title: 'Última Actualización',
      description: 'La orden fue modificada por última vez',
      date: order.updatedAt,
      icon: <PageClockFilledIcon />,
      tone: 'info' as const,
      show: !!order.updatedAt && order.updatedAt !== order.createdAt,
    },
    {
      id: 'status',
      title: `Estado: ${order.status}`,
      description: `La orden está actualmente ${order.status}`,
      date: order.updatedAt || order.createdAt,
      icon: getStatusIcon(order.status || ''),
      tone: getStatusTone(order.status || '') as any,
      show: true,
    },
    {
      id: 'payment_status',
      title: `Estado del Pago: ${order.paymentStatus}`,
      description: `El pago está ${order.paymentStatus}`,
      date: order.updatedAt || order.createdAt,
      icon: getPaymentStatusIcon(order.paymentStatus || ''),
      tone: getPaymentStatusTone(order.paymentStatus || '') as any,
      show: true,
    },
  ].filter((event) => event.show !== false);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack gap="300" blockAlign="start">
          <div style={{ marginTop: '2px' }}>
            <Icon source={PageClockFilledIcon} />
          </div>
          <Text as="h3" variant="headingMd" fontWeight="semibold">
            Línea de Tiempo
          </Text>
        </InlineStack>

        <BlockStack gap="300">
          {timelineEvents.map((event, index) => (
            <div key={event.id} style={{ position: 'relative' }}>
              {/* Línea conectora */}
              {index < timelineEvents.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '32px',
                    width: '2px',
                    height: '24px',
                    backgroundColor: 'var(--p-border-subdued)',
                  }}
                />
              )}

              <InlineStack gap="300" blockAlign="start">
                {/* Icono del evento */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--p-surface)',
                    border: '2px solid var(--p-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}>
                  <Icon source={event.icon as unknown as IconSource} />
                </div>

                {/* Contenido del evento */}
                <BlockStack gap="100">
                  <InlineStack gap="200" blockAlign="center">
                    <Text variant="bodyMd" fontWeight="medium" as="span">
                      {event.title}
                    </Text>
                    <Badge tone={event.tone} size="small">
                      {event.date ? formatDate(event.date) : 'N/A'}
                    </Badge>
                  </InlineStack>
                  <Text variant="bodySm" tone="subdued" as="span">
                    {event.description}
                  </Text>
                </BlockStack>
              </InlineStack>
            </div>
          ))}
        </BlockStack>

        {/* Información adicional del estado */}
        {order.status === 'pending' && (
          <Card background="bg-surface-secondary">
            <BlockStack gap="200">
              <Text variant="bodySm" fontWeight="medium" as="span">
                Estado Actual: Pendiente
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                La orden está pendiente de procesamiento. El cliente ha completado la compra pero aún no se ha
                procesado.
              </Text>
            </BlockStack>
          </Card>
        )}

        {order.status === 'processing' && (
          <Card background="bg-surface-info">
            <BlockStack gap="200">
              <Text variant="bodySm" fontWeight="medium" tone="subdued" as="span">
                Estado Actual: Procesando
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                La orden está siendo procesada. Se está preparando para el envío.
              </Text>
            </BlockStack>
          </Card>
        )}

        {order.status === 'shipped' && (
          <Card background="bg-surface-success">
            <BlockStack gap="200">
              <Text variant="bodySm" fontWeight="medium" tone="success" as="span">
                Estado Actual: Enviado
              </Text>
              <Text variant="bodySm" tone="success" as="span">
                La orden ha sido enviada al cliente. Está en tránsito hacia la dirección de envío.
              </Text>
            </BlockStack>
          </Card>
        )}

        {order.status === 'delivered' && (
          <Card background="bg-surface-success">
            <BlockStack gap="200">
              <Text variant="bodySm" fontWeight="medium" tone="success" as="span">
                Estado Actual: Entregado
              </Text>
              <Text variant="bodySm" tone="success" as="span">
                La orden ha sido entregada exitosamente al cliente en la dirección especificada.
              </Text>
            </BlockStack>
          </Card>
        )}

        {order.status === 'cancelled' && (
          <Card background="bg-surface-critical">
            <BlockStack gap="200">
              <Text variant="bodySm" fontWeight="medium" tone="critical" as="span">
                Estado Actual: Cancelado
              </Text>
              <Text variant="bodySm" tone="critical" as="span">
                La orden fue cancelada y no se puede procesar. Contacta al cliente para más información.
              </Text>
            </BlockStack>
          </Card>
        )}

        {/* Información del estado de pago */}
        {order.paymentStatus === 'pending' && (
          <Card background="bg-surface-warning">
            <BlockStack gap="200">
              <Text variant="bodySm" fontWeight="medium" tone="caution" as="span">
                Estado del Pago: Pendiente
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                El pago de esta orden está pendiente. Verifica el estado del pago con el proveedor.
              </Text>
            </BlockStack>
          </Card>
        )}

        {order.paymentStatus === 'paid' && (
          <Card background="bg-surface-success">
            <BlockStack gap="200">
              <Text variant="bodySm" fontWeight="medium" tone="success" as="span">
                Estado del Pago: Pagado
              </Text>
              <Text variant="bodySm" tone="success" as="span">
                El pago ha sido confirmado y procesado exitosamente.
              </Text>
            </BlockStack>
          </Card>
        )}

        {order.paymentStatus === 'failed' && (
          <Card background="bg-surface-critical">
            <BlockStack gap="200">
              <Text variant="bodySm" fontWeight="medium" tone="critical" as="span">
                Estado del Pago: Fallido
              </Text>
              <Text variant="bodySm" tone="critical" as="span">
                El pago falló. Contacta al cliente para resolver el problema de pago.
              </Text>
            </BlockStack>
          </Card>
        )}
      </BlockStack>
    </Card>
  );
}
