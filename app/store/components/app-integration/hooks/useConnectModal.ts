import { useState, useCallback } from 'react';
import {
  Step,
  Option,
  Status,
  MIN_API_KEY_LENGTH,
} from '@/app/store/components/app-integration/constants/connectModal';

export function useConnectModal(onClose: () => void) {
  const [step, setStep] = useState<Step>(1);
  const [option, setOption] = useState<Option>(null);
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const resetState = useCallback(() => {
    setStep(1);
    setOption(null);
    setApiKey('');
    setStatus('idle');
    setErrorMessage('');
  }, []);

  const validateApiKey = useCallback((key: string) => {
    if (key.length < MIN_API_KEY_LENGTH) {
      setStatus('error');
      setErrorMessage('La API Key proporcionada no es válida. Por favor verifica e intenta nuevamente.');
      return false;
    }
    return true;
  }, []);

  const handleApiKeyConnection = useCallback(async () => {
    if (!validateApiKey(apiKey)) return false;

    setStatus('loading');

    try {
      setStatus('success');
      return true;
    } catch (error) {
      setStatus('error');
      setErrorMessage('Ocurrió un error al guardar la configuración. Por favor intenta nuevamente.');
      console.error('Error saving API Key:', error);
      return false;
    }
  }, [apiKey, validateApiKey]);

  return {
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
  };
}
