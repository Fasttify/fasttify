import { Card, Text, Button, Banner, SkeletonBodyText, Icon } from '@shopify/polaris';
import { ExternalIcon, CheckCircleIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { plans } from '@/app/(www)/pricing/components/plans';
import type { UserProps } from '@/app/store/components/profile/types';

interface SubscriptionSectionProps extends UserProps {
  storeId: string;
}

/**
 * Componente para mostrar y gestionar la suscripción del usuario
 *
 * @component
 * @param {SubscriptionSectionProps} props - Propiedades del componente
 * @returns {JSX.Element} Sección de suscripción con redirección a Polarsh
 */
export function SubscriptionSection({ user, loading }: SubscriptionSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Maneja la redirección a Polarsh para gestionar la suscripción
   */
  const handleRedirectToPolarsh = async () => {
    if (!user?.userId || !user?.email || !user?.nickName) {
      console.error('User information is incomplete.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Si el usuario tiene un plan pagado, ir al portal de gestión
      // Si no, ir al checkout para suscribirse
      const isPaidPlan = user.plan && user.plan !== 'Gratuito';

      if (isPaidPlan) {
        // Redirigir al customer portal
        const portalUrl = new URL('/api/portal', window.location.origin);
        portalUrl.searchParams.set('customerExternalId', user.userId);
        window.location.href = portalUrl.toString();
      } else {
        // Redirigir al checkout con el plan popular
        const selectedPlan = plans.find((p) => p.popular) || plans[0];
        const defaultPlanId = selectedPlan?.polarId;

        if (!defaultPlanId) {
          console.error('No default plan available to subscribe.');
          return;
        }

        const checkoutUrl = new URL('/api/checkout', window.location.origin);
        checkoutUrl.searchParams.set('products', defaultPlanId);
        checkoutUrl.searchParams.set('customerExternalId', user.userId);
        checkoutUrl.searchParams.set('customerEmail', user.email);
        checkoutUrl.searchParams.set('customerName', user.nickName);

        window.location.href = checkoutUrl.toString();
      }
    } catch (error) {
      console.error('Error redirecting to Polarsh:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ padding: '20px' }}>
          <SkeletonBodyText lines={5} />
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <div style={{ padding: '20px' }}>
          <Text variant="headingMd" as="h3">
            No se pudo cargar la información de suscripción
          </Text>
        </div>
      </Card>
    );
  }

  const currentPlan = user.plan || 'Gratuito';
  const isPaidPlan = currentPlan !== 'Gratuito';

  return (
    <Card>
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <Text variant="headingMd" as="h3">
            Suscripción
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <Text variant="bodyMd" as="p" fontWeight="semibold">
              Plan actual
            </Text>
            <Text variant="bodyMd" as="p">
              {currentPlan}
            </Text>
          </div>

          {isPaidPlan && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                flexShrink: 0,
              }}>
              <Icon source={CheckCircleIcon} tone="success" />
              <Text variant="bodySm" as="span" tone="success" fontWeight="medium">
                Activo
              </Text>
            </div>
          )}
        </div>

        {!isPaidPlan && (
          <div style={{ marginBottom: '12px' }}>
            <Banner tone="info">
              <p>Estás usando el plan gratuito. Actualiza tu plan para acceder a más funcionalidades.</p>
            </Banner>
          </div>
        )}

        <Button
          icon={ExternalIcon}
          onClick={handleRedirectToPolarsh}
          loading={isSubmitting}
          variant={isPaidPlan ? undefined : 'primary'}
          size="slim"
          fullWidth>
          {isSubmitting ? 'Redirigiendo...' : isPaidPlan ? 'Gestionar suscripción' : 'Actualizar plan'}
        </Button>

        <div style={{ marginTop: '12px' }}>
          <Text variant="bodySm" as="p" tone="subdued">
            Serás redirigido a Polarsh para gestionar tu suscripción de forma segura.
          </Text>
        </div>
      </div>
    </Card>
  );
}
