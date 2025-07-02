import { LegacyStack, Text, LegacyCard, Icon, Spinner } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';

type Step = 'input' | 'validation' | 'acm-validation' | 'cloudfront' | 'complete';

interface StepProgressProps {
  currentStep: Step;
}

interface StepConfig {
  id: Step;
  label: string;
  description?: string;
}

const steps: StepConfig[] = [
  { id: 'input', label: 'Configuración inicial', description: 'Ingresa tu dominio' },
  { id: 'validation', label: 'Validación de dominio', description: 'Confirma propiedad' },
  { id: 'acm-validation', label: 'Validación SSL', description: 'Configurar certificado' },
  { id: 'cloudfront', label: 'Conectar dominio', description: 'Vincular tu dominio con la tienda' },
  { id: 'complete', label: 'Completado', description: 'Dominio listo' },
];

export function StepProgress({ currentStep }: StepProgressProps) {
  const getStepStatus = (step: Step) => {
    const stepIndex = steps.findIndex((s) => s.id === step);
    const currentIndex = steps.findIndex((s) => s.id === currentStep);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const renderStepIcon = (step: Step) => {
    const status = getStepStatus(step);

    if (status === 'completed') {
      return <Icon source={CheckCircleIcon} tone="success" />;
    }
    if (status === 'active') {
      return <Spinner size="small" />;
    }
    return (
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: '#e1e3e5',
          border: '2px solid #c9cccf',
        }}
      />
    );
  };

  return (
    <LegacyCard sectioned>
      <LegacyStack vertical spacing="tight">
        <Text variant="headingMd" as="h3">
          Progreso de configuración
        </Text>

        <LegacyStack vertical spacing="extraTight">
          {steps.map((step) => {
            const status = getStepStatus(step.id);
            return (
              <LegacyStack key={step.id} alignment="center" spacing="tight">
                {renderStepIcon(step.id)}
                <LegacyStack vertical spacing="none">
                  <Text
                    as="p"
                    variant="bodyMd"
                    tone={status === 'completed' ? 'success' : status === 'active' ? 'base' : 'subdued'}
                    fontWeight={status === 'active' ? 'semibold' : 'regular'}>
                    {step.label}
                  </Text>
                  {step.description && (
                    <Text as="p" variant="bodySm" tone="subdued">
                      {step.description}
                    </Text>
                  )}
                </LegacyStack>
              </LegacyStack>
            );
          })}
        </LegacyStack>
      </LegacyStack>
    </LegacyCard>
  );
}
