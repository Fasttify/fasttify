import { Card, Text, Button, Banner, SkeletonBodyText, Icon } from '@shopify/polaris';
import { ExternalIcon, CheckCircleIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { post } from 'aws-amplify/api';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import type { UserProps } from '@/app/store/components/profile/types';

// Configurar Amplify para la API REST
Amplify.configure(outputs);
const existingConfig = Amplify.getConfig();
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
});

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
      const defaultPlanId = '149c6595-1611-477d-b0b4-61700d33c069';

      const response = await post({
        apiName: 'SubscriptionApi',
        path: 'subscribe',
        options: {
          body: {
            userId: user.userId,
            email: user.email,
            name: user.nickName,
            plan: {
              polarId: defaultPlanId,
            },
          },
        },
      });

      const { body } = await response.response;
      const responseUrl = (await body.json()) as { checkoutUrl?: string };

      if (responseUrl && responseUrl.checkoutUrl) {
        window.location.href = responseUrl.checkoutUrl;
      } else {
        console.warn('No checkout URL received.');
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
