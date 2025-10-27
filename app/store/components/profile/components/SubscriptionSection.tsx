import { Card, Text, Button, Banner, SkeletonBodyText, Icon } from '@shopify/polaris';
import { ExternalIcon, CheckCircleIcon } from '@shopify/polaris-icons';
import { useState, memo } from 'react';
import { plans } from '@/app/(www)/pricing/components/plans';
import type { UserProps } from '@/app/store/components/profile/types';
import { useSubscriptionLogic } from '@/app/store/hooks/utils/useSubscriptionLogic';

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
const SubscriptionSectionComponent = ({ user, loading }: SubscriptionSectionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { subscriptionLoading, hasRealSubscription, isPaidPlan, currentPlan } = useSubscriptionLogic(user?.userId);

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
      // Usar hasRealSubscription del hook para determinar la acción
      if (hasRealSubscription) {
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

  if (loading || !user || subscriptionLoading) {
    return (
      <Card>
        <div style={{ padding: '20px' }}>
          <SkeletonBodyText lines={5} />
        </div>
      </Card>
    );
  }

  // Los valores ya vienen del hook

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

        {isPaidPlan && !hasRealSubscription && (
          <div style={{ marginBottom: '12px' }}>
            <Banner tone="warning">
              <p>Tienes un plan de prueba. Para gestionar tu suscripción, primero actualiza a un plan premium.</p>
            </Banner>
          </div>
        )}

        <Button
          icon={ExternalIcon}
          onClick={handleRedirectToPolarsh}
          loading={isSubmitting}
          variant={hasRealSubscription ? undefined : 'primary'}
          size="slim"
          fullWidth>
          {isSubmitting ? 'Redirigiendo...' : hasRealSubscription ? 'Gestionar suscripción' : 'Actualizar plan'}
        </Button>

        <div style={{ marginTop: '12px' }}>
          <Text variant="bodySm" as="p" tone="subdued">
            Serás redirigido a Polarsh para gestionar tu suscripción de forma segura.
          </Text>
        </div>
      </div>
    </Card>
  );
};

export const SubscriptionSection = memo(SubscriptionSectionComponent);
