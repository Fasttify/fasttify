import { BlockStack, InlineStack, Text, Card, Badge, Icon, IconSource } from '@shopify/polaris';
import { PageClockFilledIcon, CheckIcon, ClockIcon, AlertTriangleIcon, UndoIcon } from '@shopify/polaris-icons';
import type { ICheckoutSession } from '@/app/store/hooks/data/useCheckoutSessions';
import { formatDate } from '../../utils/checkout-utils';

interface CheckoutTimelineProps {
  checkout: ICheckoutSession;
}

export function CheckoutTimeline({ checkout }: CheckoutTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckIcon />;
      case 'expired':
        return <ClockIcon />;
      case 'cancelled':
        return <UndoIcon />;
      case 'open':
      default:
        return <AlertTriangleIcon />;
    }
  };

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'expired':
        return 'warning';
      case 'cancelled':
        return 'critical';
      case 'open':
      default:
        return 'info';
    }
  };

  const timelineEvents = [
    {
      id: 'created',
      title: 'Checkout Creado',
      description: 'La sesión de checkout fue iniciada',
      date: checkout.createdAt,
      icon: <PageClockFilledIcon />,
      tone: 'info' as const,
    },
    {
      id: 'updated',
      title: 'Última Actualización',
      description: 'El checkout fue modificado por última vez',
      date: checkout.updatedAt,
      icon: <PageClockFilledIcon />,
      tone: 'info' as const,
      show: !!checkout.updatedAt && checkout.updatedAt !== checkout.createdAt,
    },
    {
      id: 'status',
      title: `Estado: ${checkout.status}`,
      description: `El checkout está actualmente ${checkout.status}`,
      date: checkout.updatedAt || checkout.createdAt,
      icon: getStatusIcon(checkout.status ?? ''),
      tone: getStatusTone(checkout.status ?? '') as any,
      show: true,
    },
    {
      id: 'expires',
      title: 'Expiración',
      description: 'Fecha límite para completar el checkout',
      date: checkout.expiresAt,
      icon: <ClockIcon />,
      tone: 'warning' as const,
      show: checkout.status === 'open',
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
                  <Icon source={event.icon as unknown as IconSource} />
                </div>

                {/* Contenido del evento */}
                <div className="flex-1 min-w-0">
                  {/* Desktop: título y badge en línea */}
                  <div className="hidden sm:block">
                    <InlineStack gap="200" blockAlign="center">
                      <Text variant="bodyMd" fontWeight="medium" as="span">
                        {event.title}
                      </Text>
                      <Badge tone={event.tone} size="small">
                        {event.date ? formatDate(event.date) : 'N/A'}
                      </Badge>
                    </InlineStack>
                  </div>

                  {/* Móvil: título y badge apilados */}
                  <div className="block sm:hidden">
                    <BlockStack gap="100">
                      <Text variant="bodyMd" fontWeight="medium" as="span">
                        {event.title}
                      </Text>
                      <Badge tone={event.tone} size="small">
                        {event.date ? formatDate(event.date) : 'N/A'}
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
        {checkout.status === 'open' && (
          <Card background="bg-surface-secondary">
            <BlockStack gap="200">
              <Text variant="bodySm" fontWeight="medium" as="span">
                Estado Actual: Abierto
              </Text>
              <Text variant="bodySm" tone="subdued" as="span">
                El cliente puede continuar con el proceso de pago hasta que expire.
              </Text>
            </BlockStack>
          </Card>
        )}

        {checkout.status === 'completed' && (
          <Card background="bg-surface-success">
            <BlockStack gap="200">
              <Text variant="bodySm" fontWeight="medium" tone="success" as="span">
                Estado Actual: Completado
              </Text>
              <Text variant="bodySm" tone="success" as="span">
                El checkout fue completado exitosamente.
              </Text>
            </BlockStack>
          </Card>
        )}

        {checkout.status === 'expired' && (
          <Card background="bg-surface-warning">
            <BlockStack gap="200">
              <Text variant="bodySm" fontWeight="medium" tone="critical" as="span">
                Estado Actual: Expirado
              </Text>
              <Text variant="bodySm" tone="critical" as="span">
                El checkout expiró y ya no está disponible para el cliente.
              </Text>
            </BlockStack>
          </Card>
        )}

        {checkout.status === 'cancelled' && (
          <Card background="bg-surface-critical">
            <BlockStack gap="200">
              <Text variant="bodySm" fontWeight="medium" tone="critical" as="span">
                Estado Actual: Cancelado
              </Text>
              <Text variant="bodySm" tone="critical" as="span">
                El checkout fue cancelado y no se puede procesar.
              </Text>
            </BlockStack>
          </Card>
        )}
      </BlockStack>
    </Card>
  );
}
