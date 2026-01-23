import { useEffect, useCallback, useMemo } from 'react';
import { Modal } from '@shopify/polaris';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@shopify/polaris-icons';
import { useConnectModal } from '@/app/store/components/app-integration/hooks/useConnectModal';
import { IntroStep } from '@/app/store/components/app-integration/components/steps/IntroStep';
import { ConfigStep } from '@/app/store/components/app-integration/components/steps/ConfigStep';
import { SuccessStep } from '@/app/store/components/app-integration/components/steps/SuccessStep';
import { ConnectModalProps } from '@/app/store/components/app-integration/constants/connectModal';

export function ConnectModal({ open, onOpenChange }: ConnectModalProps) {
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  const {
    step,
    setStep,
    option,
    setOption,
    apiKey,
    setApiKey,
    status,
    setStatus,
    errorMessage,
    resetState,
    handleApiKeyConnection,
  } = useConnectModal(handleClose);

  useEffect(() => {
    if (open) setStep(3);
  }, [open, setStep]);

  const handleNext = useCallback(async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2 && option === 'existing') {
      if (await handleApiKeyConnection()) {
        setStep(3);
      }
    }
  }, [step, option, handleApiKeyConnection, setStep]);

  const handleBack = useCallback(() => {
    if (step === 2) {
      setStep(1);
      setOption(null);
    } else if (step === 3) {
      setStep(2);
      setStatus('idle');
    }
  }, [step, setStep, setOption, setStatus]);

  const handleModalChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) setTimeout(resetState, 300);
      onOpenChange(newOpen);
    },
    [onOpenChange, resetState]
  );

  const stepContent = useMemo(() => {
    switch (step) {
      case 1:
        return <IntroStep />;
      case 2:
        return (
          <ConfigStep
            option={option}
            onOptionChange={setOption}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            status={status}
            errorMessage={errorMessage}
          />
        );
      case 3:
        return <SuccessStep />;
      default:
        return null;
    }
  }, [step, option, setOption, apiKey, setApiKey, status, errorMessage]);

  const nextButtonDisabled = useMemo(
    () => (step === 2 && !option) || (step === 2 && option === 'existing' && !apiKey) || status === 'loading',
    [step, option, apiKey, status]
  );

  const getNextButtonContent = (): string => {
    if (step === 1) return 'Continuar';
    return 'Conectar';
  };

  const primaryAction =
    step < 3
      ? {
          content: getNextButtonContent(),
          onAction: handleNext,
          disabled: nextButtonDisabled,
          icon: ArrowRightIcon,
        }
      : {
          content: 'Finalizar',
          onAction: handleClose,
          icon: CheckIcon,
          variant: 'primary',
        };

  const secondaryActions =
    step > 1
      ? [
          {
            content: 'Atrás',
            onAction: handleBack,
            disabled: status === 'loading',
            icon: ArrowLeftIcon,
          },
        ]
      : undefined;

  return (
    <Modal
      open={open}
      onClose={() => handleModalChange(false)}
      title={'Conectar con Master Shop'}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}>
      <Modal.Section>{stepContent}</Modal.Section>
    </Modal>
  );
}
