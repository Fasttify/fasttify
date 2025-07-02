import { CheckIcon } from '@shopify/polaris-icons';
import { Modal, Text, Button, Box, Card, InlineStack, Badge, BlockStack } from '@shopify/polaris';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/store/context/ToastContext';
import { plans } from '@/app/(main-layout)/pricing/components/plans';
import { faqItems } from '@/app/(main-layout)/pricing/components/FAQItem';
import { Amplify } from 'aws-amplify';
import { post } from 'aws-amplify/api';
import useUserStore from '@/context/core/userStore';
import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs);
const existingConfig = Amplify.getConfig();
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
});

interface PricingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PricingDrawer({ open, onOpenChange }: PricingDrawerProps) {
  const { user } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Modal open={open} onClose={handleClose} title="Elige tu plan" size="large">
        <Modal.Section>
          <Box padding="400">
            <div className="grid gap-8 md:grid-cols-3 grid-rows-1" style={{ gridAutoRows: '520px' }}>
              {plans.map((plan) => (
                <PlanCard
                  key={plan.name}
                  polarId={plan.polarId}
                  title={plan.name}
                  description={plan.description}
                  price={plan.price}
                  features={plan.features}
                  buttonText={plan.buttonText}
                  isPopular={plan.popular}
                  user={user}
                  setIsSubmitting={setIsSubmitting}
                  addToast={showToast}
                  isClient={isClient}
                  isSubmitting={isSubmitting}
                />
              ))}
            </div>
          </Box>
        </Modal.Section>

        <Modal.Section>
          <Box paddingBlock="400" paddingInline="400" maxWidth="100%">
            <BlockStack gap="400" align="center">
              <BlockStack gap="200" align="center">
                <Text variant="bodyMd" tone="subdued" alignment="center" as="p">
                  FAQs
                </Text>
                <Text variant="headingXl" alignment="center" as="h2">
                  Preguntas frecuentes
                </Text>
                <Text variant="bodyLg" tone="subdued" alignment="center" as="p">
                  ¿Tienes dudas sobre nuestros planes? Aquí encontrarás respuestas.
                </Text>
              </BlockStack>

              <BlockStack gap="200">
                {faqItems.map((item, index) => (
                  <Card key={index}>
                    <BlockStack gap="200" align="start">
                      <Text variant="headingMd" as="h3" alignment="start">
                        {item.question}
                      </Text>
                      <Text variant="bodyMd" as="p" tone="subdued" alignment="start">
                        {item.answer}
                      </Text>
                    </BlockStack>
                  </Card>
                ))}
              </BlockStack>
            </BlockStack>
          </Box>
        </Modal.Section>
      </Modal>
    </>
  );
}

interface PlanCardProps {
  polarId: string;
  title: string;
  description: string;
  price: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  user: any;
  setIsSubmitting: (value: boolean) => void;
  addToast: (message: string, isError?: boolean) => void;
  isClient: boolean;
  isSubmitting: boolean;
}

function PlanCard({
  polarId,
  title,
  description,
  price,
  features,
  buttonText,
  isPopular = false,
  user,
  setIsSubmitting,
  addToast,
  isClient,
  isSubmitting,
}: PlanCardProps) {
  const router = useRouter();
  // Format price with thousand separator
  const formattedPrice = parseInt(price).toLocaleString('es-CO');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Usar userId en lugar de cognitoUsername para mantener consistencia
  const userId = user?.userId;
  const userEmail = user?.email;
  const userName = user?.nickName;
  const hasActivePlan = user && user.plan ? user.plan === title : false;

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsButtonDisabled(true);
    setIsSubmitting(true);
    try {
      const restOperation = post({
        apiName: 'SubscriptionApi',
        path: 'subscribe',
        options: {
          body: {
            userId: userId,
            email: userEmail,
            name: userName,
            plan: {
              polarId: polarId,
            },
          },
        },
      });

      const { body } = await restOperation.response;
      const response: any = await body.json();

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        throw new Error('No se recibió URL de checkout');
      }
    } catch (error) {
      console.error('Error al suscribirse:', error);
      addToast('Hubo un error al procesar tu suscripción. Por favor, inténtalo de nuevo.', true);
      setIsSubmitting(false);
      setIsButtonDisabled(false);
    }
  };

  return (
    <div className={`relative h-full ${isPopular ? 'transform scale-105' : ''}`}>
      {/* Badge popular */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge tone="info">Más popular</Badge>
        </div>
      )}

      <Card>
        <div className="h-full p-6 flex flex-col justify-between" style={{ minHeight: '480px', height: '480px' }}>
          {/* Header Section */}
          <div className="text-center mb-8">
            <Text variant="headingLg" as="h3" alignment="center">
              {title}
            </Text>
            <div className="mt-2">
              <Text variant="bodyMd" tone="subdued" as="p" alignment="center">
                {description}
              </Text>
            </div>
          </div>

          {/* Price Section */}
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center gap-1">
              <Text variant="bodyMd" tone="subdued" as="span">
                Desde
              </Text>
            </div>
            <div className="flex items-baseline justify-center gap-1 mt-1">
              <Text variant="headingXl" as="span">
                ${formattedPrice}
              </Text>
              <Text variant="bodyMd" tone="subdued" as="span">
                COP/mes
              </Text>
            </div>
          </div>

          {/* Features Section */}
          <div className="flex-1 mb-8 overflow-hidden">
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <CheckIcon className="w-3 h-3 text-green-600" />
                  </div>
                  <Text variant="bodyMd" as="p" alignment="start">
                    {feature}
                  </Text>
                </div>
              ))}
            </div>
          </div>

          {/* Button Section */}
          <div className="mt-auto">
            <Button
              fullWidth
              variant={isPopular ? 'primary' : 'secondary'}
              size="large"
              disabled={!isClient || isButtonDisabled || hasActivePlan || isSubmitting}
              onClick={handleSubscribe}
              loading={isButtonDisabled || isSubmitting}>
              {hasActivePlan ? 'Plan activo' : isButtonDisabled || isSubmitting ? 'Procesando...' : buttonText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
