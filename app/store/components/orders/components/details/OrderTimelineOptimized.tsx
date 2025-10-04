import { BlockStack, InlineStack, Text, Card, Badge, Icon } from '@shopify/polaris';
import {
  PageClockFilledIcon,
  DeliveryIcon,
  UndoIcon,
  InfoIcon,
  OrderDraftFilledIcon,
  CreditCardIcon,
  LocationIcon,
} from '@shopify/polaris-icons';
import { memo } from 'react';
import type { ProcessedTimelineEvent } from '@/app/store/components/orders/types/util-type';
import { formatDate } from '@/app/store/components/orders/utils/order-utils';

interface OrderTimelineOptimizedProps {
  timelineEvents: ProcessedTimelineEvent[];
  status: string;
  paymentStatus: string;
}

export const OrderTimelineOptimized = memo(function OrderTimelineOptimized({
  timelineEvents,
  status,
  paymentStatus,
}: OrderTimelineOptimizedProps) {
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'PageClockFilledIcon':
        return PageClockFilledIcon;
      case 'DeliveryIcon':
        return DeliveryIcon;
      case 'UndoIcon':
        return UndoIcon;
      case 'InfoIcon':
        return InfoIcon;
      case 'OrderDraftFilledIcon':
        return OrderDraftFilledIcon;
      case 'CreditCardIcon':
        return CreditCardIcon;
      case 'LocationIcon':
        return LocationIcon;
      default:
        return InfoIcon;
    }
  };

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

              {/* Layout responsivo para el evento */}
              <div className="flex gap-3 items-start">
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
                    flexShrink: 0,
                  }}>
                  <Icon source={getIconComponent(event.icon)} />
                </div>

                {/* Contenido del evento */}
                <div className="flex-1 min-w-0">
                  {/* Desktop: título y badge en línea */}
                  <div className="hidden sm:block">
                    <InlineStack gap="200" blockAlign="center">
                      <Text variant="bodyMd" fontWeight="medium" as="span">
                        {event.title}
                      </Text>
                      <Badge tone={event.tone as any} size="small">
                        {formatDate(event.date)}
                      </Badge>
                    </InlineStack>
                  </div>

                  {/* Móvil: título y badge apilados */}
                  <div className="block sm:hidden">
                    <BlockStack gap="100">
                      <Text variant="bodyMd" fontWeight="medium" as="span">
                        {event.title}
                      </Text>
                      <Badge tone={event.tone as any} size="small">
                        {formatDate(event.date)}
                      </Badge>
                    </BlockStack>
                  </div>

                  <div style={{ marginTop: '4px' }}>
                    <Text variant="bodySm" tone="subdued" as="span">
                      {event.description}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </BlockStack>

        {/* Información adicional del estado */}
        {status === 'pending' && (
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

        {status === 'processing' && (
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

        {status === 'shipped' && (
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

        {status === 'delivered' && (
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

        {status === 'cancelled' && (
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
        {paymentStatus === 'pending' && (
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

        {paymentStatus === 'paid' && (
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

        {paymentStatus === 'failed' && (
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
});
